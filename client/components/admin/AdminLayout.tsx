import { Link, useLocation, Outlet } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  FolderOpen,
  Package,
  ClipboardList,
  Users,
  Flame,
  Menu,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const links = [
  { to: "/admin", label: "Дашборд", icon: LayoutDashboard, exact: true },
  { to: "/admin/orders", label: "Заказы", icon: ClipboardList },
  { to: "/admin/products", label: "Товары", icon: Package },
  { to: "/admin/categories", label: "Категории", icon: FolderOpen },
  { to: "/admin/users", label: "Клиенты", icon: Users },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  return (
    <>
      {links.map((link) => {
        const active = link.exact
          ? location.pathname === link.to
          : location.pathname.startsWith(link.to);
        const Icon = link.icon;
        return (
          <Link
            key={link.to}
            to={link.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "hover:bg-white/10",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {link.label}
          </Link>
        );
      })}
    </>
  );
}

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };
  const current = links.find((l) =>
    l.exact ? location.pathname === l.to : location.pathname.startsWith(l.to),
  );

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col md:flex-row">
      <aside className="hidden md:flex w-64 bg-secondary text-secondary-foreground flex-col shrink-0">
        <div className="p-6 border-b border-white/10">
          <Link to="/admin" className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-accent" />
            <span className="font-bold">Админ-панель</span>
          </Link>
          {user && (
            <p className="text-xs text-white/60 mt-2 truncate">{user.email}</p>
          )}
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavLinks />
        </nav>
        <div className="p-4 border-t border-white/10">
          <Button
            variant="ghost"
            className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Выйти
          </Button>
        </div>
      </aside>

      <header className="md:hidden sticky top-0 z-50 bg-secondary text-secondary-foreground border-b border-white/10">
        <div className="flex items-center justify-between px-4 h-14">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-72 bg-secondary text-secondary-foreground border-none p-0"
            >
              <div className="p-6 border-b border-white/10">
                <span className="font-bold flex items-center gap-2">
                  <Flame className="h-5 w-5 text-accent" />
                  Админ
                </span>
              </div>
              <nav className="p-4 space-y-1 flex flex-col">
                <NavLinks onNavigate={() => setOpen(false)} />
              </nav>
              <div className="p-4 mt-auto">
                <Button
                  variant="ghost"
                  className="w-full text-white/80"
                  onClick={() => {
                    setOpen(false);
                    handleLogout();
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Выйти
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <span className="font-semibold">{current?.label ?? "Админ"}</span>
          <Button
            variant="ghost"
            size="icon"
            className="text-white/80"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto min-h-0">
        <Outlet />
      </main>
    </div>
  );
}
