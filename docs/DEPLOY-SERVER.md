# Деплой на сервер с пробросом портов

Хостинг пробрасывает внешние порты на стандартные внутри VPS:

| Снаружи | Внутри сервера | Назначение |
|---------|----------------|------------|
| **6080** | 80 | HTTP |
| **6443** | 443 | HTTPS |
| **9023** | 22 | SSH |

На сервере Nginx слушает **80 и 443**. Снаружи сайт открывается так:

- HTTP: `http://skorostivkus.ru:6080` или `http://77.50.193.34:6080`
- HTTPS: `https://skorostivkus.ru:6443` или `https://77.50.193.34:6443`

## HTTPS без прямого доступа к 80/443 с интернета

Let's Encrypt по HTTP проверяет порт **80 снаружи**, а у вас снаружи только **6080**. Варианты:

### Вариант A — DNS challenge (рекомендуется)

```bash
sudo certbot certonly --manual --preferred-challenges dns \
  -d skorostivkus.ru -d www.skorostivkus.ru \
  --email ваш@email.com --agree-tos
```

Certbot попросит добавить TXT-запись `_acme-challenge` у регистратора домена.

После получения сертификата — конфиг Nginx с SSL (см. `deploy/nginx-skorostivkus.conf`).

### Вариант B — попросить хостинг открыть 80/443

Если провайдер может пробросить 80→80 и 443→443, certbot `--webroot` заработает.

### Вариант C — только HTTP на :6080

Без HTTPS cookies авторизации (`secure`) не работают в production. Для теста временно можно `NODE_ENV=development` — **не для продакшена**.

## Сборка с правильным URL

Перед `npm run build` на сервере:

```bash
export VITE_SITE_URL="https://skorostivkus.ru:6443"
npm run build
```

Или создайте `.env.production.local`:

```env
VITE_SITE_URL=https://skorostivkus.ru:6443
```

## Android APK

Скопируйте `.env.capacitor.example` → `.env.capacitor` на машине разработки:

```env
VITE_API_BASE_URL=http://77.50.193.34:6080/api
CAPACITOR_SERVER_URL=http://77.50.193.34:6080
```

Сборка APK:

```bash
npm run android:apk
```

APK копируется в `public/downloads/skorost-vkus.apk` и доступен на сайте.

## PWA

- `manifest.webmanifest` и `sw.js` в `public/`
- Установка с экрана браузера (Chrome → «Установить приложение»)
- Работает по HTTPS (порт 6443 снаружи)

## Обновление на сервере

```bash
cd ~/skorost-vkus
git pull
export VITE_SITE_URL="https://skorostivkus.ru:6443"
npm ci
npx prisma migrate deploy
npm run db:seed   # только при первом запуске или сбросе данных
npm run build
sudo systemctl restart skorost-vkus
```

## Проверка

```bash
curl http://localhost:3000/api/ping
curl http://localhost/api/ping          # через nginx :80
curl https://localhost/api/ping -k      # через nginx :443
```

Снаружи:

```bash
curl http://77.50.193.34:6080/api/ping
curl -k https://77.50.193.34:6443/api/ping
```
