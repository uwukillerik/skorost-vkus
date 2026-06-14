/**
 * Подготовка release keystore (если нет) и сборка подписанного release APK.
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const keystorePath = path.join(root, "android", "app", "skorost-release.keystore");
const propsPath = path.join(root, "android", "keystore.properties");

const STORE_PASS = "skorostvkus2026";
const KEY_ALIAS = "skorost";

function findKeytool() {
  if (process.env.JAVA_HOME) {
    const p = path.join(process.env.JAVA_HOME, "bin", "keytool");
    if (fs.existsSync(p) || fs.existsSync(`${p}.exe`)) return `${p}.exe`;
  }

  const candidates = [
    "C:\\Program Files\\Android\\Android Studio\\jbr\\bin\\keytool.exe",
    "C:\\Program Files\\Java\\jdk-21\\bin\\keytool.exe",
    "C:\\Program Files\\Java\\jdk-17\\bin\\keytool.exe",
  ];

  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }

  return "keytool";
}

const keytool = findKeytool();

if (!fs.existsSync(keystorePath)) {
  console.log("Создаю keystore для подписи release APK...");
  const dname =
    "CN=Skorost Vkus, OU=Mobile, O=Skorost Vkus, L=Moscow, ST=Moscow, C=RU";
  execSync(
    `"${keytool}" -genkey -v -keystore "${keystorePath}" -alias ${KEY_ALIAS} -keyalg RSA -keysize 2048 -validity 10000 -storepass ${STORE_PASS} -keypass ${STORE_PASS} -dname "${dname}"`,
    { stdio: "inherit", shell: true },
  );
}

const props = `storeFile=skorost-release.keystore
storePassword=${STORE_PASS}
keyAlias=${KEY_ALIAS}
keyPassword=${STORE_PASS}
`;
fs.writeFileSync(propsPath, props, "utf8");
console.log(`✓ keystore.properties → ${propsPath}`);
