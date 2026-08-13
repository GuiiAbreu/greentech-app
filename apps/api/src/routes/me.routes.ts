import { NextFunction, Response, Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authMiddleware, AuthRequest } from "../middlewares/auth.middleware.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import { uploadAvatar } from "../middlewares/upload.middleware.js";
import { publicUploadUrl, removeLocalUploadFile } from "../config/uploads.js";

export const meRoutes = Router();

meRoutes.use(authMiddleware);

meRoutes.get("/", async (req: AuthRequest, res) => {
  const userId = req.user!.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      name: true,
      email: true,
      phone: true,
      city: true,
      avatarUrl: true,
      farmerProfile: {
        select: {
          propertyName: true,
          address: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  return res.json(user);
});

type CurrentUserWithAvatar = {
  avatarUrl: string | null;
};

async function ensureCurrentUser(req: AuthRequest, res: Response, next: NextFunction) {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { avatarUrl: true },
  });

  if (!user) return res.status(404).json({ message: "User not found" });

  res.locals.currentUser = user;
  return next();
}

meRoutes.post(
  "/avatar",
  ensureCurrentUser,
  uploadAvatar.single("avatar"),
  async (req: AuthRequest, res) => {
    const file = req.file;
    const currentUser = res.locals.currentUser as CurrentUserWithAvatar;

    if (!file) return res.status(400).json({ message: "Avatar file is required" });

    const avatarUrl = publicUploadUrl("avatars", file.filename);

    let updated;
    try {
      updated = await prisma.user.update({
        where: { id: req.user!.id },
        data: { avatarUrl },
        select: {
          id: true,
          role: true,
          name: true,
          email: true,
          phone: true,
          city: true,
          avatarUrl: true,
          farmerProfile: {
            select: {
              propertyName: true,
              address: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      await removeLocalUploadFile(avatarUrl);
      throw error;
    }

    await removeLocalUploadFile(currentUser.avatarUrl);

    return res.json(updated);
  }
);

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(8).optional(),
  city: z.string().min(2).optional(),

  // apenas FARMER
  propertyName: z.string().min(2).optional(),
  address: z.string().min(2).optional(),
});

meRoutes.put("/", async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const data = updateSchema.parse(req.body);

  const isFarmer = req.user!.role === "FARMER";
  const wantsFarmerProfileUpdate = Boolean(data.propertyName || data.address);

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name ?? undefined,
      phone: data.phone ?? undefined,
      city: data.city ?? undefined,

      farmerProfile:
        isFarmer && wantsFarmerProfileUpdate
          ? {
              upsert: {
                create: {
                  // em teoria já existe, mas upsert garante consistência
                  propertyName: data.propertyName ?? "Propriedade",
                  address: data.address ?? "Endereço",
                },
                update: {
                  propertyName: data.propertyName ?? undefined,
                  address: data.address ?? undefined,
                },
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
      avatarUrl: true,
      farmerProfile: {
        select: {
          propertyName: true,
          address: true,
        },
      },
      updatedAt: true,
    },
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
