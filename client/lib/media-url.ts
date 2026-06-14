import { getMediaOrigin, isNativeApp } from "@/lib/api-base";

const PLACEHOLDER = "/placeholder.svg";

/**
 * URL файла из bundle (Logo.png, placeholder.svg).
 * В APK на /menu путь ./Logo.png ломается — нужен origin + /Logo.png.
 */
export function resolveAssetUrl(path: string): string {
  if (!path.startsWith("/")) return path;
  if (typeof window !== "undefined") {
    return new URL(path, window.location.origin).href;
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

function isExternalHttpUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}

/** В APK внешние картинки через сервер (fallback если прямой URL не открылся) */
export function proxyExternalImage(url: string): string {
  const origin = getMediaOrigin();
  if (!origin) return url;
  return `${origin}/api/proxy-image?url=${encodeURIComponent(url)}`;
}

/**
 * URL для <img>: серверные /uploads, внешние https, локальные из bundle.
 */
export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url?.trim()) return resolveAssetUrl(PLACEHOLDER);

  const trimmed = url.trim();

  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }

  if (isExternalHttpUrl(trimmed)) {
    return trimmed;
  }

  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;

  if (isServerMediaPath(path)) {
    const origin = getMediaOrigin();
    if (origin) return `${origin}${path}`;
  }

  return resolveAssetUrl(path);
}

/** Повторная попытка загрузки картинки в APK */
export function resolveMediaUrlFallback(
  original: string,
  failedUrl: string,
): string | null {
  const trimmed = original.trim();

  if (isNativeApp()) {
    if (isExternalHttpUrl(trimmed) && !failedUrl.includes("/api/proxy-image")) {
      return proxyExternalImage(trimmed);
    }
    const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    if (isServerMediaPath(path) && !failedUrl.startsWith(getMediaOrigin())) {
      const origin = getMediaOrigin();
      if (origin) return `${origin}${path}`;
    }
  }

  if (failedUrl !== resolveAssetUrl(PLACEHOLDER)) {
    return resolveAssetUrl(PLACEHOLDER);
  }

  return null;
}
