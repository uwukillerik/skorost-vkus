import { Link } from "react-router-dom";
import type { ProductDto } from "@shared/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface UpsellDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addedName: string;
  drinks: ProductDto[];
  sides: ProductDto[];
  related: ProductDto[];
}

export function UpsellDialog({
  open,
  onOpenChange,
  addedName,
  drinks,
  sides,
  related,
}: UpsellDialogProps) {
  const { addItem } = useCart();

  const suggestions = [
    ...sides.slice(0, 2),
    ...drinks.slice(0, 2),
    ...related.slice(0, 2),
  ].filter(
    (p, i, arr) => arr.findIndex((x) => x.id === p.id) === i,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl sm:rounded-3xl p-0 overflow-hidden gap-0">
        <div className="bg-gradient-to-br from-primary/15 via-accent/20 to-orange-500/10 px-5 pt-6 pb-4">
          <DialogHeader className="text-left space-y-1">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="h-5 w-5" />
              <span className="text-xs font-black uppercase tracking-wide">
                Отличный выбор!
              </span>
            </div>
            <DialogTitle className="text-xl font-extrabold">
              {addedName} в корзине
            </DialogTitle>
            <DialogDescription className="text-sm">
              Добавить к заказу? Так делают все — и вы не пожалеете
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-5 py-4 max-h-[50vh] overflow-y-auto space-y-3">
          {suggestions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Загляните в полное меню — там ещё много вкусного
            </p>
          ) : (
            suggestions.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 p-2 rounded-xl border bg-card hover:border-primary/30 transition-colors"
              >
                <img
                  src={p.imageUrl}
                  alt=""
                  className="h-14 w-14 rounded-lg object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{p.name}</p>
                  <p className="text-primary font-black">{p.price}₽</p>
                </div>
                <Button
                  size="sm"
                  className="rounded-xl font-bold shrink-0"
                  onClick={() => {
                    addItem(p, 1);
                    onOpenChange(false);
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2 px-5 pb-5 pt-0">
          <Button
            asChild
            variant="outline"
            className="w-full rounded-xl font-semibold"
            onClick={() => onOpenChange(false)}
          >
            <Link to="/cart">Перейти в корзину</Link>
          </Button>
          <Button
            className="w-full rounded-xl font-bold"
            onClick={() => onOpenChange(false)}
          >
            Продолжить выбор
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
