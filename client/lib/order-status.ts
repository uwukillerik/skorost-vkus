import type { OrderStatus } from "@shared/api";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: "Новый",
  CONFIRMED: "Подтверждён",
  PREPARING: "Готовится",
  READY: "Готов",
  DELIVERED: "Доставлен",
  CANCELLED: "Отменён",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  NEW: "bg-blue-100 text-blue-800",
  CONFIRMED: "bg-indigo-100 text-indigo-800",
  PREPARING: "bg-yellow-100 text-yellow-900",
  READY: "bg-green-100 text-green-800",
  DELIVERED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-800",
};
