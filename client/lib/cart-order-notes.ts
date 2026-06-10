import type { CartItem, CartCombo } from "@/context/CartContext";
import { formatCustomization } from "@/lib/product-customization";
import { formatComboPicks } from "@/lib/combo-customize";

export function buildOrderNotes(
  items: CartItem[],
  combos: CartCombo[],
  userComment?: string,
): string | undefined {
  const parts: string[] = [];

  for (const item of items) {
    const custom = formatCustomization(item.customization);
    if (custom) {
      parts.push(`${item.product.name} (${custom})`);
    }
  }

  for (const c of combos) {
    const picks = formatComboPicks(c.picks).join(", ");
    parts.push(`Комбо «${c.combo.name}»: ${picks}`);
  }

  if (userComment?.trim()) {
    parts.push(userComment.trim());
  }

  return parts.length ? parts.join(" | ") : userComment?.trim() || undefined;
}
