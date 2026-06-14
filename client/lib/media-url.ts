import { getMediaOrigin, isNativeApp } from "@/lib/api-base";
import { BRAND_LOGO_URL, IMAGE_PLACEHOLDER_URL } from "@/lib/brand-assets";

const LEGACY_LOGO_PATHS = new Set(["/Logo.png", "Logo.png", "./Logo.png"]);

/**
 * URL файла из bundle (через Vite import — надёжно в APK).
 */
export function resolveAssetUrl(path: string): string {
  if (LEGACY_LOGO_PATHS.has(path) || path.endsWith("/Logo.png")) {
    return BRAND_LOGO_URL;
  }
  if (path === "/placeholder.svg" || path.endsWith("/placeholder.svg")) {
    return IMAGE_PLACEHOLDER_URL;
  }
  if (!path.startsWith("/")) return path;
  if (typeof window !== "undefined") {
    return new URL(path, window.location.origin).href;
  }
  return path;
}

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

export function proxyExternalImage(url: string): string {
  const origin = getMediaOrigin();
  if (!origin) return url;
  return `${origin}/api/proxy-image?url=${encodeURIComponent(url)}`;
}

export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url?.trim()) return IMAGE_PLACEHOLDER_URL;

  const trimmed = url.trim();

  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }

  if (LEGACY_LOGO_PATHS.has(trimmed) || trimmed.endsWith("/Logo.png")) {
    return BRAND_LOGO_URL;
  }

  if (isExternalHttpUrl(trimmed)) {
    if (isNativeApp()) {
      const origin = getMediaOrigin();
      if (origin && trimmed.startsWith(origin)) {
        return trimmed;
      }
      return proxyExternalImage(trimmed);
    }
    return trimmed;
  }

  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;

  if (isServerMediaPath(path)) {
    const origin = getMediaOrigin();
    if (origin) return `${origin}${path}`;
  }

  return resolveAssetUrl(path);
}

export function resolveMediaUrlFallback(
  original: string,
  failedUrl: string,
): string | null {
  const trimmed = original.trim();

  if (isNativeApp() && isExternalHttpUrl(trimmed)) {
    if (!failedUrl.includes("/api/proxy-image")) {
      return proxyExternalImage(trimmed);
    }
  }

  if (failedUrl !== IMAGE_PLACEHOLDER_URL) {
    return IMAGE_PLACEHOLDER_URL;
  }

  return null;
}
