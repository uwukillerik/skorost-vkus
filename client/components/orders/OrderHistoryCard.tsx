import { Link } from "react-router-dom";
import { format, isToday, isYesterday } from "date-fns";
import { ru } from "date-fns/locale";
import type { OrderDto, OrderStatus } from "@shared/api";
import {
  getActiveStepIndex,
  getProgressPercent,
  TRACKING_STEPS,
} from "@/lib/order-tracking";
import { PAYMENT_METHOD_LABELS } from "@/lib/payment-labels";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  MapPin,
  CreditCard,
  Package,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReorderButton } from "@/components/orders/ReorderButton";

function statusLabel(status: OrderStatus): string {
  const step = TRACKING_STEPS.find((s) => s.statusKeys.includes(status));
  if (status === "CANCELLED") return "Отменён";
  return step?.label ?? status;
}

function statusTone(
  order: OrderDto,
  stepIdx: number,
): "muted" | "warn" | "cook" | "ok" | "cancel" {
  if (order.status === "CANCELLED") return "cancel";
  if (order.paymentStatus === "PENDING") {
    return "warn";
  }
  if (order.status === "PREPARING" || order.status === "CONFIRMED") {
    return "cook";
  }
  if (order.status === "DELIVERED") return "ok";
  return stepIdx >= 2 ? "cook" : "muted";
}

const toneStyles = {
  muted: "bg-muted text-muted-foreground",
  warn: "bg-amber-100 text-amber-900 border-amber-200",
  cook: "bg-orange-100 text-orange-900 border-orange-200",
  ok: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancel: "bg-muted text-muted-foreground",
};

export function OrderHistoryCard({ order }: { order: OrderDto }) {
  const progress = getProgressPercent(order.status);
  const stepIdx = getActiveStepIndex(order.status);
  const cancelled = order.status === "CANCELLED";
  const tone = statusTone(order, stepIdx);
  const label =
    order.paymentStatus === "PENDING" && order.status !== "CANCELLED"
      ? "Ожидает оплаты"
      : statusLabel(order.status);

  return (
    <Link to={`/order/${order.id}`} className="block group">
      <article
        className={cn(
          "warm-card overflow-hidden transition-all duration-200",
          "hover:shadow-lg hover:border-primary/25",
          cancelled && "opacity-75",
        )}
      >
        <div className="h-1.5 bg-muted">
          {!cancelled && (
            <div
              className="h-full bg-gradient-to-r from-primary to-orange-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          )}
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex gap-3 sm:gap-4">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br from-primary/15 to-orange-500/10 flex items-center justify-center shrink-0">
              <Package className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between gap-2 items-start">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {formatOrderDate(order.createdAt)}
                  </p>
                  <p className="font-bold text-base sm:text-lg">
                    Заказ #{order.id.slice(-8).toUpperCase()}
                  </p>
                </div>
                <p className="text-xl sm:text-2xl font-extrabold text-primary shrink-0">
                  {order.totalAmount}₽
                </p>
              </div>

              <span
                className={cn(
                  "inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-xs font-bold border",
                  toneStyles[tone],
                )}
              >
                {order.status === "PREPARING" && (
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                )}
                {label}
              </span>
            </div>
          </div>

          {!cancelled && (
            <div className="flex gap-1 mt-4">
              {TRACKING_STEPS.map((step, i) => (
                <div
                  key={step.id}
                  title={step.label}
                  className={cn(
                    "h-1 flex-1 rounded-full",
                    i <= stepIdx ? "bg-primary" : "bg-muted",
                  )}
                />
              ))}
            </div>
          )}

          <ul className="mt-3 space-y-1">
            {order.items.slice(0, 3).map((item) => (
              <li
                key={item.id}
                className="text-sm text-muted-foreground flex justify-between gap-2"
              >
                <span className="truncate">
                  {item.productName} × {item.quantity}
                </span>
                <span className="font-medium text-foreground shrink-0">
                  {item.subtotal}₽
                </span>
              </li>
            ))}
            {order.items.length > 3 && (
              <li className="text-xs text-primary font-semibold">
                + ещё {order.items.length - 3} поз.
              </li>
            )}
          </ul>

          <div className="flex flex-wrap gap-2 mt-3 text-[11px] text-muted-foreground">
            {order.paymentMethod && (
              <span className="inline-flex items-center gap-1 bg-muted/60 rounded-md px-2 py-0.5">
                <CreditCard className="h-3 w-3" />
                {PAYMENT_METHOD_LABELS[order.paymentMethod]}
              </span>
            )}
            <span className="inline-flex items-center gap-1 bg-muted/60 rounded-md px-2 py-0.5 max-w-full truncate">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{order.address}</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-border/60">
            <span className="text-sm font-semibold text-primary group-hover:underline">
              Подробнее и трекер
            </span>
            <div className="flex items-center gap-2">
              <ReorderButton
                order={order}
                className="rounded-xl text-xs h-9"
              />
              <ChevronRight className="h-5 w-5 text-primary group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

function formatOrderDate(iso: string): string {
  const d = new Date(iso);
  const time = format(d, "HH:mm", { locale: ru });
  if (isToday(d)) return `Сегодня, ${time}`;
  if (isYesterday(d)) return `Вчера, ${time}`;
  return format(d, "d MMMM, HH:mm", { locale: ru });
}

export function groupOrdersByDate(orders: OrderDto[]) {
  const groups: { title: string; orders: OrderDto[] }[] = [];
  const today: OrderDto[] = [];
  const yesterday: OrderDto[] = [];
  const earlier: OrderDto[] = [];

  for (const o of orders) {
    const d = new Date(o.createdAt);
    if (isToday(d)) today.push(o);
    else if (isYesterday(d)) yesterday.push(o);
    else earlier.push(o);
  }

  if (today.length) groups.push({ title: "Сегодня", orders: today });
  if (yesterday.length) groups.push({ title: "Вчера", orders: yesterday });
  if (earlier.length) groups.push({ title: "Ранее", orders: earlier });
  return groups;
}

export const ACTIVE_STATUSES: OrderStatus[] = [
  "NEW",
  "CONFIRMED",
  "PREPARING",
  "READY",
];

export function OrdersEmpty({ filtered }: { filtered?: boolean }) {
  return (
    <div className="text-center py-16 px-6 warm-card border-dashed">
      <Package className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
      <p className="font-bold text-lg mb-1">
        {filtered ? "Таких заказов нет" : "Пока нет заказов"}
      </p>
      <p className="text-sm text-muted-foreground mb-6">
        {filtered
          ? "Попробуйте другой фильтр"
          : "Соберите корзину в меню — доставим быстро"}
      </p>
      <Button asChild className="rounded-xl font-bold">
        <Link to="/menu">
          <RotateCcw className="h-4 w-4 mr-2" />
          Перейти в меню
        </Link>
      </Button>
    </div>
  );
}
