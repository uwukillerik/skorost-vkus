import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { useOrders } from "@/hooks/use-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  OrderHistoryCard,
  groupOrdersByDate,
  OrdersEmpty,
  ACTIVE_STATUSES,
} from "@/components/orders/OrderHistoryCard";
import { ClipboardList, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type FilterTab = "all" | "active" | "done";

export default function Orders() {
  const { data: orders = [], isLoading } = useOrders();
  const [tab, setTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = [...orders];
    if (tab === "active") {
      list = list.filter((o) => ACTIVE_STATUSES.includes(o.status));
    } else if (tab === "done") {
      list = list.filter(
        (o) => o.status === "DELIVERED" || o.status === "CANCELLED",
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.items.some((i) => i.productName.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [orders, tab, search]);

  const groups = useMemo(() => groupOrdersByDate(filtered), [filtered]);
  const activeCount = orders.filter((o) =>
    ACTIVE_STATUSES.includes(o.status),
  ).length;

  return (
    <Layout>
      <div className="min-h-[70vh] page-with-bottom-nav">
        <div className="hero-mesh text-white">
          <div className="page-container max-w-3xl py-6 sm:py-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-accent text-sm font-bold mb-2">
                  <ClipboardList className="h-5 w-5" />
                  История
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold">
                  Мои заказы
                </h1>
                <p className="text-white/70 text-sm mt-1">
                  {orders.length
                    ? `${orders.length} заказов${activeCount ? ` · ${activeCount} в работе` : ""}`
                    : "Здесь появятся ваши заказы"}
                </p>
              </div>
              <Button
                asChild
                size="sm"
                className="bg-accent text-accent-foreground font-bold rounded-xl shrink-0 hidden sm:flex"
              >
                <Link to="/menu">
                  <Plus className="h-4 w-4 mr-1" />
                  Новый
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="page-container max-w-3xl py-6 pb-12">
          <div className="warm-card p-3 sm:p-4 mb-5 shadow-lg">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по номеру или блюду..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-11 rounded-xl border-0 bg-muted/50"
              />
            </div>
            <Tabs
              value={tab}
              onValueChange={(v) => setTab(v as FilterTab)}
              className="w-full"
            >
              <TabsList className="w-full h-10 grid grid-cols-3 rounded-xl bg-muted/60 p-0.5">
                <TabsTrigger value="all" className="rounded-lg text-xs sm:text-sm font-bold">
                  Все
                </TabsTrigger>
                <TabsTrigger value="active" className="rounded-lg text-xs sm:text-sm font-bold">
                  Активные
                  {activeCount > 0 && (
                    <span className="ml-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0 rounded-full">
                      {activeCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="done" className="rounded-lg text-xs sm:text-sm font-bold">
                  Завершённые
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <Button
            asChild
            className="w-full sm:hidden mb-4 rounded-xl font-bold h-11"
          >
            <Link to="/menu">
              <Plus className="h-4 w-4 mr-2" />
              Сделать новый заказ
            </Link>
          </Button>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-44 rounded-2xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <OrdersEmpty filtered={tab !== "all" || !!search.trim()} />
          ) : (
            <div className="space-y-8">
              {groups.map((group) => (
                <section key={group.title}>
                  <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                    {group.title}
                  </h2>
                  <div className="space-y-3">
                    {group.orders.map((order) => (
                      <OrderHistoryCard key={order.id} order={order} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
