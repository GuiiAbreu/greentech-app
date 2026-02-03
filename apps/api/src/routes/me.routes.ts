import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authMiddleware, AuthRequest } from "../middlewares/auth.middleware.js";
import { hashPassword, comparePassword } from "../utils/password.js";

export const meRoutes = Router();

meRoutes.use(authMiddleware);

meRoutes.get("/", async (req: AuthRequest, res) => {
  const userId = req.user!.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, role: true, name: true, propertyName: true,
      email: true, phone: true, address: true, city: true,
      createdAt: true, updatedAt: true,
    },
  });

  return res.json(user);
});

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  propertyName: z.string().min(2).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().min(2).optional(),
});

meRoutes.put("/", async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const data = updateSchema.parse(req.body);

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      propertyName: req.user!.role === "FARMER" ? (data.propertyName ?? undefined) : undefined,
      phone: data.phone ?? undefined,
      address: data.address ?? undefined,
      city: data.city ?? undefined,
    },
    select: { id: true, role: true, name: true, email: true, phone: true, address: true, city: true, propertyName: true },
  });

  return res.json(updated);
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

meRoutes.put("/password", async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const data = changePasswordSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ message: "User not found" });

  const ok = await comparePassword(data.currentPassword, user.passwordHash);
  if (!ok) return res.status(400).json({ message: "Current password is incorrect" });

  const passwordHash = await hashPassword(data.newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  return res.json({ message: "Password updated" });
});
