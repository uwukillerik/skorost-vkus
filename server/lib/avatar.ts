import fs from "fs";
import path from "path";

const AVATAR_DIR = path.join(process.cwd(), "public", "uploads", "avatars");
const MAX_BYTES = 2 * 1024 * 1024;

export function ensureAvatarDir() {
  fs.mkdirSync(AVATAR_DIR, { recursive: true });
}

export function parseDataUrl(dataUrl: string): { ext: string; buffer: Buffer } | null {
  const match = /^data:image\/(jpeg|png|webp);base64,(.+)$/i.exec(dataUrl);
  if (!match) return null;
  const ext = match[1].toLowerCase() === "jpeg" ? "jpg" : match[1].toLowerCase();
  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length > MAX_BYTES) return null;
  return { ext, buffer };
}

export function saveUserAvatar(userId: string, dataUrl: string): string | null {
  const parsed = parseDataUrl(dataUrl);
  if (!parsed) return null;
  ensureAvatarDir();
  const filename = `${userId}.${parsed.ext}`;
  const filepath = path.join(AVATAR_DIR, filename);
  for (const f of fs.readdirSync(AVATAR_DIR)) {
    if (f.startsWith(`${userId}.`)) {
      fs.unlinkSync(path.join(AVATAR_DIR, f));
    }
  }
  fs.writeFileSync(filepath, parsed.buffer);
  return `/uploads/avatars/${filename}`;
}

export function deleteUserAvatar(userId: string) {
  ensureAvatarDir();
  for (const f of fs.readdirSync(AVATAR_DIR)) {
    if (f.startsWith(`${userId}.`)) {
      fs.unlinkSync(path.join(AVATAR_DIR, f));
    }
  }
}
