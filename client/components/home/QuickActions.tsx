import { Link } from "react-router-dom";
import { UtensilsCrossed, Gift, ClipboardList, Crown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const actions = [
  {
    to: "/menu",
    label: "Меню",
    sub: "40+ блюд",
    icon: UtensilsCrossed,
    color: "from-primary/20 to-orange-500/10",
  },
  {
    to: "/menu",
    label: "Комбо",
    sub: "Выгодно",
    icon: Gift,
    color: "from-amber-500/20 to-yellow-500/10",
  },
  {
    to: "/orders",
    label: "Заказы",
    sub: "Статус",
    icon: ClipboardList,
    color: "from-sky-500/15 to-blue-500/10",
    auth: true,
  },
  {
    to: "/profile",
    label: "Бонусы",
    sub: "Баллы",
    icon: Crown,
    color: "from-violet-500/15 to-purple-500/10",
    auth: true,
  },
];

export function QuickActions() {
  const { isAuthenticated } = useAuth();

  const visible = actions.filter((a) => !a.auth || isAuthenticated);

  return (
    <div className="page-container py-4 sm:py-8">
      <div
        className={cn(
          "grid gap-2 sm:gap-3",
          visible.length >= 4
            ? "grid-cols-4"
            : visible.length === 3
              ? "grid-cols-3"
              : "grid-cols-2",
        )}
      >
        {visible.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              to={action.to}
              className={cn(
                "warm-card flex flex-col items-center text-center gap-1.5 p-2.5 sm:flex-row sm:text-left sm:items-center sm:gap-3 sm:p-4 hover:shadow-md hover:border-primary/20 transition-all min-w-0",
                `bg-gradient-to-br ${action.color}`,
              )}
            >
              <span className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl bg-card shadow-sm flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </span>
              <div className="min-w-0 w-full">
                <p className="font-bold text-[11px] sm:text-base leading-tight truncate">
                  {action.label}
                </p>
                <p className="text-[10px] text-muted-foreground hidden sm:block">
                  {action.sub}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
      {!isAuthenticated && (
        <Link
          to="/login"
          className="warm-card mt-2 flex items-center justify-center gap-2 p-3 sm:p-4 bg-primary/5 border-primary/20 hover:bg-primary/10 font-bold text-primary text-sm rounded-xl"
        >
          Войти для бонусов
        </Link>
      )}
    </div>
  );
}
