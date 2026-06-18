import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { useOrder } from "@/hooks/use-menu";
import { OrderStatusTracker } from "@/components/order/OrderStatusTracker";
import { OrderItemsList } from "@/components/order/OrderItemsList";
import { OrderReceiptPanel } from "@/components/order/OrderReceiptPanel";
import { OrderDetailActions } from "@/components/order/OrderDetailActions";
import { KitchenAssembly } from "@/components/order/KitchenAssembly";
import { DeliveryMap } from "@/components/order/DeliveryMap";
import { PremiumPayment } from "@/components/checkout/PremiumPayment";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/payment-labels";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  ArrowLeft,
  RefreshCw,
  Phone,
  CreditCard,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PushNotifyBanner } from "@/components/order/PushNotifyBanner";
import { Clock } from "lucide-react";
import { validateCardForm } from "@shared/payment-card";

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const token = id ? sessionStorage.getItem(`order-token-${id}`) : null;
  const queryClient = useQueryClient();
  const [payLoading, setPayLoading] = useState(false);
  const [showPay, setShowPay] = useState(false);
  const [card, setCard] = useState({
    number: "",
    expiry: "",
    cvv: "",
    holder: "",
  });

  const { data: order, isLoading, error, refetch, isFetching } = useOrder(
    id || "",
    { token: token || undefined },
  );
  useEffect(() => {
    if (!order) return;
    const key = `order-status-${order.id}`;
    const stored = sessionStorage.getItem(key);
    if (stored && stored !== order.status) {
      const labels: Record<string, string> = {
        CONFIRMED: "Заказ подтверждён",
        PREPARING: "Начали готовить",
        READY:
          order.deliveryType === "PICKUP"
            ? "Готов к выдаче"
            : "Заказ собран",
        DELIVERED:
          order.deliveryType === "PICKUP"
            ? "Заказ выдан"
            : "Заказ доставлен",
      };
      const msg = labels[order.status];
      if (msg) toast.success(msg);
    }
    sessionStorage.setItem(key, order.status);
  }, [order?.status, order?.deliveryType, order?.id]);

  const handlePay = async () => {
    if (!order?.paymentMethod) return;
    if (order.paymentMethod === "CARD") {
      const cardError = validateCardForm(card);
      if (cardError) {
        toast.error(cardError);
        return;
      }
    }
    setPayLoading(true);
    try {
      const res = await api.payments.pay(
        order.id,
        order.paymentMethod === "CARD"
          ? {
              cardNumber: card.number,
              expiry: card.expiry,
              cvv: card.cvv,
              cardHolder: card.holder,
            }
          : {},
        token || undefined,
      );
      toast.success(res.message);
      setShowPay(false);
      await refetch();
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка оплаты");
    } finally {
      setPayLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto px-4 py-8 page-with-bottom-nav space-y-4">
          <Skeleton className="h-12 w-48" />
          <div className="grid lg:grid-cols-2 gap-6">
            <Skeleton className="h-80 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout>
        <div className="max-w-lg mx-auto px-4 py-16 text-center page-with-bottom-nav">
          <p className="text-muted-foreground mb-4">Заказ не найден</p>
          <Button asChild>
            <Link to="/orders">К списку заказов</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const needsPay =
    order.paymentStatus === "PENDING" &&
    order.paymentMethod &&
    order.paymentMethod !== "CASH";

  const showKitchen =
    order.status === "PREPARING" || order.status === "CONFIRMED";

  return (
    <Layout>
      <div className="bg-muted/20 min-h-dvh page-with-bottom-nav md:pb-8">
        <div className="bg-card border-b border-border/60 md:sticky md:top-16 z-30 shadow-sm">
          <div className="page-container py-3 flex items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Button variant="ghost" size="icon" className="shrink-0 rounded-xl" asChild>
                <Link to="/orders">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  {format(new Date(order.createdAt), "d MMMM yyyy, HH:mm", {
                    locale: ru,
                  })}
                </p>
                <h1 className="font-extrabold text-lg sm:text-xl truncate">
                  Заказ #{order.id.slice(-8).toUpperCase()}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={cn(
                  "text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full max-w-[100px] sm:max-w-none truncate",
                  PAYMENT_STATUS_COLORS[order.paymentStatus],
                )}
              >
                {PAYMENT_STATUS_LABELS[order.paymentStatus]}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <RefreshCw
                  className={cn("h-4 w-4", isFetching && "animate-spin")}
                />
              </Button>
            </div>
          </div>
        </div>

        <div className="page-container page-section space-y-4 sm:space-y-6">
          {needsPay && !showPay && (
            <div className="warm-card p-4 sm:p-5 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center border-amber-200 bg-amber-50/80">
              <div>
                <p className="font-bold text-amber-900">Требуется оплата</p>
                <p className="text-sm text-amber-800/80">
                  Сумма к оплате: {order.totalAmount}₽
                </p>
              </div>
              <Button
                className="font-bold rounded-xl shrink-0 w-full sm:w-auto"
                onClick={() => setShowPay(true)}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Оплатить
              </Button>
            </div>
          )}

          {showPay && needsPay && order.paymentMethod && (
            <div className="warm-card p-4 sm:p-6">
              <h2 className="font-bold text-lg mb-4">Оплата заказа</h2>
              <PremiumPayment
                method={order.paymentMethod}
                onMethodChange={() => {}}
                lockMethod
                card={card}
                onCardChange={setCard}
                onPay={handlePay}
                loading={payLoading}
                total={order.totalAmount}
              />
              <Button
                variant="ghost"
                className="w-full mt-3"
                onClick={() => setShowPay(false)}
              >
                Отмена
              </Button>
            </div>
          )}

          <div className="space-y-6">
            <OrderStatusTracker
              status={order.status}
              deliveryType={order.deliveryType}
            />

            <PushNotifyBanner
              orderId={order.id}
              orderToken={token}
              status={order.status}
            />

            {showKitchen && <KitchenAssembly items={order.items} />}

            <div className="flex flex-col md:grid md:grid-cols-[1fr_minmax(280px,360px)] gap-4 md:gap-6 md:items-start">
              <div className="space-y-6 min-w-0">
                <div className="warm-card p-4 sm:p-5 space-y-3">
                  <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wide">
                    Детали заказа
                  </h3>
                  <div className="flex gap-3 text-sm">
                    <Truck className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="font-semibold">
                        {order.deliveryType === "PICKUP"
                          ? "Самовывоз"
                          : "Доставка"}
                      </p>
                      <p className="text-muted-foreground mt-0.5">
                        {order.address}
                      </p>
                      {order.pickupAt && (
                        <p className="text-sm font-semibold text-primary mt-2 flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          {format(new Date(order.pickupAt), "d MMMM, HH:mm", {
                            locale: ru,
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                  {(order.guestPhone || order.user?.phone) && (
                    <div className="flex gap-3 text-sm">
                      <Phone className="h-5 w-5 text-primary shrink-0" />
                      <p>{order.user?.phone || order.guestPhone}</p>
                    </div>
                  )}
                  {order.paymentMethod && (
                    <div className="flex gap-3 text-sm">
                      <CreditCard className="h-5 w-5 text-primary shrink-0" />
                      <p>{PAYMENT_METHOD_LABELS[order.paymentMethod]}</p>
                    </div>
                  )}
                  {order.paymentId && (
                    <p className="text-xs text-muted-foreground pt-1 border-t border-border/50">
                      Транзакция:{" "}
                      <code className="font-mono">{order.paymentId}</code>
                    </p>
                  )}
                  <span
                    className={cn(
                      "inline-flex lg:hidden text-xs font-bold px-2.5 py-1 rounded-full",
                      PAYMENT_STATUS_COLORS[order.paymentStatus],
                    )}
                  >
                    {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                  </span>
                </div>

                <OrderItemsList order={order} />

                {order.deliveryType === "DELIVERY" && (
                  <DeliveryMap
                    status={order.status}
                    address={order.address}
                    deliveryType={order.deliveryType}
                  />
                )}

                <div className="lg:hidden">
                  <OrderDetailActions order={order} />
                </div>
              </div>

              <OrderReceiptPanel order={order} />
            </div>

            <div className="hidden lg:block">
              <OrderDetailActions order={order} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
