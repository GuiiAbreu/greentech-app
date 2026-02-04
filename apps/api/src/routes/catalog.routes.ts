import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

export const catalogRoutes = Router();

catalogRoutes.use(authMiddleware);
catalogRoutes.use(requireRole("CONSUMER"));

/**
 * RF06 - Listagem do catálogo geral (produtos ativos)
 * Filtros opcionais:
 * - category: enum ProductCategory
 * - city: cidade do agricultor
 * - q: busca pelo nome do produto
 */
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
      farmer: {
        select: {
          id: true,
          name: true,
          city: true,
          phone: true,
          farmerProfile: {
            select: { propertyName: true },
          },
        },
      },
    },
  });

  const normalized = products.map((p) => ({
    ...p,
    farmer: {
      id: p.farmer.id,
      name: p.farmer.name,
      city: p.farmer.city,
      phone: p.farmer.phone,
      propertyName: p.farmer.farmerProfile?.propertyName ?? null,
    },
  }));

  return res.json(normalized);
});

// RF06 - Detalhe de um produto específico
catalogRoutes.get("/products/:id", async (req, res) => {
  const id = z.string().uuid().parse(req.params.id);

  const product = await prisma.product.findFirst({
    where: { id, active: true },
    include: {
      photos: true,
      certs: true,
      farmer: {
        select: {
          id: true,
          name: true,
          city: true,
          phone: true,
          farmerProfile: {
            select: { propertyName: true, address: true },
          },
        },
      },
    },
  });

  if (!product) return res.status(404).json({ message: "Product not found" });

  return res.json({
    ...product,
    farmer: {
      id: product.farmer.id,
      name: product.farmer.name,
      city: product.farmer.city,
      phone: product.farmer.phone,
      propertyName: product.farmer.farmerProfile?.propertyName ?? null,
      address: product.farmer.farmerProfile?.address ?? null,
    },
  });
});

/**
 * RF06 - Listar todos os FARMERS cadastrados
 * Retorna:
 * - dados básicos do agricultor
 * - propriedade (FarmerProfile)
 * - total de produtos ativos (activeProductsCount)
 */
catalogRoutes.get("/farmers", async (_req, res) => {
  const farmers = await prisma.user.findMany({
    where: { role: "FARMER" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      city: true,
      phone: true,
      farmerProfile: {
        select: {
          propertyName: true,
          address: true,
        },
      },
      products: {
        where: { active: true },
        select: { id: true },
      },
    },
  });

  const normalized = farmers.map((f) => ({
    id: f.id,
    name: f.name,
    city: f.city,
    phone: f.phone,
    propertyName: f.farmerProfile?.propertyName ?? null,
    address: f.farmerProfile?.address ?? null,
    activeProductsCount: f.products.length,
  }));

  return res.json(normalized);
});

/**
 * RF06 - Catálogo completo de um FARMER específico (produtos ativos)
 * Retorna:
 * - farmer (dados + propriedade)
 * - products (ativos) com fotos e certificações
 */
catalogRoutes.get("/farmers/:farmerId/products", async (req, res) => {
  const farmerId = z.string().uuid().parse(req.params.farmerId);

  const farmer = await prisma.user.findFirst({
    where: { id: farmerId, role: "FARMER" },
    select: {
      id: true,
      name: true,
      city: true,
      phone: true,
      farmerProfile: {
        select: { propertyName: true, address: true },
      },
    },
  });

  if (!farmer) return res.status(404).json({ message: "Farmer not found" });

  const products = await prisma.product.findMany({
    where: { farmerId, active: true },
    orderBy: { createdAt: "desc" },
    include: { photos: true, certs: true },
  });

  return res.json({
    farmer: {
      id: farmer.id,
      name: farmer.name,
      city: farmer.city,
      phone: farmer.phone,
      propertyName: farmer.farmerProfile?.propertyName ?? null,
      address: farmer.farmerProfile?.address ?? null,
    },
    products,
  });
});
