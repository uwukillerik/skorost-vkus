import { useAdminStats } from "@/hooks/use-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { PaymentStatusBadge } from "@/components/PaymentStatusBadge";
import { Link } from "react-router-dom";
import { ORDER_STATUS_LABELS } from "@/lib/order-status";
import type { OrderStatus } from "@shared/api";
import {
  ShoppingBag,
  Wallet,
  Clock,
  CheckCircle,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const maxStatus = Math.max(...Object.values(stats.ordersByStatus), 1);

  return (
    <div>
      <AdminPageHeader
        title="Дашборд"
        description="Сводка по заказам и выручке"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6 sm:mb-8">
        <Card className="rounded-2xl border-0 shadow-md bg-gradient-to-br from-primary/10 to-card">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <ShoppingBag className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Заказов</span>
            </div>
            <p className="text-2xl sm:text-4xl font-extrabold text-primary">
              {stats.totalOrders}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 shadow-md">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Wallet className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Выручка</span>
            </div>
            <p className="text-xl sm:text-3xl font-extrabold text-primary">
              {stats.totalRevenue.toLocaleString("ru-RU")}₽
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 shadow-md">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <CheckCircle className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Оплачено</span>
            </div>
            <p className="text-2xl sm:text-4xl font-extrabold text-green-600">
              {stats.paidOrders}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 shadow-md">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Ждут оплаты</span>
            </div>
            <p className="text-2xl sm:text-4xl font-extrabold text-amber-600">
              {stats.pendingPayments}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6 sm:mb-8">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Заказы по статусам</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(Object.keys(stats.ordersByStatus) as OrderStatus[]).map((s) => {
            const count = stats.ordersByStatus[s];
            const pct = (count / maxStatus) * 100;
            return (
              <div key={s}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{ORDER_STATUS_LABELS[s]}</span>
                  <span className="font-bold">{count}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base sm:text-lg">Последние заказы</CardTitle>
          <Link
            to="/admin/orders"
            className="text-sm text-primary font-medium whitespace-nowrap"
          >
            Все →
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.recentOrders.map((o) => (
              <Link
                key={o.id}
                to={`/order/${o.id}`}
                className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <div>
                  <span className="font-medium">#{o.id.slice(-8)}</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    {o.totalAmount}₽
                  </span>
                </div>
                <div className="flex gap-2">
                  <PaymentStatusBadge status={o.paymentStatus} />
                  <OrderStatusBadge status={o.status} />
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
