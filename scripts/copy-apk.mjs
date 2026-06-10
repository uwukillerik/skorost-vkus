import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const isRelease = process.argv.includes("release");
const sub = isRelease ? "release" : "debug";
const apkName = isRelease ? "app-release-unsigned.apk" : "app-debug.apk";
const src = path.join(
  root,
  "android",
  "app",
  "build",
  "outputs",
  "apk",
  sub,
  apkName,
);
const destDir = path.join(root, "public", "downloads");
const dest = path.join(destDir, "skorost-vkus.apk");

if (!fs.existsSync(src)) {
  console.error(`APK не найден: ${src}`);
  console.error("Сначала выполните: npm run android:apk");
  process.exit(1);
}

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, dest);
const sizeMb = (fs.statSync(dest).size / (1024 * 1024)).toFixed(1);
console.log(`✓ APK скопирован: ${dest} (${sizeMb} MB)`);
