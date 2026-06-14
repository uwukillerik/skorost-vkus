import fs from "node:fs";
import path from "node:path";
import type { CapacitorConfig } from "@capacitor/cli";

function readCapacitorEnv(): Record<string, string> {
  const file = path.join(process.cwd(), ".env.capacitor");
  if (!fs.existsSync(file)) return {};
  const out: Record<string, string> = {};
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    out[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return out;
}

const env = readCapacitorEnv();
const serverUrl = env.CAPACITOR_SERVER_URL;

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
    : {
        androidScheme: "https",
      },
};

export default config;
