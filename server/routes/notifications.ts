import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { validateBody } from "../middleware/validate";
import { optionalAuth } from "../middleware/auth";
import { getVapidPublicKey } from "../lib/push";

const router = Router();

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
  orderId: z.string().optional(),
  orderAccessToken: z.string().optional(),
});

router.get("/vapid-public-key", (_req, res) => {
  const publicKey = getVapidPublicKey();
  res.json({ publicKey });
});

router.post("/subscribe", optionalAuth, validateBody(subscribeSchema), async (req, res) => {
  const { endpoint, keys, orderId, orderAccessToken } = req.body;
  const userId = req.user?.id ?? null;

  if (!userId && !orderId) {
    res.status(400).json({
      error: "Укажите orderId для гостевых уведомлений или войдите в аккаунт",
    });
    return;
  }

  if (orderId) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      res.status(404).json({ error: "Заказ не найден" });
      return;
    }
    const isOwner = userId && order.userId === userId;
    const guestOk =
      order.guestAccessToken &&
      orderAccessToken === order.guestAccessToken;
    if (!isOwner && !guestOk && req.user?.role !== "ADMIN") {
      res.status(403).json({ error: "Нет доступа к заказу" });
      return;
    }
  }

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: {
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      userId,
      orderId: orderId ?? null,
    },
    update: {
      p256dh: keys.p256dh,
      auth: keys.auth,
      userId: userId ?? undefined,
      orderId: orderId ?? undefined,
    },
  });

  res.status(201).json({ ok: true });
});

router.delete("/subscribe", optionalAuth, async (req, res) => {
  const endpoint = req.body?.endpoint as string | undefined;
  if (!endpoint) {
    res.status(400).json({ error: "Укажите endpoint" });
    return;
  }
  await prisma.pushSubscription.deleteMany({
    where: {
      endpoint,
      ...(req.user?.id ? { userId: req.user.id } : {}),
    },
  });
  res.json({ ok: true });
});

export default router;
