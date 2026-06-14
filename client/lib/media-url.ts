import { getMediaOrigin, isNativeApp } from "@/lib/api-base";

const PLACEHOLDER = "/placeholder.svg";

/** Локальные файлы из bundle (Logo.png) — с base ./ нужен относительный путь */
export function resolveAssetUrl(path: string): string {
  if (!path.startsWith("/")) return path;
  const base = import.meta.env.BASE_URL || "/";
  if (isNativeApp() || base === "./" || base.startsWith("./")) {
    const normalized = base.endsWith("/") ? base : `${base}/`;
    return `${normalized}${path.slice(1)}`;
  }
  return path;
}

/** Пути с сервера — uploads и аватары */
function isServerMediaPath(path: string): boolean {
  return (
    path.startsWith("/uploads/") ||
    path.startsWith("/avatars/") ||
    path.startsWith("/api/uploads/")
  );
}

/**
 * Абсолютный URL картинки: в APK /uploads/... → сервер, /Logo.png → локальный bundle.
 */
export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url?.trim()) return PLACEHOLDER;

  const trimmed = url.trim();

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }

  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;

  if (isServerMediaPath(path)) {
    const origin = getMediaOrigin();
    if (origin) return `${origin}${path}`;
  }

  return resolveAssetUrl(path);
}
