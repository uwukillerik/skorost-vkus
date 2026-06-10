import { Router } from "express";
import { z } from "zod";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { validateBody } from "../../middleware/validate";
import { serializeOrder } from "../../lib/serializers";
import { awardOrderLoyalty } from "../../lib/loyalty";
import { sendOrderStatusPush } from "../../lib/order-notifications";

const router = Router();

const statusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

router.get("/", async (req, res) => {
  const { status } = req.query;
  const orders = await prisma.order.findMany({
    where: status ? { status: status as OrderStatus } : undefined,
    include: { items: true, user: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  res.json({ orders: orders.map((o) => serializeOrder(o)) });
});

router.get("/:id", async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: String(req.params.id) },
    include: { items: true, user: true },
  });
  if (!order) {
    res.status(404).json({ error: "Заказ не найден" });
    return;
  }
  res.json({ order: serializeOrder(order) });
});

router.patch("/:id/status", validateBody(statusSchema), async (req, res) => {
  const status = req.body.status as OrderStatus;
  const data: {
    status: OrderStatus;
    paymentStatus?: PaymentStatus;
  } = { status };

  if (status === OrderStatus.DELIVERED) {
    data.paymentStatus = PaymentStatus.PAID;
  }

  const order = await prisma.order.update({
    where: { id: String(req.params.id) },
    data,
    include: { items: true, user: true },
  });

  if (
    status === OrderStatus.DELIVERED ||
    order.paymentStatus === PaymentStatus.PAID
  ) {
    await awardOrderLoyalty(order);
  }

  await sendOrderStatusPush(order, status);

  res.json({ order: serializeOrder(order) });
});

export default router;
