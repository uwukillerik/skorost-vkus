import type { PaymentMethod, PaymentStatus } from "@shared/api";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CARD: "Банковская карта",
  SBP: "СБП",
  CASH: "Наличные при получении",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Ожидает оплаты",
  PAID: "Оплачен",
  FAILED: "Ошибка оплаты",
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  PENDING: "bg-amber-100 text-amber-900",
  PAID: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
};
