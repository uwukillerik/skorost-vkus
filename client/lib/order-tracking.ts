import type { OrderStatus } from "@shared/api";
import {
  ClipboardCheck,
  ChefHat,
  Flame,
  PackageCheck,
  Bike,
  XCircle,
  CreditCard,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface TrackingStep {
  id: string;
  statusKeys: OrderStatus[];
  label: string;
  description: string;
  icon: LucideIcon;
  eta?: string;
}

export const TRACKING_STEPS: TrackingStep[] = [
  {
    id: "placed",
    statusKeys: ["NEW"],
    label: "Заказ принят",
    description: "Мы получили ваш заказ и скоро начнём готовить",
    icon: ClipboardCheck,
    eta: "1–2 мин",
  },
  {
    id: "confirmed",
    statusKeys: ["CONFIRMED"],
    label: "Подтверждён",
    description: "Оплата прошла, заказ передан на кухню",
    icon: CreditCard,
    eta: "2–3 мин",
  },
  {
    id: "preparing",
    statusKeys: ["PREPARING"],
    label: "Готовим",
    description: "Повар собирает ваш заказ — пахнет уже вкусно!",
    icon: ChefHat,
    eta: "10–15 мин",
  },
  {
    id: "ready",
    statusKeys: ["READY"],
    label: "Собран",
    description: "Заказ упакован и ждёт курьера или вас в ресторане",
    icon: PackageCheck,
    eta: "2–5 мин",
  },
  {
    id: "delivered",
    statusKeys: ["DELIVERED"],
    label: "Доставлен",
    description: "Приятного аппетита! Спасибо, что выбрали нас",
    icon: Bike,
  },
];

export function getActiveStepIndex(status: OrderStatus): number {
  if (status === "CANCELLED") return -1;
  const idx = TRACKING_STEPS.findIndex((s) => s.statusKeys.includes(status));
  if (idx >= 0) return idx;
  if (status === "DELIVERED") return TRACKING_STEPS.length - 1;
  return 0;
}

export function getProgressPercent(status: OrderStatus): number {
  if (status === "CANCELLED") return 0;
  const idx = getActiveStepIndex(status);
  if (idx < 0) return 0;
  return Math.round(((idx + 1) / TRACKING_STEPS.length) * 100);
}

export const CANCELLED_STEP = {
  label: "Заказ отменён",
  description: "Если это ошибка — свяжитесь с поддержкой",
  icon: XCircle,
};
