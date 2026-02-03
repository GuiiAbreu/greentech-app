import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";

export type AuthRequest = Request & {
  user?: { id: string; role: "FARMER" | "CONSUMER" };
};

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing Authorization Bearer token" });
  }

  const token = header.slice("Bearer ".length).trim();

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
