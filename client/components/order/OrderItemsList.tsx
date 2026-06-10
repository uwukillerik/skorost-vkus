import type { OrderDto } from "@shared/api";
import { Package } from "lucide-react";

function parseItemName(name: string) {
  const lines = name.split("\n");
  return { title: lines[0], subs: lines.slice(1).filter(Boolean) };
}

export function OrderItemsList({ order }: { order: OrderDto }) {
  return (
    <div className="warm-card overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/40 flex items-center gap-2">
        <Package className="h-5 w-5 text-primary" />
        <h3 className="font-bold">Состав заказа</h3>
        <span className="ml-auto text-sm text-muted-foreground">
          {order.items.length} поз.
        </span>
      </div>
      <ul className="divide-y divide-border/60">
        {order.items.map((item) => {
          const { title, subs } = parseItemName(item.productName);
          return (
            <li
              key={item.id}
              className="px-4 py-3 flex justify-between gap-3 items-start"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm leading-snug">{title}</p>
                {subs.length > 0 && (
                  <ul className="mt-1 text-xs text-muted-foreground space-y-0.5">
                    {subs.map((s, i) => (
                      <li key={i}>• {s}</li>
                    ))}
                  </ul>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {item.quantity} × {item.unitPrice}₽
                </p>
              </div>
              <p className="font-bold text-primary shrink-0">{item.subtotal}₽</p>
            </li>
          );
        })}
      </ul>
      <div className="px-4 py-3 bg-muted/30 space-y-1.5 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Товары</span>
          <span>{order.subtotal}₽</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Доставка</span>
          <span>{order.deliveryFee}₽</span>
        </div>
        <div className="flex justify-between font-extrabold text-base pt-1 border-t border-border/60">
          <span>Итого</span>
          <span className="text-primary">{order.totalAmount}₽</span>
        </div>
      </div>
    </div>
  );
}
