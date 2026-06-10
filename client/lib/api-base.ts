/** Базовый URL API: на сайте — относительный /api, в APK — из .env.capacitor */
export function getApiBase(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (fromEnv?.trim()) {
    return fromEnv.replace(/\/$/, "");
  }
  return "/api";
}
