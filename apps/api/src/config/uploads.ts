import path from "node:path";
import { unlink } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { env } from "./env.js";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export type UploadFolder = "products" | "avatars";

export const uploadsRoot = path.resolve(dirname, "..", "..", "uploads");

export const uploadFolders: Record<UploadFolder, string> = {
  products: path.join(uploadsRoot, "products"),
  avatars: path.join(uploadsRoot, "avatars"),
};

export function publicUploadUrl(folder: UploadFolder, storedFilename: string) {
  return `${env.API_PUBLIC_URL.replace(/\/$/, "")}/uploads/${folder}/${storedFilename}`;
}

function isInsideUploads(filePath: string) {
  const relative = path.relative(uploadsRoot, filePath);
  return Boolean(relative) && !relative.startsWith("..") && !path.isAbsolute(relative);
}

export function localUploadPathFromUrl(value?: string | null) {
  if (!value) return null;

  let pathname: string;

  if (value.startsWith("/uploads/")) {
    pathname = value;
  } else {
    let parsed: URL;
    let publicOrigin: string;

    try {
      parsed = new URL(value);
      publicOrigin = new URL(env.API_PUBLIC_URL).origin;
    } catch {
      return null;
    }

    if (parsed.origin !== publicOrigin || !parsed.pathname.startsWith("/uploads/")) {
      return null;
    }

    pathname = parsed.pathname;
  }

  const relativePath = decodeURIComponent(pathname.replace(/^\/uploads\/?/, ""));
  const filePath = path.resolve(uploadsRoot, relativePath);

  return isInsideUploads(filePath) ? filePath : null;
}

export async function removeLocalUploadFile(value?: string | null) {
  const filePath = localUploadPathFromUrl(value);
  if (!filePath) return;

  try {
    await unlink(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.warn(`Failed to remove local upload: ${filePath}`, error);
    }
  }
}
