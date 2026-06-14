/** Публичный URL сайта (с портом, если не 80/443). Для PWA и ссылок. */
export const SITE_ORIGIN =
  (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") ||
  (typeof window !== "undefined" ? window.location.origin : "");

export const APK_PATH = "/downloads/skorost-vkus.apk";
export const APK_FILENAME = "skorost-vkus.apk";

export function getApkUrl(): string {
  if (SITE_ORIGIN) return `${SITE_ORIGIN}${APK_PATH}`;
  return APK_PATH;
}

/** Порты проброса на хостинге: 6080→80, 6443→443 */
export const SERVER_PORTS = {
  http: 6080,
  https: 6443,
  ssh: 9023,
} as const;

export const DEFAULT_SERVER_IP = "77.50.193.34";

export function getPublicSiteUrl(host = DEFAULT_SERVER_IP, secure = true): string {
  const port = secure ? SERVER_PORTS.https : SERVER_PORTS.http;
  const scheme = secure ? "https" : "http";
  return `${scheme}://${host}:${port}`;
}

export function getPublicApiUrl(host = DEFAULT_SERVER_IP, secure = true): string {
  return `${getPublicSiteUrl(host, secure)}/api`;
}
