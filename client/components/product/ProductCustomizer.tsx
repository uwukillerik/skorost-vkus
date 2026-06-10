import { useMemo, useState } from "react";
import type { ProductDto } from "@shared/api";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  parseIngredients,
  getExtrasForProduct,
  unitPriceWithCustomization,
  type ProductCustomization,
  type ProductExtra,
} from "@/lib/product-customization";

interface ProductCustomizerProps {
  product: ProductDto;
  onAdd: (quantity: number, customization: ProductCustomization) => void;
  loading?: boolean;
}

export function ProductCustomizer({
  product,
  onAdd,
  loading,
}: ProductCustomizerProps) {
  const [quantity, setQuantity] = useState(1);
  const ingredients = useMemo(
    () => parseIngredients(product.ingredients),
    [product.ingredients],
  );
  const extras = useMemo(() => getExtrasForProduct(product), [product]);
  const [removed, setRemoved] = useState<string[]>([]);
  const [addedExtras, setAddedExtras] = useState<ProductExtra[]>([]);

  const customization: ProductCustomization = {
    removedIngredients: removed,
    extras: addedExtras,
  };

  const unitPrice = unitPriceWithCustomization(product, customization);
  const lineTotal = unitPrice * quantity;

  const toggleIngredient = (name: string) => {
    setRemoved((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name],
    );
  };

  const toggleExtra = (extra: ProductExtra) => {
    setAddedExtras((prev) =>
      prev.some((e) => e.id === extra.id)
        ? prev.filter((e) => e.id !== extra.id)
        : [...prev, extra],
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col min-[420px]:flex-row min-[420px]:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-primary/5 border border-primary/15">
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase">
            Количество
          </p>
          <div className="flex items-center gap-3 mt-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-xl"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
            >
              <Minus className="h-5 w-5" />
            </Button>
            <span className="text-2xl font-black w-10 text-center">
              {quantity}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-xl"
              onClick={() => setQuantity((q) => Math.min(99, q + 1))}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="text-left min-[420px]:text-right">
          <p className="text-xs text-muted-foreground">Итого</p>
          <p className="text-2xl sm:text-3xl font-black text-primary">{lineTotal}₽</p>
          {unitPrice !== product.price && (
            <p className="text-xs text-muted-foreground">
              {unitPrice}₽ / шт.
            </p>
          )}
        </div>
      </div>

      <div>
        <h3 className="font-bold text-sm mb-2">Состав — убрать ингредиент</h3>
        <div className="flex flex-wrap gap-2">
          {ingredients.map((ing) => {
            const isOut = removed.includes(ing);
            return (
              <button
                key={ing}
                type="button"
                onClick={() => toggleIngredient(ing)}
                className={cn(
                  "px-3 py-2 rounded-xl text-sm font-semibold border-2 transition-all",
                  isOut
                    ? "border-destructive/40 bg-destructive/10 text-destructive line-through"
                    : "border-border bg-card hover:border-primary/40",
                )}
              >
                {ing}
              </button>
            );
          })}
        </div>
      </div>

      {extras.length > 0 && (
        <div>
          <h3 className="font-bold text-sm mb-2">Добавить к блюду</h3>
          <div className="flex flex-wrap gap-2">
            {extras.map((ex) => {
              const on = addedExtras.some((e) => e.id === ex.id);
              return (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => toggleExtra(ex)}
                  className={cn(
                    "px-3 py-2 rounded-xl text-sm font-semibold border-2 transition-all",
                    on
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card hover:border-primary/40",
                  )}
                >
                  {ex.name}{" "}
                  <span className="text-primary font-black">+{ex.price}₽</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <Button
        size="lg"
        className="w-full bg-accent text-secondary font-black h-14 text-lg rounded-2xl"
        disabled={loading}
        onClick={() => onAdd(quantity, customization)}
      >
        <ShoppingBag className="h-5 w-5 mr-2" />
        В корзину · {lineTotal}₽
      </Button>
    </div>
  );
}
