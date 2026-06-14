import { Capacitor } from "@capacitor/core";

const NATIVE_API_FALLBACK = "https://skorostivkus.ru:6443/api";
const NATIVE_SITE_FALLBACK = "https://skorostivkus.ru:6443";

function isServerHost(hostname: string): boolean {
  return hostname === "skorostivkus.ru" || hostname === "77.50.193.34";
}

/** Базовый URL API */
export function getApiBase(): string {
  if (typeof window !== "undefined" && Capacitor.isNativePlatform()) {
    const { origin, hostname } = window.location;
    if (isServerHost(hostname)) {
      return `${origin}/api`;
    }
  }

  const fromEnv = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (fromEnv?.trim()) {
    return fromEnv.replace(/\/$/, "");
  }

  if (Capacitor.isNativePlatform()) {
    return NATIVE_API_FALLBACK;
  }
  return "/api";
}

/** Origin для картинок с сервера */
export function getMediaOrigin(): string {
  if (typeof window !== "undefined") {
    const { origin, hostname } = window.location;
    if (Capacitor.isNativePlatform() && isServerHost(hostname)) {
      return origin;
    }
  }

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
