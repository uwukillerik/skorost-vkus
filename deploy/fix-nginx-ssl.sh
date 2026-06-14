#!/bin/bash
# Поднимает HTTPS на 443 (снаружи открывается как :6443)
set -euo pipefail

SITE_CONF="/etc/nginx/sites-available/skorost-vkus"
SSL_DIR="/etc/nginx/ssl"

echo "=== Проверка портов ==="
ss -tlnp | grep -E ':80|:443' || true

if [[ ! -f "$SSL_DIR/skorostivkus.crt" ]]; then
  echo "=== Создаём самоподписанный сертификат ==="
  mkdir -p "$SSL_DIR"
  openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
    -keyout "$SSL_DIR/skorostivkus.key" \
    -out "$SSL_DIR/skorostivkus.crt" \
    -subj "/CN=skorostivkus.ru"
fi

echo "=== Копируем nginx конфиг ==="
cp /root/skorost-vkus/deploy/nginx-skorostivkus.conf "$SITE_CONF"
rm -f /etc/nginx/sites-enabled/default
ln -sf "$SITE_CONF" /etc/nginx/sites-enabled/skorost-vkus

nginx -t
systemctl reload nginx

echo "=== Проверка ==="
curl -s http://127.0.0.1/api/ping || true
echo ""
curl -sk https://127.0.0.1/api/ping
echo ""
ss -tlnp | grep -E ':80|:443'

echo "Готово. Снаружи: https://skorostivkus.ru:6443"
