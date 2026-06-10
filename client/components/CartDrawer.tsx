import { Link } from "react-router-dom";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/CartContext";
import { CartComboDetails, CartItemDetails } from "@/components/cart/CartLineDetails";
import { unitPriceWithCustomization } from "@/lib/product-customization";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const {
    items,
    combos,
    total,
    itemCount,
    updateQuantity,
    updateComboQuantity,
    removeItem,
    removeCombo,
  } = useCart();

  const empty = items.length === 0 && combos.length === 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col bg-background">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center gap-2 text-xl font-black">
            <ShoppingBag className="h-6 w-6 text-primary" />
            Корзина
            <span className="bg-accent text-secondary text-sm font-black px-2 py-0.5 rounded-full">
              {itemCount}
            </span>
          </SheetTitle>
        </SheetHeader>

        {empty ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <ShoppingBag className="h-20 w-20 text-muted-foreground/30" />
            <p className="font-medium text-muted-foreground">Пусто как тарелка</p>
            <Button
              asChild
              className="rounded-full font-bold"
              onClick={() => onOpenChange(false)}
            >
              <Link to="/menu">Смотреть комбо</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {combos.map((c) => (
                <div
                  key={c.lineId}
                  className="flex gap-3 p-2 rounded-xl bg-primary/5 border border-primary/20"
                >
                  <img
                    src={c.combo.imageUrl}
                    alt=""
                    className="w-16 h-16 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm">🍱 {c.combo.name}</h4>
                    <CartComboDetails combo={c} />
                    <p className="text-primary font-black text-sm mt-1">
                      {c.unitPrice * c.quantity}₽
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          updateComboQuantity(c.lineId, c.quantity - 1)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-5 text-center text-sm font-bold">
                        {c.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          updateComboQuantity(c.lineId, c.quantity + 1)
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 ml-auto text-destructive"
                        onClick={() => removeCombo(c.lineId)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {items.map((item) => {
                const unit = unitPriceWithCustomization(
                  item.product,
                  item.customization,
                );
                return (
                  <div key={item.lineId} className="flex gap-3">
                    <img
                      src={item.product.imageUrl}
                      alt=""
                      className="w-16 h-16 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">
                        {item.product.name}
                      </h4>
                      <CartItemDetails item={item} />
                      <p className="text-primary font-bold text-sm">
                        {unit * item.quantity}₽
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            updateQuantity(item.lineId, item.quantity - 1)
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-5 text-center text-sm font-bold">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            updateQuantity(item.lineId, item.quantity + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 ml-auto text-destructive"
                          onClick={() => removeItem(item.lineId)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <Separator />
            <SheetFooter className="flex-col gap-2 sm:flex-col pt-4 pb-2">
              <div className="flex justify-between w-full text-xl font-black">
                <span>ИТОГО</span>
                <span className="text-primary">{total}₽</span>
              </div>
              <Button
                asChild
                className="w-full bg-accent hover:bg-accent/90 text-secondary font-black h-12 rounded-2xl"
                onClick={() => onOpenChange(false)}
              >
                <Link to="/checkout">Оформить заказ</Link>
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
