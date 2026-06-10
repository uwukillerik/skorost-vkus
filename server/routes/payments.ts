import { Router } from "express";
import { z } from "zod";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { validateBody } from "../middleware/validate";
import { optionalAuth } from "../middleware/auth";
import { serializeOrder } from "../lib/serializers";
import { awardOrderLoyalty } from "../lib/loyalty";
import { sendOrderStatusPush } from "../lib/order-notifications";
import {
  generatePaymentId,
  normalizeCardNumber,
  simulatePaymentDelay,
  validateCvv,
  validateExpiry,
  validateMockCard,
} from "../lib/mock-payment";

const router = Router();

const paySchema = z.object({
  cardNumber: z.string().optional(),
  expiry: z.string().optional(),
  cvv: z.string().optional(),
  cardHolder: z.string().optional(),
});

router.post(
  "/orders/:id/pay",
  optionalAuth,
  validateBody(paySchema),
  async (req, res) => {
    const orderId = String(req.params.id);
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, user: true },
    });

    if (!order) {
      res.status(404).json({ error: "Заказ не найден" });
      return;
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      res.status(400).json({ error: "Заказ уже оплачен" });
      return;
    }

    if (order.paymentMethod === "CASH") {
      res.status(400).json({
        error: "Оплата наличными при получении — онлайн-оплата не требуется",
      });
      return;
    }

    const isOwner = req.user && order.userId === req.user.id;
    const isAdmin = req.user?.role === "ADMIN";
    const token = req.query.token || req.body?.token;
    const guestOk = order.guestAccessToken && token === order.guestAccessToken;

    if (!isOwner && !isAdmin && !guestOk) {
      res.status(403).json({ error: "Нет доступа" });
      return;
    }

    if (order.paymentMethod === "CARD") {
      const { cardNumber, expiry, cvv } = req.body;
      if (!cardNumber || !expiry || !cvv) {
        res.status(400).json({ error: "Заполните данные карты" });
        return;
      }
      const cardCheck = validateMockCard(cardNumber);
      if (!cardCheck.ok) {
        await prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: PaymentStatus.FAILED },
        });
        res.status(402).json({ error: cardCheck.error, success: false });
        return;
      }
      const expCheck = validateExpiry(expiry);
      if (!expCheck.ok) {
        res.status(400).json({ error: expCheck.error });
        return;
      }
      const cvvCheck = validateCvv(cvv);
      if (!cvvCheck.ok) {
        res.status(400).json({ error: cvvCheck.error });
        return;
      }
      const masked = normalizeCardNumber(cardNumber).slice(-4);
      await simulatePaymentDelay();
      const updated = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: PaymentStatus.PAID,
          paymentId: generatePaymentId(),
          status: OrderStatus.CONFIRMED,
          comment: order.comment
            ? `${order.comment} | Карта *${masked}`
            : `Карта *${masked}`,
        },
        include: { items: true, user: true },
      });
      await awardOrderLoyalty(updated);
      await sendOrderStatusPush(updated, OrderStatus.CONFIRMED);
      res.json({
        success: true,
        message: "Оплата прошла успешно",
        order: serializeOrder(updated),
      });
      return;
    }

    if (order.paymentMethod === "SBP") {
      await simulatePaymentDelay(1200);
      const updated = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: PaymentStatus.PAID,
          paymentId: generatePaymentId(),
          status: OrderStatus.CONFIRMED,
        },
        include: { items: true, user: true },
      });
      await awardOrderLoyalty(updated);
      await sendOrderStatusPush(updated, OrderStatus.CONFIRMED);
      res.json({
        success: true,
        message: "Оплата через СБП подтверждена",
        order: serializeOrder(updated),
      });
      return;
    }

    res.status(400).json({ error: "Способ оплаты не поддерживается" });
  },
);

export default router;
