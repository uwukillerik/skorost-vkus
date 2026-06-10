import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReorderButton } from "@/components/orders/ReorderButton";
import type { OrderDto } from "@shared/api";

export function OrderDetailActions({ order }: { order: OrderDto }) {
  return (
    <div className="warm-card p-4 sm:p-5">
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
        Действия
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
        <ReorderButton
          order={order}
          className="w-full rounded-xl h-11 font-semibold justify-center"
        />
        <Button
          asChild
          variant="outline"
          className="w-full rounded-xl h-11 font-semibold"
        >
          <Link to="/orders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Все заказы
          </Link>
        </Button>
        <Button asChild className="w-full rounded-xl h-11 font-bold">
          <Link to="/menu">Заказать ещё</Link>
        </Button>
      </div>
    </div>
  );
}
