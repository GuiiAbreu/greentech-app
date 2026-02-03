import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authMiddleware, AuthRequest } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

export const productsRoutes = Router();

productsRoutes.use(authMiddleware);
productsRoutes.use(requireRole("FARMER"));

const createSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(2),
  category: z.enum(["FRUTAS", "HORTALICAS", "LATICINIOS", "OVOS", "GRAOS"]),
  priceCents: z.number().int().nonnegative(),
  unit: z.enum(["BANDEJA", "KG", "UNIDADE", "MACO"]),
  stockQty: z.number().int().nonnegative(),
  photoUrls: z.array(z.string().url()).max(6).optional(),
});

productsRoutes.post("/", async (req: AuthRequest, res) => {
  const data = createSchema.parse(req.body);

  const product = await prisma.product.create({
    data: {
      farmerId: req.user!.id,
      name: data.name,
      description: data.description,
      category: data.category,
      priceCents: data.priceCents,
      unit: data.unit,
      stockQty: data.stockQty,
      photos: data.photoUrls?.length
        ? { create: data.photoUrls.map((url) => ({ url })) }
        : undefined,
    },
    include: { photos: true },
  });

  return res.status(201).json(product);
});

productsRoutes.get("/mine", async (req: AuthRequest, res) => {
  const products = await prisma.product.findMany({
    where: { farmerId: req.user!.id },
    orderBy: { createdAt: "desc" },
    include: { photos: true, certs: true },
  });

  return res.json(products);
});

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().min(2).optional(),
  category: z.enum(["FRUTAS", "HORTALICAS", "LATICINIOS", "OVOS", "GRAOS"]).optional(),
  priceCents: z.number().int().nonnegative().optional(),
  unit: z.enum(["BANDEJA", "KG", "UNIDADE", "MACO"]).optional(),
  stockQty: z.number().int().nonnegative().optional(),
  active: z.boolean().optional(),
  // substitui TODAS as fotos do produto (simplifica)
  photoUrls: z.array(z.string().url()).max(6).optional(),
});

productsRoutes.put("/:id", async (req: AuthRequest, res) => {
  const id = z.string().uuid().parse(req.params.id);
  const data = updateSchema.parse(req.body);

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ message: "Product not found" });
  if (existing.farmerId !== req.user!.id) return res.status(403).json({ message: "Forbidden" });

  const updated = await prisma.product.update({
    where: { id },
    data: {
      name: data.name ?? undefined,
      description: data.description ?? undefined,
      category: data.category ?? undefined,
      priceCents: data.priceCents ?? undefined,
      unit: data.unit ?? undefined,
      stockQty: data.stockQty ?? undefined,
      active: data.active ?? undefined,
      photos: data.photoUrls
        ? {
            deleteMany: {},
            create: data.photoUrls.map((url) => ({ url })),
          }
        : undefined,
    },
    include: { photos: true, certs: true },
  });

  return res.json(updated);
});

// "delete" seguro: soft delete (active=false)
productsRoutes.delete("/:id", async (req: AuthRequest, res) => {
  const id = z.string().uuid().parse(req.params.id);

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ message: "Product not found" });
  if (existing.farmerId !== req.user!.id) return res.status(403).json({ message: "Forbidden" });

  await prisma.product.update({
    where: { id },
    data: { active: false },
  });

  return res.status(204).send();
});
