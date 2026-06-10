import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { CartComboDetails, CartItemDetails } from "@/components/cart/CartLineDetails";
import { unitPriceWithCustomization } from "@/lib/product-customization";

export default function CartPage() {
  const {
    items,
    combos,
    total,
    updateQuantity,
    updateComboQuantity,
    removeItem,
    removeCombo,
  } = useCart();

  const empty = items.length === 0 && combos.length === 0;

  return (
    <Layout>
      <div className="page-container max-w-3xl py-6 sm:py-12 page-with-bottom-nav">
        <h1 className="text-2xl sm:text-4xl font-black mb-6 sm:mb-8">Корзина</h1>

        {empty ? (
          <div className="text-center py-16 rounded-2xl bg-muted/50">
            <ShoppingBag className="h-20 w-20 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground mb-6 font-medium">
              Добавьте комбо или блюда из меню
            </p>
            <Button asChild className="rounded-full font-bold">
              <Link to="/menu">Перейти в меню</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-8">
              {combos.map((c) => (
                <div
                  key={c.lineId}
                  className="flex flex-col sm:flex-row gap-3 sm:gap-4 bg-primary/5 border-2 border-primary/20 rounded-2xl p-3 sm:p-4"
                >
                  <img
                    src={c.combo.imageUrl}
                    alt=""
                    className="w-16 h-16 sm:w-24 sm:h-24 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-black text-base sm:text-lg min-w-0">
                        🍱 {c.combo.name}
                      </h3>
                      <span className="font-bold text-base sm:hidden shrink-0 text-primary">
                        {c.unitPrice * c.quantity}₽
                      </span>
                    </div>
                    <CartComboDetails combo={c} />
                    <p className="text-primary font-black text-lg sm:text-xl mt-1 sm:mt-2">
                      {c.unitPrice}₽
                      <span className="text-xs font-normal text-muted-foreground ml-1">
                        / комбо
                      </span>
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateComboQuantity(c.lineId, c.quantity - 1)
                        }
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="font-bold w-6 text-center">
                        {c.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateComboQuantity(c.lineId, c.quantity + 1)
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto text-destructive"
                        onClick={() => removeCombo(c.lineId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="font-bold text-lg self-center hidden sm:block">
                    {c.unitPrice * c.quantity}₽
                  </div>
                </div>
              ))}
              {items.map((item) => {
                const unit = unitPriceWithCustomization(
                  item.product,
                  item.customization,
                );
                return (
                  <div
                    key={item.lineId}
                    className="flex gap-3 sm:gap-4 bg-card rounded-2xl p-3 sm:p-4 shadow-md border"
                  >
                    <img
                      src={item.product.imageUrl}
                      alt=""
                      className="w-16 h-16 sm:w-24 sm:h-24 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-base sm:text-lg min-w-0">
                          {item.product.name}
                        </h3>
                        <span className="font-bold text-base sm:hidden shrink-0 text-primary">
                          {unit * item.quantity}₽
                        </span>
                      </div>
                      <CartItemDetails item={item} />
                      <p className="text-primary font-black text-xl mt-1">
                        {unit}₽
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(item.lineId, item.quantity - 1)
                          }
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-bold w-6 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(item.lineId, item.quantity + 1)
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-auto text-destructive"
                          onClick={() => removeItem(item.lineId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="font-bold text-lg self-center hidden sm:block">
                      {unit * item.quantity}₽
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="bg-secondary text-white rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 shadow-xl sticky bottom-[calc(var(--bottom-nav-h)+env(safe-area-inset-bottom)+0.75rem)] md:static md:bottom-auto z-20">
              <div className="text-center sm:text-left">
                <p className="text-white/70 text-sm">К оплате</p>
                <p className="text-2xl sm:text-3xl font-black text-accent">{total}₽</p>
              </div>
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto bg-accent text-secondary font-black h-11 sm:h-12 px-8 sm:px-10 rounded-full"
              >
                <Link to="/checkout">Оформить заказ</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
