import type { ComboDto, ComboItemDto, ProductDto } from "@shared/api";

export interface ComboSlotPick {
  slotKey: string;
  slotLabel: string;
  productId: string;
  productName: string;
  price: number;
}

export interface ComboSlotConfig {
  slotKey: string;
  slotLabel: string;
  defaultProductId: string;
  defaultName: string;
  defaultPrice: number;
  options: ProductDto[];
}

const SLOT_LABELS: Record<string, string> = {
  burgers: "Выберите бургер",
  chicken: "Выберите курицу",
  snacks: "Выберите гарнир",
  drinks: "Выберите напиток",
  desserts: "Десерт",
};

function slotKeyFromCategory(slug: string | undefined, index: number): string {
  return `${slug ?? "item"}-${index}`;
}

function slotLabelFromCategory(slug: string | undefined): string {
  return SLOT_LABELS[slug ?? ""] ?? "Выберите позицию";
}

export function buildComboSlots(
  combo: ComboDto,
  catalog: ProductDto[],
): ComboSlotConfig[] {
  const byCategory = new Map<string, ProductDto[]>();
  for (const p of catalog) {
    if (!p.isAvailable) continue;
    const slug = p.categorySlug ?? "other";
    const list = byCategory.get(slug) ?? [];
    list.push(p);
    byCategory.set(slug, list);
  }

  return combo.items.map((item, index) => {
    const linked = item.productId
      ? catalog.find((p) => p.id === item.productId)
      : undefined;
    const categorySlug = linked?.categorySlug ?? guessCategory(item.name);
    const options =
      byCategory.get(categorySlug)?.length
        ? byCategory.get(categorySlug)!
        : linked
          ? [linked]
          : [];

    const defaultPrice = linked?.price ?? 0;

    return {
      slotKey: slotKeyFromCategory(categorySlug, index),
      slotLabel: slotLabelFromCategory(categorySlug),
      defaultProductId: linked?.id ?? item.productId ?? item.id,
      defaultName: item.name,
      defaultPrice,
      options: options.length ? options : linked ? [linked] : [],
    };
  });
}

function guessCategory(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("бургер") || n.includes("классик") || n.includes("двойн")) {
    return "burgers";
  }
  if (n.includes("чикен") || n.includes("наггет") || n.includes("стрипс")) {
    return "chicken";
  }
  if (n.includes("картош") || n.includes("фри") || n.includes("наггет")) {
    return "snacks";
  }
  if (
    n.includes("кола") ||
    n.includes("напит") ||
    n.includes("коктейл") ||
    n.includes("сок") ||
    n.includes("чай")
  ) {
    return "drinks";
  }
  return "snacks";
}

export function picksFromDefaults(slots: ComboSlotConfig[]): ComboSlotPick[] {
  return slots.map((s) => {
    const def =
      s.options.find((p) => p.id === s.defaultProductId) ?? s.options[0];
    return {
      slotKey: s.slotKey,
      slotLabel: s.slotLabel,
      productId: def?.id ?? s.defaultProductId,
      productName: def?.name ?? s.defaultName,
      price: def?.price ?? s.defaultPrice,
    };
  });
}

export function comboLinePrice(
  combo: ComboDto,
  picks: ComboSlotPick[],
  slots: ComboSlotConfig[],
): number {
  let delta = 0;
  for (const slot of slots) {
    const pick = picks.find((p) => p.slotKey === slot.slotKey);
    if (!pick) continue;
    delta += pick.price - slot.defaultPrice;
  }
  return Math.max(combo.price + delta, 0);
}

export function formatComboPicks(picks: ComboSlotPick[]): string[] {
  return picks.map((p) => p.productName);
}

export function picksKey(picks: ComboSlotPick[]): string {
  return picks.map((p) => `${p.slotKey}:${p.productId}`).join("|");
}
