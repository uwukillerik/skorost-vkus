import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { OrderStatus } from "@shared/api";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { PaymentStatusBadge } from "@/components/PaymentStatusBadge";
import { KitchenAssembly } from "@/components/order/KitchenAssembly";
import { OrderReceipt } from "@/components/order/OrderReceipt";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ORDER_STATUS_LABELS } from "@/lib/order-status";
import { PAYMENT_METHOD_LABELS } from "@/lib/payment-labels";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { toast } from "sonner";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  User,
  MessageSquare,
  Truck,
} from "lucide-react";

const STATUSES = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];

function telHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `tel:+${digits.startsWith("7") ? digits : `7${digits}`}`;
}

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: order, isLoading, refetch } = useQuery({
    queryKey: ["admin", "order", id],
    queryFn: () => api.admin.orders.get(id!).then((r) => r.order),
    enabled: !!id,
    refetchInterval: 10000,
  });

  const updateStatus = async (status: OrderStatus) => {
    if (!id) return;
    try {
      await api.admin.orders.updateStatus(id, status);
      toast.success("Статус обновлён");
      await refetch();
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-4xl">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div>
        <p className="text-muted-foreground">Заказ не найден</p>
        <Button asChild variant="link" className="mt-4 px-0">
          <Link to="/admin/orders">← К заказам</Link>
        </Button>
      </div>
    );
  }

  const customerName = order.user?.name || order.guestName || "Гость";
  const customerPhone = order.user?.phone || order.guestPhone;
  const customerEmail = order.user?.email || order.guestEmail;
  const isGuest = !order.user;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
            <Link to="/admin/orders">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Заказы
            </Link>
          </Button>
          <h1 className="text-2xl sm:text-3xl font-black">
            Заказ #{order.id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-sm text-muted-foreground">
            {format(new Date(order.createdAt), "d MMMM yyyy, HH:mm", {
              locale: ru,
            })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-card border shadow-md p-5 space-y-4">
          <h2 className="font-black text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Клиент
            {isGuest && (
              <span className="text-xs font-bold bg-muted px-2 py-0.5 rounded-full">
                Гость
              </span>
            )}
          </h2>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Имя</p>
              <p className="font-bold text-base">{customerName}</p>
            </div>
            {customerPhone && (
              <div>
                <p className="text-muted-foreground text-xs">Телефон</p>
                <a
                  href={telHref(customerPhone)}
                  className="font-bold text-lg text-primary flex items-center gap-2 hover:underline"
                >
                  <Phone className="h-5 w-5" />
                  {customerPhone}
                </a>
                <Button asChild className="w-full mt-2 font-bold" size="lg">
                  <a href={telHref(customerPhone)}>Позвонить клиенту</a>
                </Button>
              </div>
            )}
            {customerEmail && (
              <div>
                <p className="text-muted-foreground text-xs">Email</p>
                <a
                  href={`mailto:${customerEmail}`}
                  className="font-medium flex items-center gap-2 text-primary hover:underline"
                >
                  <Mail className="h-4 w-4" />
                  {customerEmail}
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-card border shadow-md p-5 space-y-4">
          <h2 className="font-black text-lg flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            Доставка и оплата
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex gap-2">
              <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-muted-foreground text-xs">Адрес</p>
                <p className="font-medium">{order.address}</p>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Тип</p>
              <p className="font-bold">
                {order.deliveryType === "PICKUP" ? "Самовывоз" : "Доставка"}
              </p>
            </div>
            {order.paymentMethod && (
              <div>
                <p className="text-muted-foreground text-xs">Оплата</p>
                <p className="font-bold">
                  {PAYMENT_METHOD_LABELS[order.paymentMethod]}
                </p>
              </div>
            )}
            {order.comment && (
              <div className="flex gap-2 bg-muted/50 rounded-lg p-3">
                <MessageSquare className="h-4 w-4 shrink-0" />
                <p className="text-sm">{order.comment}</p>
              </div>
            )}
            <div className="pt-2 border-t">
              <p className="text-3xl font-black text-primary">
                {order.totalAmount}₽
              </p>
              <p className="text-xs text-muted-foreground">
                Товары {order.subtotal}₽ · доставка {order.deliveryFee}₽
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-secondary text-white p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <p className="text-xs text-white/70 uppercase font-bold tracking-wider">
            Статус заказа
          </p>
          <p className="font-black text-xl mt-1">
            {ORDER_STATUS_LABELS[order.status]}
          </p>
        </div>
        <Select value={order.status} onValueChange={(v) => updateStatus(v as OrderStatus)}>
          <SelectTrigger className="w-full sm:w-56 bg-white text-foreground font-bold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {ORDER_STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {(order.status === "PREPARING" || order.status === "CONFIRMED") && (
        <KitchenAssembly items={order.items} />
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h3 className="font-bold mb-3">Позиции</h3>
          <ul className="space-y-2">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex justify-between bg-card border rounded-xl px-4 py-3"
              >
                <span className="font-medium">
                  {item.productName} × {item.quantity}
                </span>
                <span className="font-bold text-primary">{item.subtotal}₽</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-3">Чек</h3>
          <OrderReceipt order={order} />
        </div>
      </div>
    </div>
  );
}
