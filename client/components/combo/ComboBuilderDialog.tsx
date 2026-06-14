import { useEffect, useMemo, useState } from "react";
import type { ComboDto, ProductDto } from "@shared/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Check, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { SafeImage } from "@/components/SafeImage";
import {
  buildComboSlots,
  comboLinePrice,
  picksFromDefaults,
  type ComboSlotConfig,
  type ComboSlotPick,
} from "@/lib/combo-customize";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

interface ComboBuilderDialogProps {
  combo: ComboDto | null;
  catalog: ProductDto[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ComboBuilderDialog({
  combo,
  catalog,
  open,
  onOpenChange,
}: ComboBuilderDialogProps) {
  const { addCombo } = useCart();
  const [step, setStep] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [picks, setPicks] = useState<ComboSlotPick[]>([]);

  const slots = useMemo(
    () => (combo ? buildComboSlots(combo, catalog) : []),
    [combo, catalog],
  );

  useEffect(() => {
    if (combo && open) {
      setStep(0);
      setQuantity(1);
      setPicks(picksFromDefaults(buildComboSlots(combo, catalog)));
    }
  }, [combo?.id, open, catalog]);

  if (!combo) return null;

  const currentSlot = slots[step];
  const unitPrice = comboLinePrice(combo, picks, slots);
  const isLast = step >= slots.length - 1;

  const setPickForSlot = (slot: ComboSlotConfig, product: ProductDto) => {
    setPicks((prev) => {
      const rest = prev.filter((p) => p.slotKey !== slot.slotKey);
      return [
        ...rest,
        {
          slotKey: slot.slotKey,
          slotLabel: slot.slotLabel,
          productId: product.id,
          productName: product.name,
          price: product.price,
        },
      ];
    });
  };

  const currentPick = picks.find((p) => p.slotKey === currentSlot?.slotKey);

  const handleNext = () => {
    if (!currentPick) return;
    if (isLast) {
      addCombo(combo, quantity, picks, catalog);
      toast.success(`${combo.name} в корзине`, {
        description: picks.map((p) => p.productName).join(" · "),
      });
      onOpenChange(false);
      return;
    }
    setStep((s) => s + 1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-lg sm:max-w-lg rounded-2xl sm:rounded-3xl p-0 gap-0 max-h-[min(85dvh,720px)] sm:max-h-[90vh] overflow-hidden flex flex-col max-sm:fixed max-sm:inset-x-2 max-sm:bottom-[max(0.5rem,var(--safe-bottom,env(safe-area-inset-bottom,0px)))] max-sm:top-auto max-sm:translate-x-0 max-sm:translate-y-0">
        <div className="relative h-36 sm:h-44 shrink-0">
          <SafeImage
            src={combo.imageUrl}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <DialogHeader className="absolute bottom-0 left-0 right-0 p-4 text-left">
            <p className="text-accent text-xs font-black uppercase">
              Собери комбо
            </p>
            <DialogTitle className="text-white text-xl font-extrabold">
              {combo.name}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="px-4 pt-3 flex gap-1">
          {slots.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                i <= step ? "bg-primary" : "bg-muted",
              )}
            />
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {currentSlot && (
            <>
              <p className="text-xs font-bold text-primary uppercase mb-1">
                Шаг {step + 1} из {slots.length}
              </p>
              <h3 className="font-extrabold text-lg mb-3">
                {currentSlot.slotLabel}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {currentSlot.options.map((opt) => {
                  const selected = currentPick?.productId === opt.id;
                  const delta = opt.price - currentSlot.defaultPrice;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPickForSlot(currentSlot, opt)}
                      className={cn(
                        "relative text-left rounded-xl border-2 p-2 transition-all",
                        selected
                          ? "border-primary bg-primary/10 shadow-md"
                          : "border-border bg-card hover:border-primary/30",
                      )}
                    >
                      <SafeImage
                        src={opt.imageUrl}
                        alt=""
                        className="w-full aspect-square rounded-lg object-cover mb-2"
                      />
                      <p className="text-xs font-bold leading-tight line-clamp-2">
                        {opt.name}
                      </p>
                      {delta > 0 && (
                        <p className="text-[10px] text-primary font-bold mt-0.5">
                          +{delta}₽
                        </p>
                      )}
                      {selected && (
                        <span className="absolute top-2 right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {isLast && (
            <div className="mt-6 flex items-center justify-between p-3 rounded-xl bg-muted/50">
              <span className="font-bold text-sm">Количество комбо</span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="font-black w-6 text-center">{quantity}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="border-t p-4 flex items-center justify-between gap-3 bg-card shrink-0 native-safe-bottom">
          <div>
            <p className="text-xs text-muted-foreground">Сейчас</p>
            <p className="text-2xl font-black text-primary">
              {unitPrice * quantity}₽
            </p>
          </div>
          <div className="flex gap-2">
            {step > 0 && (
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => setStep((s) => s - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <Button
              type="button"
              className="rounded-xl font-bold min-w-[120px]"
              disabled={!currentPick}
              onClick={handleNext}
            >
              {isLast ? "В корзину" : "Далее"}
              {!isLast && <ChevronRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
