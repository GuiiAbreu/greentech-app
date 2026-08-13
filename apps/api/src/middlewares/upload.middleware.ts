import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { uploadFolders, type UploadFolder } from "../config/uploads.js";

const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;
const imageMimeExtensions = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
]);
const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);

export class UploadValidationError extends Error {
  statusCode = 400;

  constructor(message: string) {
    super(message);
    this.name = "UploadValidationError";
  }
}

function createImageUpload(folder: UploadFolder) {
  const storage = multer.diskStorage({
    destination(_req, _file, cb) {
      const uploadPath = uploadFolders[folder];
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename(_req, file, cb) {
      const extension = imageMimeExtensions.get(file.mimetype);
      cb(null, `${crypto.randomUUID()}${extension}`);
    },
  });

  return multer({
    storage,
    limits: {
      fileSize: MAX_IMAGE_SIZE_BYTES,
      files: 1,
    },
    fileFilter(_req, file, cb) {
      const mimeExtension = imageMimeExtensions.get(file.mimetype);
      const originalExtension = path.extname(file.originalname).toLowerCase();

      if (!mimeExtension || !allowedExtensions.has(originalExtension)) {
        cb(new UploadValidationError("Apenas imagens jpg, jpeg, png e webp sao permitidas"));
        return;
      }

      cb(null, true);
    },
  });
}

export const uploadProductImage = createImageUpload("products");
export const uploadAvatar = createImageUpload("avatars");
