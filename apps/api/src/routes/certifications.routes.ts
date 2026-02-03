import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authMiddleware, AuthRequest } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

export const certificationsRoutes = Router();

certificationsRoutes.use(authMiddleware);
certificationsRoutes.use(requireRole("FARMER"));

const createSchema = z.object({
  productId: z.string().uuid(),
  title: z.string().min(2),
  issuer: z.string().min(2).optional(),
  validUntil: z.string().datetime().optional(), // ISO
});

certificationsRoutes.post("/", async (req: AuthRequest, res) => {
  const data = createSchema.parse(req.body);

  const product = await prisma.product.findUnique({ where: { id: data.productId } });
  if (!product) return res.status(404).json({ message: "Product not found" });
  if (product.farmerId !== req.user!.id) return res.status(403).json({ message: "Forbidden" });

  const cert = await prisma.certification.create({
    data: {
      productId: data.productId,
      title: data.title,
      issuer: data.issuer ?? null,
      validUntil: data.validUntil ? new Date(data.validUntil) : null,
    },
  });

  return res.status(201).json(cert);
});

certificationsRoutes.get("/product/:productId", async (req: AuthRequest, res) => {
  const productId = z.string().uuid().parse(req.params.productId);

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return res.status(404).json({ message: "Product not found" });
  if (product.farmerId !== req.user!.id) return res.status(403).json({ message: "Forbidden" });

  const certs = await prisma.certification.findMany({
    where: { productId },
    orderBy: [{ validUntil: "asc" }, { createdAt: "desc" }],
  });

  return res.json(certs);
});

const updateSchema = z.object({
  title: z.string().min(2).optional(),
  issuer: z.string().min(2).optional(),
  validUntil: z.string().datetime().nullable().optional(),
});

certificationsRoutes.put("/:id", async (req: AuthRequest, res) => {
  const id = z.string().uuid().parse(req.params.id);
  const data = updateSchema.parse(req.body);

  const existing = await prisma.certification.findUnique({
    where: { id },
    include: { product: true },
  });
  if (!existing) return res.status(404).json({ message: "Certification not found" });
  if (existing.product.farmerId !== req.user!.id) return res.status(403).json({ message: "Forbidden" });

  const updated = await prisma.certification.update({
    where: { id },
    data: {
      title: data.title ?? undefined,
      issuer: data.issuer ?? undefined,
      validUntil:
        data.validUntil === undefined ? undefined : data.validUntil === null ? null : new Date(data.validUntil),
    },
  });

  return res.json(updated);
});

certificationsRoutes.delete("/:id", async (req: AuthRequest, res) => {
  const id = z.string().uuid().parse(req.params.id);

  const existing = await prisma.certification.findUnique({
    where: { id },
    include: { product: true },
  });
  if (!existing) return res.status(404).json({ message: "Certification not found" });
  if (existing.product.farmerId !== req.user!.id) return res.status(403).json({ message: "Forbidden" });

  await prisma.certification.delete({ where: { id } });
  return res.status(204).send();
});
