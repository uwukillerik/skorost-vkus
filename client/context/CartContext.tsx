import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ProductDto, ComboDto } from "@shared/api";
import type { ProductCustomization } from "@/lib/product-customization";
import {
  customizationKey,
  unitPriceWithCustomization,
} from "@/lib/product-customization";
import type { ComboSlotPick } from "@/lib/combo-customize";
import {
  comboLinePrice,
  picksKey,
  buildComboSlots,
  picksFromDefaults,
} from "@/lib/combo-customize";

export interface CartItem {
  lineId: string;
  product: ProductDto;
  quantity: number;
  customization?: ProductCustomization;
}

export interface CartCombo {
  lineId: string;
  combo: ComboDto;
  quantity: number;
  picks: ComboSlotPick[];
  unitPrice: number;
}

interface CartStorage {
  items: CartItem[];
  combos: CartCombo[];
}

interface CartContextValue {
  items: CartItem[];
  combos: CartCombo[];
  itemCount: number;
  total: number;
  addItem: (
    product: ProductDto,
    qty?: number,
    customization?: ProductCustomization,
  ) => string;
  addCombo: (
    combo: ComboDto,
    qty?: number,
    picks?: ComboSlotPick[],
    catalog?: ProductDto[],
  ) => string;
  removeItem: (lineId: string) => void;
  removeCombo: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  updateComboQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
}

const STORAGE_KEY = "skorost-cart-v3";

function newLineId() {
  return `line-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadCart(): CartStorage {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: [], combos: [] };
    const parsed = JSON.parse(raw);
    const items = (parsed.items ?? []).map((i: CartItem) => ({
      ...i,
      lineId: i.lineId ?? newLineId(),
    }));
    const combos = (parsed.combos ?? []).map((c: CartCombo) => ({
      ...c,
      lineId: c.lineId ?? newLineId(),
      picks: c.picks ?? [],
      unitPrice: c.unitPrice ?? c.combo?.price ?? 0,
    }));
    return { items, combos };
  } catch {
    return { items: [], combos: [] };
  }
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadCart().items);
  const [combos, setCombos] = useState<CartCombo[]>(() => loadCart().combos);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, combos }));
  }, [items, combos]);

  const addItem = useCallback(
    (product: ProductDto, qty = 1, customization?: ProductCustomization) => {
      const key = customizationKey(customization);
      let lineId = newLineId();
      setItems((prev) => {
        const existing = prev.find(
          (i) =>
            i.product.id === product.id &&
            customizationKey(i.customization) === key,
        );
        if (existing) {
          lineId = existing.lineId;
          return prev.map((i) =>
            i.lineId === existing.lineId
              ? { ...i, quantity: i.quantity + qty }
              : i,
          );
        }
        return [...prev, { lineId, product, quantity: qty, customization }];
      });
      return lineId;
    },
    [],
  );

  const addCombo = useCallback(
    (
      combo: ComboDto,
      qty = 1,
      picks?: ComboSlotPick[],
      catalog: ProductDto[] = [],
    ) => {
      const slots = buildComboSlots(combo, catalog);
      const resolvedPicks = picks ?? picksFromDefaults(slots);
      const unitPrice = comboLinePrice(combo, resolvedPicks, slots);
      const pKey = picksKey(resolvedPicks);
      let lineId = newLineId();

      setCombos((prev) => {
        const existing = prev.find(
          (c) => c.combo.id === combo.id && picksKey(c.picks) === pKey,
        );
        if (existing) {
          lineId = existing.lineId;
          return prev.map((c) =>
            c.lineId === existing.lineId
              ? { ...c, quantity: c.quantity + qty }
              : c,
          );
        }
        return [
          ...prev,
          { lineId, combo, quantity: qty, picks: resolvedPicks, unitPrice },
        ];
      });
      return lineId;
    },
    [],
  );

  const removeItem = useCallback((lineId: string) => {
    setItems((prev) => prev.filter((i) => i.lineId !== lineId));
  }, []);

  const removeCombo = useCallback((lineId: string) => {
    setCombos((prev) => prev.filter((c) => c.lineId !== lineId));
  }, []);

  const updateQuantity = useCallback((lineId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.lineId !== lineId));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.lineId === lineId ? { ...i, quantity } : i)),
    );
  }, []);

  const updateComboQuantity = useCallback((lineId: string, quantity: number) => {
    if (quantity <= 0) {
      setCombos((prev) => prev.filter((c) => c.lineId !== lineId));
      return;
    }
    setCombos((prev) =>
      prev.map((c) => (c.lineId === lineId ? { ...c, quantity } : c)),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setCombos([]);
  }, []);

  const itemCount = useMemo(
    () =>
      items.reduce((s, i) => s + i.quantity, 0) +
      combos.reduce((s, c) => s + c.quantity, 0),
    [items, combos],
  );

  const total = useMemo(
    () =>
      items.reduce(
        (s, i) =>
          s +
          unitPriceWithCustomization(i.product, i.customization) * i.quantity,
        0,
      ) + combos.reduce((s, c) => s + c.unitPrice * c.quantity, 0),
    [items, combos],
  );

  const value = useMemo(
    () => ({
      items,
      combos,
      itemCount,
      total,
      addItem,
      addCombo,
      removeItem,
      removeCombo,
      updateQuantity,
      updateComboQuantity,
      clearCart,
    }),
    [
      items,
      combos,
      itemCount,
      total,
      addItem,
      addCombo,
      removeItem,
      removeCombo,
      updateQuantity,
      updateComboQuantity,
      clearCart,
    ],
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
