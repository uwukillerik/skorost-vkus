/**
 * Скачивает TLS-сертификат с сервера и сохраняет для Android network_security_config.
 * Использование: node scripts/fetch-server-cert.mjs [host] [port]
 */
import tls from "node:tls";
import fs from "node:fs";
import path from "node:path";
import { X509Certificate } from "node:crypto";

const host = process.argv[2] || "77.50.193.34";
const port = Number(process.argv[3] || 6443);
const servername = process.argv[4] || "skorostivkus.ru";

const destDir = path.join(process.cwd(), "android", "app", "src", "main", "res", "raw");
const destFile = path.join(destDir, "skorost_server.crt");

function fetchCert() {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(
      {
        host,
        port,
        servername,
        rejectUnauthorized: false,
      },
      () => {
        try {
          const peer = socket.getPeerCertificate(false);
          if (!peer || !peer.raw) {
            reject(new Error("Сертификат не получен с сервера"));
            return;
          }
          const pem = new X509Certificate(peer.raw).toString();
          socket.end();
          resolve(pem);
        } catch (e) {
          socket.destroy();
          reject(e);
        }
      },
    );

    socket.setTimeout(15000, () => {
      socket.destroy();
      reject(new Error(`Таймаут подключения к ${host}:${port}`));
    });

    socket.on("error", reject);
  });
}

const pem = await fetchCert();
fs.mkdirSync(destDir, { recursive: true });
fs.writeFileSync(destFile, pem, "utf8");
console.log(`✓ Сертификат сохранён: ${destFile}`);
console.log(`  Сервер: ${host}:${port} (SNI: ${servername})`);
