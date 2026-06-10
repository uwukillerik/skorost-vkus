import { useState, useMemo } from "react";
import type { ProductDto } from "@shared/api";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sparkles, Check } from "lucide-react";
import { toast } from "sonner";

const COMBO_DISCOUNT = 0.12;

interface BuildMealComboProps {
  main: ProductDto;
  drinks: ProductDto[];
  sides: ProductDto[];
}

export function BuildMealCombo({ main, drinks, sides }: BuildMealComboProps) {
  const { addItem } = useCart();
  const [drink, setDrink] = useState<ProductDto | null>(null);
  const [side, setSide] = useState<ProductDto | null>(null);

  const rawTotal = main.price + (drink?.price ?? 0) + (side?.price ?? 0);
  const discount =
    drink && side ? Math.round(rawTotal * COMBO_DISCOUNT) : drink || side ? Math.round(rawTotal * 0.06) : 0;
  const finalTotal = rawTotal - discount;

  const canAdd = drink || side;

  const summary = useMemo(() => {
    const parts = [main.name];
    if (drink) parts.push(drink.name);
    if (side) parts.push(side.name);
    return parts.join(" + ");
  }, [main, drink, side]);

  const handleAdd = () => {
    addItem(main, 1);
    if (drink) addItem(drink, 1);
    if (side) addItem(side, 1);
    toast.success(
      discount > 0
        ? `Набор добавлен! Экономия ${discount}₽`
        : "Добавлено в корзину",
    );
  };

  return (
    <div className="rounded-2xl border-2 border-accent/40 bg-gradient-to-br from-amber-50 to-orange-50 p-4 sm:p-6 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-black text-lg">Собери своё меню</h3>
        <span className="ml-auto text-xs font-bold bg-primary text-primary-foreground px-2 py-1 rounded-full">
          −12% за полный набор
        </span>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Добавь напиток и гарнир к {main.name} — получишь скидку на набор
      </p>

      <div className="space-y-4">
        <div>
          <p className="text-xs font-bold uppercase text-muted-foreground mb-2">
            Напиток
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {drinks.slice(0, 5).map((d) => (
              <OptionChip
                key={d.id}
                product={d}
                selected={drink?.id === d.id}
                onClick={() => setDrink(drink?.id === d.id ? null : d)}
              />
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-muted-foreground mb-2">
            Гарнир
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {sides.slice(0, 5).map((s) => (
              <OptionChip
                key={s.id}
                product={s}
                selected={side?.id === s.id}
                onClick={() => setSide(side?.id === s.id ? null : s)}
              />
            ))}
          </div>
        </div>
      </div>

      {canAdd && (
        <div className="mt-4 pt-4 border-t border-accent/30">
          <p className="text-xs text-muted-foreground mb-1 truncate">{summary}</p>
          <div className="flex items-end justify-between gap-3">
            <div>
              {discount > 0 && (
                <p className="text-sm line-through text-muted-foreground">
                  {rawTotal}₽
                </p>
              )}
              <p className="text-2xl font-black text-primary">{finalTotal}₽</p>
              {discount > 0 && (
                <p className="text-xs font-bold text-green-700">
                  Экономия {discount}₽
                </p>
              )}
            </div>
            <Button
              className="font-black rounded-full bg-primary shrink-0"
              onClick={handleAdd}
            >
              В корзину
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function OptionChip({
  product,
  selected,
  onClick,
}: {
  product: ProductDto;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-shrink-0 flex flex-col items-center gap-1 w-20 sm:w-24 p-2 rounded-xl border-2 transition-all",
        selected
          ? "border-primary bg-primary/10 shadow-md"
          : "border-border bg-white hover:border-primary/40",
      )}
    >
      <div className="relative w-14 h-14 rounded-lg overflow-hidden">
        <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
        {selected && (
          <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
            <Check className="h-6 w-6 text-white drop-shadow" />
          </div>
        )}
      </div>
      <span className="text-[10px] font-bold text-center leading-tight line-clamp-2">
        {product.name}
      </span>
      <span className="text-[10px] text-primary font-black">{product.price}₽</span>
    </button>
  );
}
