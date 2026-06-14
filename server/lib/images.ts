import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = 3 * 1024 * 1024;

export type UploadFolder = "products" | "categories" | "combos";

export function ensureUploadDir(subfolder: UploadFolder) {
  const dir = path.join(UPLOAD_ROOT, subfolder);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function ensureAllUploadDirs() {
  (["products", "categories", "combos"] as UploadFolder[]).forEach(ensureUploadDir);
}

export function parseDataUrl(
  dataUrl: string,
): { ext: string; buffer: Buffer } | null {
  const match = /^data:image\/(jpeg|png|webp);base64,(.+)$/i.exec(dataUrl);
  if (!match) return null;
  const ext = match[1].toLowerCase() === "jpeg" ? "jpg" : match[1].toLowerCase();
  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length > MAX_BYTES) return null;
  return { ext, buffer };
}

export function saveUploadedImage(
  subfolder: UploadFolder,
  dataUrl: string,
): string | null {
  const parsed = parseDataUrl(dataUrl);
  if (!parsed) return null;
  const dir = ensureUploadDir(subfolder);
  const filename = `${randomUUID()}.${parsed.ext}`;
  fs.writeFileSync(path.join(dir, filename), parsed.buffer);
  return `/uploads/${subfolder}/${filename}`;
}

export function isValidImageUrl(url: string): boolean {
  return (
    url.startsWith("/uploads/") ||
    url.startsWith("http://") ||
    url.startsWith("https://")
  );
}
