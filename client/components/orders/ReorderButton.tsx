import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import type { OrderDto } from "@shared/api";
import { buildReorderFromOrder, loadReorderCatalog } from "@/lib/reorder";
import { toast } from "sonner";

export function ReorderButton({
  order,
  className,
}: {
  order: OrderDto;
  className?: string;
}) {
  const navigate = useNavigate();
  const { addItem, addCombo, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  const handleReorder = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (order.status === "CANCELLED") {
      toast.error("Отменённый заказ нельзя повторить");
      return;
    }
    setLoading(true);
    try {
      const catalog = await loadReorderCatalog();
      const { products, combos, skipped } = buildReorderFromOrder(
        order,
        catalog,
      );

      if (products.length === 0 && combos.length === 0) {
        toast.error("Позиции заказа больше недоступны в меню");
        return;
      }

      clearCart();
      for (const { product, quantity } of products) {
        addItem(product, quantity);
      }
      for (const { combo, quantity } of combos) {
        addCombo(combo, quantity);
      }

      if (skipped.length) {
        toast.warning(
          `Часть позиций недоступна: ${skipped.slice(0, 2).join(", ")}${skipped.length > 2 ? "…" : ""}`,
        );
      }
      toast.success("Заказ добавлен в корзину");
      navigate("/cart");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось повторить");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={className}
      onClick={handleReorder}
      disabled={loading || order.status === "CANCELLED"}
    >
      <RotateCcw className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
      Повторить заказ
    </Button>
  );
}
