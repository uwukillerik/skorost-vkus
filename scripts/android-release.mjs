import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const isWin = process.platform === "win32";
const gradlew = isWin ? "gradlew.bat" : "./gradlew";

console.log("1/4 Сертификат HTTPS с сервера...");
execSync("node scripts/fetch-server-cert.mjs", { stdio: "inherit", cwd: root });

console.log("2/4 Keystore для подписи...");
execSync("node scripts/prepare-android-keystore.mjs", { stdio: "inherit", cwd: root });

console.log("3/4 Capacitor sync...");
execSync("npm run cap:sync", { stdio: "inherit", cwd: root, shell: true });

console.log("4/4 Сборка release APK...");
execSync(`${gradlew} assembleRelease`, {
  stdio: "inherit",
  cwd: path.join(root, "android"),
  shell: true,
});

execSync("node scripts/copy-apk.mjs release", { stdio: "inherit", cwd: root });

console.log("\n✓ Release APK готов: public/downloads/skorost-vkus.apk");
