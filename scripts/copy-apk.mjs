import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const isRelease = process.argv.includes("release");
const sub = isRelease ? "release" : "debug";
const apkDir = path.join(root, "android", "app", "build", "outputs", "apk", sub);
const candidates = isRelease
  ? ["app-release.apk", "app-release-unsigned.apk"]
  : ["app-debug.apk"];

const apkName = candidates.find((name) => fs.existsSync(path.join(apkDir, name)));

if (!apkName) {
  console.error(`APK не найден в ${apkDir}`);
  console.error("Ожидались:", candidates.join(", "));
  process.exit(1);
}

const src = path.join(apkDir, apkName);
const destDir = path.join(root, "public", "downloads");
const dest = path.join(destDir, "skorost-vkus.apk");

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, dest);
const sizeMb = (fs.statSync(dest).size / (1024 * 1024)).toFixed(1);
console.log(`✓ APK скопирован: ${dest} (${sizeMb} MB, ${apkName})`);
