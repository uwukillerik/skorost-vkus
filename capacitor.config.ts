import type { CapacitorConfig } from "@capacitor/cli";

const serverUrl = process.env.CAPACITOR_SERVER_URL;

const config: CapacitorConfig = {
  appId: "ru.skorostvkus.app",
  appName: "Скорость & Вкус",
  webDir: "dist/spa",
  android: {
    allowMixedContent: true,
  },
  server: serverUrl
    ? {
        url: serverUrl,
        cleartext: serverUrl.startsWith("http://"),
      }
    : undefined,
};

export default config;
