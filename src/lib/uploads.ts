import fs from "fs";
import path from "path";
import crypto from "crypto";

// Images for profile records, served from /public/uploads/<folder>.
export const IMAGE_FOLDERS = ["projects", "education"] as const;
export type ImageFolder = (typeof IMAGE_FOLDERS)[number];

const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export function validateImage(file: File): string | null {
  if (!EXTENSIONS[file.type]) return "Solo se permiten imágenes (JPG, PNG, WebP, GIF)";
  if (file.size > MAX_SIZE_BYTES) return "La imagen no puede superar 2MB";
  return null;
}

export async function saveImage(file: File, folder: ImageFolder, userId: string): Promise<string> {
  const fileName = `${userId}-${crypto.randomUUID()}${EXTENSIONS[file.type]}`;
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await fs.promises.mkdir(dir, { recursive: true });
  await fs.promises.writeFile(path.join(dir, fileName), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${folder}/${fileName}`;
}

// Deletes a previously uploaded image. Ignores anything outside our folders.
export async function deleteImage(url: string | null | undefined) {
  const match = url?.match(/^\/uploads\/(projects|education)\/([\w-]+\.(?:jpg|png|webp|gif))$/);
  if (!match) return;
  try {
    await fs.promises.unlink(path.join(process.cwd(), "public", "uploads", match[1], match[2]));
  } catch {
    // File may already be missing.
  }
}

// Only accept image URLs produced by saveImage for this user (or no image).
export function isOwnImageUrl(url: unknown, userId: string): boolean {
  return typeof url === "string" && new RegExp(`^/uploads/(projects|education)/${userId}-[\\w-]+\\.(jpg|png|webp|gif)$`).test(url);
}
