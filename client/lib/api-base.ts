import { Capacitor } from "@capacitor/core";

/** Продакшен API для нативного приложения, если env не вшился при сборке */
const NATIVE_API_FALLBACK = "https://skorostivkus.ru:6443/api";
const NATIVE_SITE_FALLBACK = "https://skorostivkus.ru:6443";

/** Базовый URL API: на сайте — /api, в APK — из env или fallback */
export function getApiBase(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (fromEnv?.trim()) {
    return fromEnv.replace(/\/$/, "");
  }
  if (Capacitor.isNativePlatform()) {
    return NATIVE_API_FALLBACK;
  }
  return "/api";
}

/** Origin для картинок с сервера (/uploads, аватары) */
export function getMediaOrigin(): string {
  const api = getApiBase();
  if (api.startsWith("http://") || api.startsWith("https://")) {
    return api.replace(/\/api\/?$/, "");
  }

  const site = (import.meta.env.VITE_SITE_URL as string | undefined)?.trim();
  if (site) return site.replace(/\/$/, "");

  if (Capacitor.isNativePlatform()) {
    return NATIVE_SITE_FALLBACK;
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "";
}

export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}
