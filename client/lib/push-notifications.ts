import { api } from "@/lib/api";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  } catch {
    return null;
  }
}

export async function subscribeToOrderPush(options: {
  orderId?: string;
  orderToken?: string;
}): Promise<boolean> {
  if (!isPushSupported()) return false;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return false;

  const { publicKey } = await api.notifications.vapidPublicKey();
  if (!publicKey) return false;

  const registration = await registerServiceWorker();
  if (!registration) return false;

  await navigator.serviceWorker.ready;

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        publicKey,
      ) as BufferSource,
    });
  }

  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    return false;
  }

  await api.notifications.subscribe({
    endpoint: json.endpoint,
    keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
    orderId: options.orderId,
    orderAccessToken: options.orderToken,
  });

  return true;
}
