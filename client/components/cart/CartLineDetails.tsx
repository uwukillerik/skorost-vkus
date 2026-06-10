import type { CartItem, CartCombo } from "@/context/CartContext";
import { formatCustomization } from "@/lib/product-customization";
import { formatComboPicks } from "@/lib/combo-customize";

export function CartItemDetails({ item }: { item: CartItem }) {
  const custom = formatCustomization(item.customization);
  if (!custom) return null;
  return (
    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{custom}</p>
  );
}

export function CartComboDetails({ combo }: { combo: CartCombo }) {
  const lines = formatComboPicks(combo.picks);
  return (
    <ul className="mt-2 space-y-0.5">
      {lines.map((name, i) => (
        <li
          key={`${combo.lineId}-${i}`}
          className="text-xs text-muted-foreground flex items-start gap-1.5"
        >
          <span className="text-primary font-bold">•</span>
          <span>{name}</span>
        </li>
      ))}
    </ul>
  );
}
