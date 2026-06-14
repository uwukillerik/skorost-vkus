/**
 * Скачивает TLS-сертификат с сервера и сохраняет для Android network_security_config.
 * Использование: node scripts/fetch-server-cert.mjs [host] [port] [sni]
 *
 * Если сервер недоступен — использует уже сохранённый skorost_server.crt (не блокирует сборку APK).
 */
import tls from "node:tls";
import fs from "node:fs";
import path from "node:path";
import { X509Certificate } from "node:crypto";

const destDir = path.join(process.cwd(), "android", "app", "src", "main", "res", "raw");
const destFile = path.join(destDir, "skorost_server.crt");

const TIMEOUT_MS = 30_000;

/** Пробуем домен и IP — с ПК иногда до IP таймаут, до домена ок */
const DEFAULT_TARGETS = [
  { host: "skorostivkus.ru", port: 6443, servername: "skorostivkus.ru" },
  { host: "77.50.193.34", port: 6443, servername: "skorostivkus.ru" },
];

function fetchCertFrom(host, port, servername) {
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
          if (!peer?.raw) {
            reject(new Error("Сертификат не получен с сервера"));
            return;
          }
          const pem = new X509Certificate(peer.raw).toString();
          socket.end();
          resolve({ pem, host, port, servername });
        } catch (e) {
          socket.destroy();
          reject(e);
        }
      },
    );

    socket.setTimeout(TIMEOUT_MS, () => {
      socket.destroy();
      reject(new Error(`Таймаут подключения к ${host}:${port}`));
    });

    socket.on("error", reject);
  });
}

async function fetchCert() {
  const cliHost = process.argv[2];
  const cliPort = process.argv[3] ? Number(process.argv[3]) : undefined;
  const cliSni = process.argv[4];

  const targets =
    cliHost
      ? [{ host: cliHost, port: cliPort ?? 6443, servername: cliSni || cliHost }]
      : DEFAULT_TARGETS;

  const errors = [];

  for (const t of targets) {
    try {
      return await fetchCertFrom(t.host, t.port, t.servername);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${t.host}:${t.port} — ${msg}`);
      console.warn(`⚠ Не удалось получить сертификат с ${t.host}:${t.port}: ${msg}`);
    }
  }

  if (fs.existsSync(destFile)) {
    console.warn(
      "⚠ Сервер недоступен, используем уже сохранённый сертификат:",
      destFile,
    );
    if (errors.length) {
      console.warn("  Попытки:", errors.join("; "));
    }
    return null;
  }

  throw new Error(
    `Не удалось получить сертификат и локальный файл не найден.\n${errors.join("\n")}`,
  );
}

const result = await fetchCert();

if (result) {
  fs.mkdirSync(destDir, { recursive: true });
  fs.writeFileSync(destFile, result.pem, "utf8");
  console.log(`✓ Сертификат сохранён: ${destFile}`);
  console.log(`  Сервер: ${result.host}:${result.port} (SNI: ${result.servername})`);
} else {
  console.log("✓ Сборка продолжится с существующим сертификатом");
}
