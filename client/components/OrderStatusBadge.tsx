import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@shared/api";
import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
} from "@/lib/order-status";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge className={ORDER_STATUS_COLORS[status]}>
      {ORDER_STATUS_LABELS[status]}
    </Badge>
  );
}
