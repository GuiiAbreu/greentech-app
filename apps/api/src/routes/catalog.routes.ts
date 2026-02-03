import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

export const catalogRoutes = Router();

catalogRoutes.use(authMiddleware);
catalogRoutes.use(requireRole("CONSUMER"));

catalogRoutes.get("/products", async (req, res) => {
  const querySchema = z.object({
    category: z.enum(["FRUTAS", "HORTALICAS", "LATICINIOS", "OVOS", "GRAOS"]).optional(),
    city: z.string().min(2).optional(),
    q: z.string().min(1).optional(),
  });

  const q = querySchema.parse(req.query);

  const products = await prisma.product.findMany({
    where: {
      active: true,
      category: q.category,
      farmer: q.city ? { city: { equals: q.city, mode: "insensitive" } } : undefined,
      name: q.q ? { contains: q.q, mode: "insensitive" } : undefined,
    },
    orderBy: { createdAt: "desc" },
    include: {
      photos: true,
      certs: true,
      farmer: { select: { id: true, name: true, propertyName: true, city: true, phone: true } },
    },
  });

  return res.json(products);
});

catalogRoutes.get("/products/:id", async (req, res) => {
  const id = z.string().uuid().parse(req.params.id);

  const product = await prisma.product.findFirst({
    where: { id, active: true },
    include: {
      photos: true,
      certs: true,
      farmer: { select: { id: true, name: true, propertyName: true, city: true, phone: true, address: true } },
    },
  });

  if (!product) return res.status(404).json({ message: "Product not found" });

  return res.json(product);
});
