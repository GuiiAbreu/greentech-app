import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authMiddleware, AuthRequest } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

export const ordersRoutes = Router();

ordersRoutes.use(authMiddleware);

/**
 * ==========================
 * CONSUMER
 * ==========================
 */

// Criar pedido (1 farmer apenas)
ordersRoutes.post("/", requireRole("CONSUMER"), async (req: AuthRequest, res) => {
  const schema = z.object({
    deliveryMethod: z.enum(["DELIVERY", "PICKUP"]),
    note: z.string().max(500).optional(),
    items: z
      .array(
        z.object({
          productId: z.string().uuid(),
          qty: z.number().int().min(1).max(999),
        })
      )
      .min(1),
  });

  const data = schema.parse(req.body);

  // Buscar produtos e validar
  const productIds = [...new Set(data.items.map((i) => i.productId))];

  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, active: true },
    select: {
      id: true,
      farmerId: true,
      name: true,
      priceCents: true,
      stockQty: true,
    },
  });

  if (products.length !== productIds.length) {
    return res.status(400).json({ message: "One or more products are invalid/inactive" });
  }

  // Regra: pedido só pode ser de 1 farmer
  const farmerId = products[0].farmerId;
  const allSameFarmer = products.every((p) => p.farmerId === farmerId);
  if (!allSameFarmer) {
    return res.status(400).json({ message: "Order must contain products from only one farmer" });
  }

  // Validar estoque (sem baixar estoque automaticamente — apenas valida)
  const qtyById = new Map(data.items.map((i) => [i.productId, i.qty]));
  for (const p of products) {
    const qty = qtyById.get(p.id) ?? 0;
    if (qty > p.stockQty) {
      return res.status(400).json({
        message: `Insufficient stock for product: ${p.name}`,
        productId: p.id,
        available: p.stockQty,
        requested: qty,
      });
    }
  }

  // Montar itens com snapshot + subtotal
  const orderItems = products.map((p) => {
    const qty = qtyById.get(p.id)!;
    const lineTotalCents = p.priceCents * qty;

    return {
      productId: p.id,
      productName: p.name,
      unitPriceCents: p.priceCents,
      qty,
      lineTotalCents,
    };
  });

  const subtotalCents = orderItems.reduce((acc, i) => acc + i.lineTotalCents, 0);

  const order = await prisma.order.create({
    data: {
      consumerId: req.user!.id,
      farmerId,
      deliveryMethod: data.deliveryMethod,
      note: data.note ?? null,
      subtotalCents,
      items: { create: orderItems },
    },
    include: {
      items: true,
      farmer: {
        select: {
          id: true,
          name: true,
          phone: true,
          city: true,
          farmerProfile: { select: { propertyName: true, address: true } },
        },
      },
      consumer: { select: { id: true, name: true, phone: true, city: true } },
    },
  });

  return res.status(201).json(order);
});

// Histórico do consumidor (pode filtrar por status=em_andamento/concluidos no mobile)
ordersRoutes.get("/mine", requireRole("CONSUMER"), async (req: AuthRequest, res) => {
  const querySchema = z.object({
    status: z.enum(["PENDING", "CONFIRMED", "DONE", "CANCELED"]).optional(),
  });
  const q = querySchema.parse(req.query);

  const orders = await prisma.order.findMany({
    where: {
      consumerId: req.user!.id,
      status: q.status,
    },
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      farmer: {
        select: {
          id: true,
          name: true,
          phone: true,
          city: true,
          farmerProfile: { select: { propertyName: true } },
        },
      },
    },
  });

  const normalized = orders.map((o) => ({
    ...o,
    farmer: {
      id: o.farmer.id,
      name: o.farmer.name,
      phone: o.farmer.phone,
      city: o.farmer.city,
      propertyName: o.farmer.farmerProfile?.propertyName ?? null,
    },
  }));

  return res.json(normalized);
});

// Detalhe do pedido (consumer)
ordersRoutes.get("/:id", requireRole("CONSUMER"), async (req: AuthRequest, res) => {
  const id = z.string().uuid().parse(req.params.id);

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      farmer: {
        select: {
          id: true,
          name: true,
          phone: true,
          city: true,
          farmerProfile: { select: { propertyName: true, address: true } },
        },
      },
      consumer: { select: { id: true, name: true, phone: true, city: true } },
    },
  });

  if (!order) return res.status(404).json({ message: "Order not found" });
  if (order.consumerId !== req.user!.id) return res.status(403).json({ message: "Forbidden" });

  return res.json({
    ...order,
    farmer: {
      id: order.farmer.id,
      name: order.farmer.name,
      phone: order.farmer.phone,
      city: order.farmer.city,
      propertyName: order.farmer.farmerProfile?.propertyName ?? null,
      address: order.farmer.farmerProfile?.address ?? null,
    },
  });
});

/**
 * ==========================
 * FARMER
 * ==========================
 */

// Pedidos recebidos pelo agricultor
ordersRoutes.get("/inbox/list", requireRole("FARMER"), async (req: AuthRequest, res) => {
  const querySchema = z.object({
    status: z.enum(["PENDING", "CONFIRMED", "DONE", "CANCELED"]).optional(),
  });
  const q = querySchema.parse(req.query);

  const orders = await prisma.order.findMany({
    where: {
      farmerId: req.user!.id,
      status: q.status,
    },
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      consumer: { select: { id: true, name: true, phone: true, city: true } },
    },
  });

  return res.json(orders);
});

// Atualizar status (accept/finish/cancel)
ordersRoutes.patch("/:id/status", requireRole("FARMER"), async (req: AuthRequest, res) => {
  const paramsSchema = z.object({ id: z.string().uuid() });
  const bodySchema = z.object({
    status: z.enum(["CONFIRMED", "DONE", "CANCELED"]),
  });

  const { id } = paramsSchema.parse(req.params);
  const { status } = bodySchema.parse(req.body);

  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ message: "Order not found" });
  if (existing.farmerId !== req.user!.id) return res.status(403).json({ message: "Forbidden" });

  // Regras simples de transição (opcional, mas ajuda)
  // PENDING -> CONFIRMED/DONE/CANCELED
  // CONFIRMED -> DONE/CANCELED
  // DONE/CANCELED -> (não muda)
  const current = existing.status;

  if (current === "DONE" || current === "CANCELED") {
    return res.status(400).json({ message: `Order already ${current}` });
  }
  if (current === "PENDING" && status === "DONE") {
    // pode permitir, mas geralmente não faz sentido. Mantive bloqueado.
    return res.status(400).json({ message: "Cannot set DONE before CONFIRMED" });
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status },
    include: {
      items: true,
      consumer: { select: { id: true, name: true, phone: true, city: true } },
      farmer: {
        select: {
          id: true,
          name: true,
          phone: true,
          city: true,
          farmerProfile: { select: { propertyName: true, address: true } },
        },
      },
    },
  });

  return res.json(updated);
});
