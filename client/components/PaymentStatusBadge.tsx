import { Badge } from "@/components/ui/badge";
import type { PaymentStatus } from "@shared/api";
import {
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/payment-labels";

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge className={PAYMENT_STATUS_COLORS[status]}>
      {PAYMENT_STATUS_LABELS[status]}
    </Badge>
  );
}
