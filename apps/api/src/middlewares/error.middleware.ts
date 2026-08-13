import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { ZodError } from "zod";
import { UploadValidationError } from "./upload.middleware.js";

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Dados inválidos",
      errors: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  if (err instanceof UploadValidationError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "Imagem excede o tamanho maximo de 2 MB" });
    }

    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({ message: "Campo de arquivo invalido" });
    }

    return res.status(400).json({ message: "Upload invalido" });
  }

  return res.status(500).json({ message: "Internal server error" });
}
