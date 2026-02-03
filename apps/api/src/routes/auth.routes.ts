import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";

export const authRoutes = Router();

const registerSchema = z.object({
  role: z.enum(["FARMER", "CONSUMER"]),
  name: z.string().min(2),
  propertyName: z.string().min(2).optional(),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().min(2),
});

authRoutes.post("/register", async (req, res) => {
  const data = registerSchema.parse(req.body);

  const exists = await prisma.user.findUnique({ where: { email: data.email } });
  if (exists) return res.status(409).json({ message: "Email already in use" });

  const passwordHash = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      role: data.role,
      name: data.name,
      propertyName: data.role === "FARMER" ? data.propertyName ?? null : null,
      email: data.email,
      passwordHash,
      phone: data.phone ?? null,
      address: data.address ?? null,
      city: data.city,
    },
    select: { id: true, role: true, name: true, email: true, city: true, propertyName: true },
  });

  const token = signToken({ sub: user.id, role: user.role });

  return res.status(201).json({ token, user });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRoutes.post("/login", async (req, res) => {
  const data = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await comparePassword(data.password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = signToken({ sub: user.id, role: user.role });

  return res.json({
    token,
    user: {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      city: user.city,
      propertyName: user.propertyName,
    },
  });
});
