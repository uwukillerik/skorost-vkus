import { useState } from "react";
import { Bell, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  isPushSupported,
  subscribeToOrderPush,
} from "@/lib/push-notifications";
import { toast } from "sonner";
import type { OrderStatus } from "@shared/api";

interface PushNotifyBannerProps {
  orderId: string;
  orderToken?: string | null;
  status: OrderStatus;
}

export function PushNotifyBanner({
  orderId,
  orderToken,
  status,
}: PushNotifyBannerProps) {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  if (
    !isPushSupported() ||
    status === "DELIVERED" ||
    status === "CANCELLED"
  ) {
    return null;
  }

  const handleEnable = async () => {
    setLoading(true);
    try {
      const ok = await subscribeToOrderPush({
        orderId,
        orderToken: orderToken ?? undefined,
      });
      if (ok) {
        setEnabled(true);
        toast.success("Уведомления включены");
      } else {
        toast.error("Не удалось подписаться на уведомления");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Ошибка подписки",
      );
    } finally {
      setLoading(false);
    }
  };

  if (enabled) {
    return (
      <div className="warm-card p-4 flex items-center gap-3 border-emerald-200 bg-emerald-50/80">
        <BellRing className="h-5 w-5 text-emerald-600 shrink-0" />
        <p className="text-sm text-emerald-900 font-medium">
          Push-уведомления включены — сообщим о каждом этапе заказа
        </p>
      </div>
    );
  }

  return (
    <div className="warm-card p-4 flex flex-col sm:flex-row gap-3 sm:items-center justify-between border-primary/20">
      <div className="flex gap-3">
        <Bell className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-sm">Уведомления о статусе</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Подтверждение, готовка и готовность к выдаче — в push на устройство
          </p>
        </div>
      </div>
      <Button
        type="button"
        className="rounded-xl font-bold shrink-0"
        onClick={handleEnable}
        disabled={loading}
      >
        Включить
      </Button>
    </div>
  );
}
