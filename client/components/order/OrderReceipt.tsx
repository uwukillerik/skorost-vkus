import { format } from "date-fns";
import { ru } from "date-fns/locale";
import type { OrderDto } from "@shared/api";
import { PAYMENT_METHOD_LABELS } from "@/lib/payment-labels";
import { PAYMENT_STATUS_LABELS } from "@/lib/payment-labels";
import { Flame } from "lucide-react";

interface OrderReceiptProps {
  order: OrderDto;
  id?: string;
  compact?: boolean;
}

function parseItemName(name: string) {
  const lines = name.split("\n");
  const title = lines[0];
  const subs = lines.slice(1).filter(Boolean);
  return { title, subs };
}

export function OrderReceipt({
  order,
  id = "order-receipt",
  compact = false,
}: OrderReceiptProps) {
  return (
    <div
      id={id}
      className={`relative print-receipt-root ${compact ? "w-full" : "max-w-md mx-auto"}`}
    >
      <div
        className={`bg-muted flex justify-center gap-1.5 items-center overflow-hidden ${
          compact ? "h-2 rounded-t-md" : "h-3 rounded-t-lg"
        }`}
      >
        {Array.from({ length: compact ? 16 : 24 }).map((_, i) => (
          <div
            key={i}
            className={`rounded-full bg-background -mt-1 ${compact ? "w-1.5 h-1.5" : "w-2 h-2"}`}
          />
        ))}
      </div>

      <div
        className={`bg-[#fffef8] text-gray-900 shadow-md border border-gray-200 font-mono ${
          compact ? "px-3 py-4 text-[11px]" : "px-5 sm:px-6 py-6 text-sm shadow-lg border-x border-b"
        }`}
        style={{
          backgroundImage:
            "repeating-linear-gradient(transparent, transparent 27px, rgba(0,0,0,0.03) 27px, rgba(0,0,0,0.03) 28px)",
        }}
      >
        <div
          className={`text-center border-b-2 border-dashed border-gray-300 ${
            compact ? "pb-2 mb-2" : "pb-4 mb-4"
          }`}
        >
          <div
            className={`inline-flex items-center gap-2 justify-center ${compact ? "mb-1" : "mb-2"}`}
          >
            <Flame className={compact ? "h-4 w-4 text-primary" : "h-6 w-6 text-primary"} />
            <span
              className={`font-black tracking-tight font-sans ${
                compact ? "text-sm" : "text-lg"
              }`}
            >
              СКОРОСТЬ & ВКУС
            </span>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-gray-500">
            ООО «Быстрое питание»
          </p>
          <p className="text-[10px] text-gray-500 mt-1">
            ИНН 7700000000 · ККТ №0042
          </p>
        </div>

        <div className="space-y-1 text-xs mb-4">
          <div className="flex justify-between">
            <span className="text-gray-500">ЧЕК №</span>
            <span className="font-bold">{order.id.slice(-8).toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">ДАТА</span>
            <span>
              {format(new Date(order.createdAt), "dd.MM.yyyy HH:mm", {
                locale: ru,
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">ТИП</span>
            <span>
              {order.deliveryType === "PICKUP" ? "САМОВЫВОЗ" : "ДОСТАВКА"}
            </span>
          </div>
          {order.paymentMethod && (
            <div className="flex justify-between">
              <span className="text-gray-500">ОПЛАТА</span>
              <span>{PAYMENT_METHOD_LABELS[order.paymentMethod]}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500">СТАТУС ОПЛ.</span>
            <span className="font-bold">
              {PAYMENT_STATUS_LABELS[order.paymentStatus]}
            </span>
          </div>
          {order.paymentId && (
            <div className="flex justify-between gap-2">
              <span className="text-gray-500 shrink-0">TXN</span>
              <span className="text-right break-all">{order.paymentId}</span>
            </div>
          )}
        </div>

        <div className="border-t border-dashed border-gray-300 pt-3 mb-3">
          <p className="text-[10px] text-gray-500 uppercase mb-2">Позиции</p>
          {order.items.map((item) => {
            const { title, subs } = parseItemName(item.productName);
            return (
              <div key={item.id} className="mb-3">
                <div className="flex justify-between gap-2 font-bold text-xs">
                  <span className="flex-1">
                    {item.quantity}× {title}
                  </span>
                  <span className="shrink-0">{item.subtotal}₽</span>
                </div>
                {subs.map((s, i) => (
                  <p key={i} className="text-[10px] text-gray-600 pl-3 mt-0.5">
                    {s}
                  </p>
                ))}
              </div>
            );
          })}
        </div>

        <div className="border-t-2 border-double border-gray-400 pt-3 space-y-1 text-xs">
          <div className="flex justify-between">
            <span>ПОДЫТОГ</span>
            <span>{order.subtotal}₽</span>
          </div>
          <div className="flex justify-between">
            <span>ДОСТАВКА</span>
            <span>{order.deliveryFee === 0 ? "0₽" : `${order.deliveryFee}₽`}</span>
          </div>
          <div className="flex justify-between text-base font-black pt-2 border-t border-gray-300 mt-2">
            <span>ИТОГО</span>
            <span>{order.totalAmount}₽</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-dashed text-[10px] text-gray-500 text-center space-y-1">
          <p>{order.address}</p>
          {order.comment && <p>Коммент: {order.comment}</p>}
          <p className="pt-2 font-sans">★ Спасибо за заказ! ★</p>
          <p>hello@skorost-vkus.ru · +7 (999) 123-45-67</p>
        </div>
      </div>

      <div className="h-2 bg-gradient-to-b from-gray-200 to-transparent" />
    </div>
  );
}
