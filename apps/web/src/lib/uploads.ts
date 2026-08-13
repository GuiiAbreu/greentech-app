import { api } from "@/services/api";
import { normalizeUser } from "@/lib/normalizers";
import type { User } from "@/lib/types";

export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";
export const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);

export function getImageValidationMessage(file: File) {
  const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

  if (!allowedTypes.has(file.type) || !allowedExtensions.has(extension)) {
    return "Use uma imagem jpg, jpeg, png ou webp.";
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "A imagem deve ter no maximo 2 MB.";
  }

  return null;
}

export async function uploadProductImage(productId: string, file: File) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await api.post(`/products/${productId}/image`, formData);
  return response.data;
}

export async function uploadAvatarImage(file: File): Promise<User> {
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await api.post("/me/avatar", formData);
  return normalizeUser(response.data);
}
