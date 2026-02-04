import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";

export const authRoutes = Router();

const registerSchema = z
  .object({
    role: z.enum(["FARMER", "CONSUMER"]),
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    city: z.string().min(2),

    phone: z.string().min(8),

    propertyName: z.string().min(2).optional(),
    address: z.string().min(2).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "FARMER") {
      if (!data.propertyName) {
        ctx.addIssue({
          code: "custom",
          path: ["propertyName"],
          message: "propertyName is required for FARMER",
        });
      }
      if (!data.address) {
        ctx.addIssue({
          code: "custom",
          path: ["address"],
          message: "address is required for FARMER",
        });
      }
    }
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
      email: data.email,
      passwordHash,
      phone: data.phone,
      city: data.city,

      farmerProfile:
        data.role === "FARMER"
          ? {
              create: {
                propertyName: data.propertyName!,
                address: data.address!,
              },
            }
          : undefined,
    },
    select: {
      id: true,
      role: true,
      name: true,
      email: true,
      phone: true,
      city: true,
      farmerProfile: {
        select: {
          propertyName: true,
          address: true,
        },
      },
    },
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

  const user = await prisma.user.findUnique({
    where: { email: data.email },
    include: {
      farmerProfile: true,
    },
  });

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
      phone: user.phone,
      city: user.city,
      farmerProfile: user.farmerProfile
        ? {
            propertyName: user.farmerProfile.propertyName,
            address: user.farmerProfile.address,
          }
        : null,
    },
  });
});
