import webpush from "web-push";

let configured = false;

function ensureVapid(): boolean {
  if (configured) return true;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    console.warn(
      "[push] VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY не заданы — push отключены. Запустите: npx web-push generate-vapid-keys",
    );
    return false;
  }
  try {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT ?? "mailto:support@skorost-vkus.ru",
      publicKey,
      privateKey,
    );
    configured = true;
    return true;
  } catch (err) {
    console.warn("[push] Некорректные VAPID-ключи — push отключены:", err);
    return false;
  }
}

export function getVapidPublicKey(): string | null {
  return process.env.VAPID_PUBLIC_KEY ?? null;
}

export async function notifyOrderSubscribers(
  orderId: string,
  userId: string | null | undefined,
  payload: {
    title: string;
    body: string;
    url: string;
    tag: string;
    titleDetail?: string;
    data?: Record<string, unknown>;
  },
): Promise<void> {
  if (!ensureVapid()) return;

  const { prisma } = await import("./prisma");
  const subs = await prisma.pushSubscription.findMany({
    where: {
      OR: [{ orderId }, ...(userId ? [{ userId }] : [])],
    },
  });

  if (subs.length === 0) return;

  const message = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url,
    tag: payload.tag,
    detail: payload.titleDetail,
    data: payload.data,
  });

  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          message,
        );
      } catch (err: unknown) {
        const status = (err as { statusCode?: number })?.statusCode;
        if (status === 404 || status === 410) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } });
        }
      }
    }),
  );
}
