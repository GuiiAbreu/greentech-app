import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authMiddleware, AuthRequest } from "../middlewares/auth.middleware.js";

export const ordersRoutes = Router();

ordersRoutes.use(authMiddleware);

const deliveryMethodSchema = z.enum(["DELIVERY", "PICKUP"]);
const orderStatusSchema = z.enum(["PENDING", "CONFIRMED", "DONE", "CANCELED"]);

// Helpers
function normalizeFarmer(farmer: {
  id: string;
  name: string;
  phone: string;
  city: string;
  farmerProfile: { propertyName: string; address: string } | null;
}) {
  return {
    id: farmer.id,
    name: farmer.name,
    phone: farmer.phone,
    city: farmer.city,
    propertyName: farmer.farmerProfile?.propertyName ?? null,
    address: farmer.farmerProfile?.address ?? null,
  };
}

/**
 * ==========================
 * CONSUMER - Criar pedido (1 farmer)
 * POST /orders
 * ==========================
 */
ordersRoutes.post("/", async (req: AuthRequest, res) => {
  if (req.user!.role !== "CONSUMER") return res.status(403).json({ message: "Forbidden" });

  const schema = z.object({
    deliveryMethod: deliveryMethodSchema,
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

  // Buscar produtos ativos
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
  if (!products.every((p) => p.farmerId === farmerId)) {
    return res.status(400).json({ message: "Order must contain products from only one farmer" });
  }

  // Validar estoque (sem dar baixa no estoque: apenas valida)
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

  return res.status(201).json({
    ...order,
    farmer: normalizeFarmer({ ...order.farmer, farmerProfile: order.farmer.farmerProfile ?? null }),
  });
});

/**
 * ==========================
 * CONSUMER - Histórico
 * GET /orders/mine?status=PENDING|CONFIRMED|DONE|CANCELED
 * ==========================
 */
ordersRoutes.get("/mine", async (req: AuthRequest, res) => {
  if (req.user!.role !== "CONSUMER") return res.status(403).json({ message: "Forbidden" });

  const querySchema = z.object({
    status: orderStatusSchema.optional(),
  });
  const q = querySchema.parse(req.query);

  const orders = await prisma.order.findMany({
    where: { consumerId: req.user!.id, status: q.status },
    orderBy: { createdAt: "desc" },
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
    },
  });

  return res.json(
    orders.map((o) => ({
      ...o,
      farmer: normalizeFarmer({ ...o.farmer, farmerProfile: o.farmer.farmerProfile ?? null }),
    }))
  );
});

/**
 * ==========================
 * FARMER - Inbox (pedidos recebidos)
 * GET /orders/inbox?status=PENDING|CONFIRMED|DONE|CANCELED
 * ==========================
 *
 * IMPORTANTE: esta rota precisa vir ANTES de "/:id"
 */
ordersRoutes.get("/inbox", async (req: AuthRequest, res) => {
  if (req.user!.role !== "FARMER") return res.status(403).json({ message: "Forbidden" });

  const querySchema = z.object({
    status: orderStatusSchema.optional(),
  });
  const q = querySchema.parse(req.query);

  const orders = await prisma.order.findMany({
    where: { farmerId: req.user!.id, status: q.status },
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      consumer: { select: { id: true, name: true, phone: true, city: true } },
    },
  });

  return res.json(orders);
});

/**
 * ==========================
 * DETALHE DO PEDIDO (CONSUMER OU FARMER)
 * GET /orders/:id
 * ==========================
 */
ordersRoutes.get("/:id", async (req: AuthRequest, res) => {
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

  // Permissão: só o consumer dono ou o farmer dono
  const isOwner = order.consumerId === req.user!.id || order.farmerId === req.user!.id;
  if (!isOwner) return res.status(403).json({ message: "Forbidden" });

  return res.json({
    ...order,
    farmer: normalizeFarmer({ ...order.farmer, farmerProfile: order.farmer.farmerProfile ?? null }),
  });
});

/**
 * ==========================
 * FARMER - Atualizar status
 * PATCH /orders/:id/status
 * body: { status: "CONFIRMED" | "DONE" | "CANCELED" }
 * ==========================
 */
ordersRoutes.patch("/:id/status", async (req: AuthRequest, res) => {
  if (req.user!.role !== "FARMER") return res.status(403).json({ message: "Forbidden" });

  const paramsSchema = z.object({ id: z.string().uuid() });
  const bodySchema = z.object({
    status: z.enum(["CONFIRMED", "DONE", "CANCELED"]),
  });

  const { id } = paramsSchema.parse(req.params);
  const { status } = bodySchema.parse(req.body);

  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ message: "Order not found" });
  if (existing.farmerId !== req.user!.id) return res.status(403).json({ message: "Forbidden" });

  // Regras simples de transição
  // PENDING -> CONFIRMED | CANCELED
  // CONFIRMED -> DONE | CANCELED
  // DONE/CANCELED -> não muda
  const current = existing.status;

  if (current === "DONE" || current === "CANCELED") {
    return res.status(400).json({ message: `Order already ${current}` });
  }
  if (current === "PENDING" && status === "DONE") {
    return res.status(400).json({ message: "Cannot set DONE before CONFIRMED" });
  }
  if (current === "CONFIRMED" && status === "CONFIRMED") {
    return res.status(400).json({ message: "Order is already CONFIRMED" });
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status },
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

  return res.json({
    ...updated,
    farmer: normalizeFarmer({ ...updated.farmer, farmerProfile: updated.farmer.farmerProfile ?? null }),
  });
});
