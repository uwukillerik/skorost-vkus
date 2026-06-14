import { Link, useLocation, Outlet } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  FolderOpen,
  Package,
  ClipboardList,
  Users,
  Menu,
  LogOut,
  ExternalLink,
  Flame,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { BrandLogo } from "@/components/BrandLogo";

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
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
              active
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                : "text-white/75 hover:bg-white/10 hover:text-white",
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
    <div className="min-h-screen bg-[#f4f1ec] flex flex-col md:flex-row">
      <aside className="hidden md:flex w-72 bg-gradient-to-b from-[#1a1410] to-[#2d2218] text-white flex-col shrink-0 shadow-xl">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <Flame className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-extrabold text-lg leading-tight">Админ</p>
              <p className="text-[11px] text-white/50">Скорость & Вкус</p>
            </div>
          </div>
          {user && (
            <p className="text-xs text-white/60 truncate bg-white/5 rounded-lg px-3 py-2">
              {user.email}
            </p>
          )}
        </div>
        <nav className="flex-1 p-4 space-y-1.5">
          <NavLinks />
        </nav>
        <div className="p-4 border-t border-white/10 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10 rounded-xl"
            asChild
          >
            <Link to="/">
              <ExternalLink className="h-4 w-4 mr-2" />
              На сайт
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10 rounded-xl"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Выйти
          </Button>
        </div>
      </aside>

      <header className="md:hidden sticky top-0 z-50 bg-[#1a1410] text-white border-b border-white/10 shadow-lg">
        <div className="flex items-center justify-between px-4 h-14">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-72 bg-gradient-to-b from-[#1a1410] to-[#2d2218] text-white border-none p-0"
            >
              <div className="p-6 border-b border-white/10">
                <BrandLogo size="sm" showText />
              </div>
              <nav className="p-4 space-y-1.5 flex flex-col">
                <NavLinks onNavigate={() => setOpen(false)} />
              </nav>
            </SheetContent>
          </Sheet>
          <span className="font-bold">{current?.label ?? "Админ"}</span>
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

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto min-h-0">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
