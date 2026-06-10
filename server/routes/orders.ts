import { Router } from "express";
import { randomUUID } from "crypto";
import { z } from "zod";
import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { validateBody } from "../middleware/validate";
import { optionalAuth, requireAuth } from "../middleware/auth";
import { serializeOrder } from "../lib/serializers";
import { calcDeliveryFee } from "../lib/delivery";

const router = Router();

const orderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1).max(99),
});

const comboOrderSchema = z.object({
  comboId: z.string(),
  quantity: z.number().int().min(1).max(10),
});

const createOrderSchema = z
  .object({
    items: z.array(orderItemSchema).default([]),
    combos: z.array(comboOrderSchema).default([]),
    address: z.string().default(""),
    comment: z.string().optional(),
    deliveryType: z.enum(["DELIVERY", "PICKUP"]).default("DELIVERY"),
    pickupAt: z.string().datetime().optional(),
    paymentMethod: z.enum(["CARD", "SBP", "CASH"]),
    guestName: z.string().min(2).optional(),
    guestPhone: z.string().min(10).optional(),
    guestEmail: z.string().email().optional().or(z.literal("")),
  })
  .refine((d) => d.items.length > 0 || d.combos.length > 0, {
    message: "Добавьте товары или комбо",
  })
  .superRefine((d, ctx) => {
    if (d.deliveryType === "DELIVERY" && d.address.trim().length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Укажите адрес доставки",
        path: ["address"],
      });
    }
    if (d.deliveryType === "PICKUP" && !d.pickupAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Выберите время самовывоза",
        path: ["pickupAt"],
      });
    }
    if (d.pickupAt) {
      const at = new Date(d.pickupAt);
      if (Number.isNaN(at.getTime()) || at.getTime() < Date.now() + 20 * 60_000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Время самовывоза должно быть не раньше чем через 20 минут",
          path: ["pickupAt"],
        });
      }
    }
  });

router.post("/", optionalAuth, validateBody(createOrderSchema), async (req, res) => {
  const {
    items = [],
    combos = [],
    address,
    comment,
    deliveryType,
    pickupAt,
    paymentMethod,
    guestName,
    guestPhone,
    guestEmail,
  } = req.body;
  const userId = req.user?.id;

  if (!userId && (!guestName || !guestPhone)) {
    res.status(400).json({
      error: "Для гостевого заказа укажите имя и телефон",
    });
    return;
  }

  const productIds = items.map((i: { productId: string }) => i.productId);
  const products =
    productIds.length > 0
      ? await prisma.product.findMany({
          where: { id: { in: productIds }, isAvailable: true },
        })
      : [];

  if (products.length !== productIds.length) {
    res.status(400).json({ error: "Некоторые товары недоступны" });
    return;
  }

  const comboIds = combos.map((c: { comboId: string }) => c.comboId);
  const comboRecords =
    comboIds.length > 0
      ? await prisma.combo.findMany({
          where: { id: { in: comboIds }, isActive: true },
          include: { items: { include: { product: true } } },
        })
      : [];

  if (comboRecords.length !== comboIds.length) {
    res.status(400).json({ error: "Некоторые комбо недоступны" });
    return;
  }

  const productMap = new Map(products.map((p) => [p.id, p]));
  const comboMap = new Map(comboRecords.map((c) => [c.id, c]));
  let subtotal = 0;
  const orderItems: {
    productId: string;
    comboId?: string;
    quantity: number;
    unitPrice: Parameters<typeof prisma.orderItem.create>[0]["data"]["unitPrice"];
    productName: string;
  }[] = [];

  for (const item of items as { productId: string; quantity: number }[]) {
    const product = productMap.get(item.productId)!;
    const unitPrice = Number(product.price);
    subtotal += unitPrice * item.quantity;
    orderItems.push({
      productId: product.id,
      quantity: item.quantity,
      unitPrice: product.price,
      productName: product.name,
    });
  }

  for (const c of combos as { comboId: string; quantity: number }[]) {
    const combo = comboMap.get(c.comboId)!;
    const unitPrice = Number(combo.price);
    subtotal += unitPrice * c.quantity;
    const lines = combo.items.map((i) => `• ${i.name}`).join("\n");
    const firstProduct = combo.items.find((i) => i.productId)?.productId;
    if (!firstProduct) {
      res.status(400).json({ error: `Комбо «${combo.name}» без товаров` });
      return;
    }
    orderItems.push({
      productId: firstProduct,
      comboId: combo.id,
      quantity: c.quantity,
      unitPrice: combo.price,
      productName: `🍱 Комбо «${combo.name}»\n${lines}`,
    });
  }

  const deliveryFee = calcDeliveryFee(subtotal, deliveryType);
  const totalAmount = subtotal + deliveryFee;
  const guestAccessToken = userId ? null : randomUUID();

  const finalAddress =
    deliveryType === "PICKUP"
      ? "Самовывоз: ул. Тверская, 1"
      : address;

  const order = await prisma.order.create({
    data: {
      userId: userId || null,
      guestName: userId ? null : guestName,
      guestPhone: userId ? null : guestPhone,
      guestEmail: userId ? null : guestEmail || null,
      guestAccessToken,
      address: finalAddress,
      comment: comment || null,
      deliveryType,
      pickupAt:
        deliveryType === "PICKUP" && pickupAt
          ? new Date(pickupAt)
          : null,
      paymentMethod: paymentMethod as PaymentMethod,
      paymentStatus: PaymentStatus.PENDING,
      subtotal,
      deliveryFee,
      totalAmount,
      status: "NEW",
      items: { create: orderItems },
    },
    include: { items: true, user: true },
  });

  if (userId && guestPhone) {
    await prisma.order.updateMany({
      where: { userId: null, guestPhone },
      data: { userId },
    });
  }

  res.status(201).json({
    order: serializeOrder(order),
    guestAccessToken: guestAccessToken ?? undefined,
    requiresPayment: paymentMethod !== "CASH",
  });
});

router.get("/", requireAuth, async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user!.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  res.json({ orders: orders.map((o) => serializeOrder(o)) });
});

router.get("/:id", optionalAuth, async (req, res) => {
  const { token, phone } = req.query;
  const order = await prisma.order.findUnique({
    where: { id: String(req.params.id) },
    include: { items: true, user: true },
  });

  if (!order) {
    res.status(404).json({ error: "Заказ не найден" });
    return;
  }

  const isOwner = req.user && order.userId === req.user.id;
  const isAdmin = req.user?.role === "ADMIN";
  const guestOk =
    order.guestAccessToken && token === order.guestAccessToken;
  const guestPhoneOk =
    !order.userId && phone && order.guestPhone === String(phone);

  if (!isOwner && !isAdmin && !guestOk && !guestPhoneOk) {
    res.status(403).json({ error: "Нет доступа к заказу" });
    return;
  }

  res.json({
    order: serializeOrder(order, !!(guestOk || isOwner || isAdmin)),
  });
});

export default router;
