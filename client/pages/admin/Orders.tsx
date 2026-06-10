import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import type { OrderStatus, OrderDto } from "@shared/api";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { PaymentStatusBadge } from "@/components/PaymentStatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ORDER_STATUS_LABELS } from "@/lib/order-status";
import { PAYMENT_METHOD_LABELS } from "@/lib/payment-labels";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const STATUSES = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];

function OrderCard({
  order,
  onStatusChange,
}: {
  order: OrderDto;
  onStatusChange: (id: string, status: OrderStatus) => void;
}) {
  return (
    <Card>
      <CardContent className="pt-4 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <Link
            to={`/admin/orders/${order.id}`}
            className="font-bold text-primary"
          >
            #{order.id.slice(-8)}
          </Link>
          <div className="flex flex-col gap-1 items-end">
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={order.paymentStatus} />
          </div>
        </div>
        <p className="text-sm">
          {order.user?.name || order.guestName || "Гость"}
          <span className="text-muted-foreground block text-xs">
            {order.user?.phone || order.guestPhone}
          </span>
        </p>
        <p className="text-sm text-muted-foreground">
          {format(new Date(order.createdAt), "d MMM HH:mm", { locale: ru })}
          {order.paymentMethod &&
            ` · ${PAYMENT_METHOD_LABELS[order.paymentMethod]}`}
        </p>
        <p className="font-bold text-lg text-primary">{order.totalAmount}₽</p>
        <Select
          value={order.status}
          onValueChange={(v) => onStatusChange(order.id, v as OrderStatus)}
        >
          <SelectTrigger className="h-9">
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
      </CardContent>
    </Card>
  );
}

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin", "orders", filter],
    queryFn: () =>
      api.admin.orders
        .list(filter === "all" ? undefined : filter)
        .then((r) => r.orders),
  });

  const filtered = orders.filter((o) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      o.guestName?.toLowerCase().includes(q) ||
      o.user?.name.toLowerCase().includes(q) ||
      o.guestPhone?.includes(q)
    );
  });

  const updateStatus = async (id: string, status: OrderStatus) => {
    try {
      await api.admin.orders.updateStatus(id, status);
      toast.success("Статус обновлён");
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка");
    }
  };

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Заказы</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по ID, имени, телефону..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {ORDER_STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Загрузка...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground">Заказов не найдено</p>
      ) : (
        <>
          <div className="md:hidden space-y-3">
            {filtered.map((o) => (
              <OrderCard key={o.id} order={o} onStatusChange={updateStatus} />
            ))}
          </div>
          <div className="hidden md:block bg-card rounded-xl shadow overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-semibold">ID</th>
                  <th className="text-left p-3 font-semibold">Клиент</th>
                  <th className="text-left p-3 font-semibold">Сумма</th>
                  <th className="text-left p-3 font-semibold">Оплата</th>
                  <th className="text-left p-3 font-semibold">Статус</th>
                  <th className="text-left p-3 font-semibold">Изменить</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className="border-t hover:bg-muted/30">
                    <td className="p-3">
                      <Link
                        to={`/admin/orders/${o.id}`}
                        className="text-primary font-medium hover:underline"
                      >
                        #{o.id.slice(-8)}
                      </Link>
                    </td>
                    <td className="p-3">
                      {o.user?.name || o.guestName || "—"}
                      <br />
                      <span className="text-xs text-muted-foreground">
                        {o.user?.phone || o.guestPhone}
                      </span>
                    </td>
                    <td className="p-3 font-bold">{o.totalAmount}₽</td>
                    <td className="p-3">
                      <PaymentStatusBadge status={o.paymentStatus} />
                    </td>
                    <td className="p-3">
                      <OrderStatusBadge status={o.status} />
                    </td>
                    <td className="p-3">
                      <Select
                        value={o.status}
                        onValueChange={(v) =>
                          updateStatus(o.id, v as OrderStatus)
                        }
                      >
                        <SelectTrigger className="w-36 h-8 text-xs">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
