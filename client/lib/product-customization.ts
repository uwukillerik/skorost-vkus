import type { ProductDto } from "@shared/api";

export interface ProductExtra {
  id: string;
  name: string;
  price: number;
}

export interface ProductCustomization {
  removedIngredients: string[];
  extras: ProductExtra[];
}

const EXTRAS_BY_CATEGORY: Record<string, ProductExtra[]> = {
  burgers: [
    { id: "cheese", name: "Доп. сыр", price: 45 },
    { id: "bacon", name: "Бекон", price: 55 },
    { id: "egg", name: "Яйцо", price: 35 },
    { id: "jalapeno", name: "Халапеньо", price: 25 },
  ],
  chicken: [
    { id: "cheese", name: "Доп. сыр", price: 45 },
    { id: "sauce-spicy", name: "Острый соус", price: 20 },
    { id: "sauce-bbq", name: "Соус BBQ", price: 20 },
  ],
  snacks: [
    { id: "sauce-cheese", name: "Сырный соус", price: 35 },
    { id: "sauce-garlic", name: "Чесночный соус", price: 30 },
  ],
  default: [
    { id: "sauce", name: "Доп. соус", price: 25 },
  ],
};

export function parseIngredients(raw: string | null | undefined): string[] {
  if (!raw?.trim()) {
    return ["Булка", "Соус", "Овощи", "Котлета", "Сыр"];
  }
  return raw
    .split(/[,;•·\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function getExtrasForProduct(product: ProductDto): ProductExtra[] {
  const slug = product.categorySlug ?? "default";
  return EXTRAS_BY_CATEGORY[slug] ?? EXTRAS_BY_CATEGORY.default;
}

export function customizationKey(c?: ProductCustomization): string {
  if (!c) return "";
  return JSON.stringify({
    r: c.removedIngredients.sort(),
    e: c.extras.map((x) => x.id).sort(),
  });
}

export function unitPriceWithCustomization(
  product: ProductDto,
  c?: ProductCustomization,
): number {
  const extra = c?.extras.reduce((s, e) => s + e.price, 0) ?? 0;
  return product.price + extra;
}

export function formatCustomization(c?: ProductCustomization): string | null {
  if (!c) return null;
  const parts: string[] = [];
  if (c.removedIngredients.length) {
    parts.push(`без: ${c.removedIngredients.join(", ")}`);
  }
  if (c.extras.length) {
    parts.push(`+ ${c.extras.map((e) => e.name).join(", ")}`);
  }
  return parts.length ? parts.join(" · ") : null;
}
