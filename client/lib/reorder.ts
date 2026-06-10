import type { ComboDto, OrderDto, ProductDto } from "@shared/api";
import { api } from "@/lib/api";

export interface ReorderResult {
  addedProducts: number;
  addedCombos: number;
  skipped: string[];
}

function parseComboName(productName: string): string | null {
  const match = productName.match(/🍱 Комбо «([^»]+)»/);
  return match?.[1] ?? null;
}

export async function loadReorderCatalog(): Promise<{
  products: ProductDto[];
  combos: ComboDto[];
}> {
  const [productsRes, combosRes] = await Promise.all([
    api.products.list(),
    api.combos.list(),
  ]);
  return {
    products: productsRes.products,
    combos: combosRes.combos,
  };
}

export function buildReorderFromOrder(
  order: OrderDto,
  catalog: { products: ProductDto[]; combos: ComboDto[] },
): {
  products: { product: ProductDto; quantity: number }[];
  combos: { combo: ComboDto; quantity: number }[];
  skipped: string[];
} {
  const productMap = new Map(catalog.products.map((p) => [p.id, p]));
  const comboById = new Map(catalog.combos.map((c) => [c.id, c]));
  const comboByName = new Map(catalog.combos.map((c) => [c.name, c]));

  const products: { product: ProductDto; quantity: number }[] = [];
  const combos: { combo: ComboDto; quantity: number }[] = [];
  const skipped: string[] = [];

  const comboQty = new Map<string, number>();
  const productQty = new Map<string, number>();

  for (const item of order.items) {
    const comboId =
      item.comboId ??
      (() => {
        const name = parseComboName(item.productName);
        return name ? comboByName.get(name)?.id : undefined;
      })();

    if (comboId) {
      const combo = comboById.get(comboId);
      if (!combo || !combo.items.length) {
        skipped.push(item.productName.split("\n")[0]);
        continue;
      }
      comboQty.set(comboId, (comboQty.get(comboId) ?? 0) + item.quantity);
      continue;
    }

    const product = productMap.get(item.productId);
    if (!product || !product.isAvailable) {
      skipped.push(item.productName.split("\n")[0]);
      continue;
    }
    productQty.set(
      product.id,
      (productQty.get(product.id) ?? 0) + item.quantity,
    );
  }

  for (const [id, quantity] of productQty) {
    const product = productMap.get(id)!;
    products.push({ product, quantity });
  }
  for (const [id, quantity] of comboQty) {
    const combo = comboById.get(id)!;
    combos.push({ combo, quantity });
  }

  return { products, combos, skipped };
}
