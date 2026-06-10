# Скорость & Вкус

Веб-приложение сети быстрого питания с доставкой: меню из PostgreSQL, корзина, заказы (гость и авторизованный пользователь), админ-панель.

## Стек

- **Frontend:** React 18, Vite, Tailwind, shadcn/ui, TanStack Query
- **Backend:** Express 5, Prisma, JWT (httpOnly cookie)
- **БД:** PostgreSQL 16 (Docker)

## Быстрый старт

### 1. PostgreSQL

```bash
docker compose up -d
```

### 2. Миграции и данные

```bash
npm install
npx prisma migrate deploy
npm run db:seed
```

Если миграции ещё не применялись локально:

```bash
npx prisma migrate dev --name init
npm run db:seed
```

### 3. Запуск

```bash
npm run dev
```

Откройте http://localhost:8080

## Учётные записи (после seed)

| Роль  | Email                 | Пароль   |
|-------|-----------------------|----------|
| Админ | admin@skorost-vkus.ru | admin123 |
| Пользователь | user@example.com | user123  |

Переменные окружения — см. `.env.example`.

## Android APK

На сайте есть блок **«Скачать для Android»** (главная, подвал, «О нас»). Файл: `/downloads/skorost-vkus.apk`.

### Сборка APK (нужны [Android Studio](https://developer.android.com/studio) и JDK 17+)

1. Узнайте IP компьютера в Wi‑Fi (`ipconfig`) и пропишите в `.env.capacitor`:
   ```env
   VITE_API_BASE_URL=http://192.168.XXX.XXX:8080/api
   ```
2. Запустите сервер: `npm run dev` (порт 8080).
3. Соберите APK и положите на сайт:
   ```bash
   npm run android:apk
   ```
4. APK появится в `public/downloads/skorost-vkus.apk` — кнопка на сайте начнёт отдавать файл.

На телефоне: скачать APK → разрешить установку из неизвестных источников → открыть приложение (телефон и ПК в одной сети, сервер запущен).

Другие команды: `npm run cap:sync` — только синхронизация; `npm run android:open` — открыть проект в Android Studio.

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Vite + API на порту 8080 |
| `npm run build` | Сборка клиента и сервера |
| `npm start` | Production-сервер |
| `npm run db:seed` | Заполнение БД |
| `npm run db:studio` | Prisma Studio |
| `npm run android:apk` | Сборка debug APK → `public/downloads/` |

## Обновление схемы БД

После `git pull` выполните:

```bash
npx prisma db push
npm run db:seed
```

## Демо-оплата

- **Карта:** любые 16 цифр, кроме `4000 0000 0000 0002` (имитация отказа)
- **СБП:** мгновенное подтверждение (демо)
- **Наличные:** оплата при получении, без онлайн-списания

## Функции для диплома (ТЗ)

| Требование | Статус |
|------------|--------|
| Регистрация и вход по email | ✅ `/login`, `/register` |
| Меню по категориям, фото, описание, цены | ✅ `/menu`, `/product/:slug` |
| Корзина с изменением количества | ✅ `/cart` |
| Самовывоз с выбором времени | ✅ оформление → слоты каждые 15 мин |
| Отслеживание статуса заказа | ✅ `/order/:id` |
| Push при смене статуса | ✅ Web Push (кнопка на странице заказа и в профиле) |
| История заказов + повтор в 1 клик | ✅ `/orders`, кнопка «Повторить заказ» |

Push: в `.env` нужны `VAPID_PUBLIC_KEY` и `VAPID_PRIVATE_KEY` (`npx web-push generate-vapid-keys`). После смены статуса в админке пользователь получает уведомление, если нажал «Включить» на странице заказа.

## API (основное)

- `POST /api/auth/register`, `POST /api/auth/login`
- `GET /api/categories`, `GET /api/products`
- `POST /api/orders` — гость или пользователь (доставка/самовывоз, `pickupAt`)
- `POST /api/notifications/subscribe` — подписка на push
- `POST /api/payments/orders/:id/pay` — фиктивная оплата
- `GET /api/orders/:id?token=...` — просмотр гостевого заказа
- `/api/admin/*` — CRUD (только ADMIN)

## Структура

```
prisma/          — схема, миграции, seed
server/          — Express API
client/          — React SPA
shared/          — общие TypeScript-типы
```
