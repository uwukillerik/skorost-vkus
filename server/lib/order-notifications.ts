import type { DeliveryType, OrderStatus } from "@prisma/client";
import type { OrderWithRelations } from "./serializers";
import { notifyOrderSubscribers } from "./push";

const STATUS_MESSAGES: Partial<
  Record<
    OrderStatus,
    (order: OrderWithRelations) => { title: string; body: string }
  >
> = {
  CONFIRMED: () => ({
    title: "Заказ подтверждён",
    body: "Оплата принята, скоро начнём готовить",
  }),
  PREPARING: () => ({
    title: "Готовим ваш заказ",
    body: "Повар уже собирает блюда на кухне",
  }),
  READY: (order) => ({
    title:
      order.deliveryType === "PICKUP"
        ? "Готов к выдаче"
        : "Заказ собран",
    body:
      order.deliveryType === "PICKUP"
        ? "Можете забрать заказ в ресторане"
        : "Курьер скоро заберёт заказ",
  }),
  DELIVERED: (order) => ({
    title:
      order.deliveryType === "PICKUP" ? "Заказ выдан" : "Заказ доставлен",
    body: "Спасибо! Приятного аппетита",
  }),
};

export async function sendOrderStatusPush(
  order: OrderWithRelations,
  status: OrderStatus,
): Promise<void> {
  const build = STATUS_MESSAGES[status];
  if (!build) return;

  const { title, body } = build(order);
  const shortId = order.id.slice(-8).toUpperCase();

  await notifyOrderSubscribers(order.id, order.userId, {
    title,
    body,
    url: `/order/${order.id}`,
    tag: `order-${order.id}-${status}`,
    data: {
      orderId: order.id,
      status,
      deliveryType: order.deliveryType as DeliveryType,
    },
    titleDetail: `Заказ #${shortId}`,
  });
}
