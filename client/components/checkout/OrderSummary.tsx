import type { CartItem, CartCombo } from "@/context/CartContext";
import { calcDeliveryFee, FREE_DELIVERY_FROM } from "@/lib/delivery";
import type { DeliveryType } from "@shared/api";
import { unitPriceWithCustomization } from "@/lib/product-customization";
import { CartComboDetails, CartItemDetails } from "@/components/cart/CartLineDetails";

interface OrderSummaryProps {
  items: CartItem[];
  combos: CartCombo[];
  deliveryType: DeliveryType;
}

export function OrderSummary({ items, combos, deliveryType }: OrderSummaryProps) {
  const productsSub = items.reduce(
    (s, i) =>
      s + unitPriceWithCustomization(i.product, i.customization) * i.quantity,
    0,
  );
  const combosSub = combos.reduce((s, c) => s + c.unitPrice * c.quantity, 0);
  const subtotal = productsSub + combosSub;
  const deliveryFee = calcDeliveryFee(subtotal, deliveryType);
  const total = subtotal + deliveryFee;

  return (
    <div className="bg-muted/50 rounded-2xl p-4 space-y-3 text-sm border-2 border-dashed border-primary/20">
      {combos.map((c) => (
        <div key={c.lineId}>
          <div className="flex justify-between gap-2">
            <span className="truncate font-semibold">
              🍱 {c.combo.name} × {c.quantity}
            </span>
            <span className="font-medium shrink-0">
              {c.unitPrice * c.quantity}₽
            </span>
          </div>
          <CartComboDetails combo={c} />
        </div>
      ))}
      {items.map((i) => (
        <div key={i.lineId}>
          <div className="flex justify-between gap-2">
            <span className="truncate font-semibold">
              {i.product.name} × {i.quantity}
            </span>
            <span className="font-medium shrink-0">
              {unitPriceWithCustomization(i.product, i.customization) *
                i.quantity}
              ₽
            </span>
          </div>
          <CartItemDetails item={i} />
        </div>
      ))}
      <div className="border-t border-primary/20 pt-2 space-y-1">
        <div className="flex justify-between text-muted-foreground">
          <span>Подытог</span>
          <span>{subtotal}₽</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>
            {deliveryType === "PICKUP"
              ? "Самовывоз"
              : deliveryFee === 0
                ? "Доставка бесплатно"
                : "Доставка"}
          </span>
          <span>{deliveryFee === 0 ? "0₽" : `${deliveryFee}₽`}</span>
        </div>
        {deliveryType === "DELIVERY" && subtotal < FREE_DELIVERY_FROM && (
          <p className="text-xs text-primary font-medium">
            +{FREE_DELIVERY_FROM - subtotal}₽ до бесплатной доставки
          </p>
        )}
        <div className="flex justify-between font-black text-lg pt-1 text-foreground">
          <span>ИТОГО</span>
          <span className="text-primary">{total}₽</span>
        </div>
      </div>
    </div>
  );
}

export function useOrderTotals(
  items: CartItem[],
  combos: CartCombo[],
  deliveryType: DeliveryType,
) {
  const productsSub = items.reduce(
    (s, i) =>
      s + unitPriceWithCustomization(i.product, i.customization) * i.quantity,
    0,
  );
  const combosSub = combos.reduce((s, c) => s + c.unitPrice * c.quantity, 0);
  const subtotal = productsSub + combosSub;
  const deliveryFee = calcDeliveryFee(subtotal, deliveryType);
  return { subtotal, deliveryFee, total: subtotal + deliveryFee };
}
