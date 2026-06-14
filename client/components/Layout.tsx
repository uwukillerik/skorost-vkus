import { Link, useLocation } from "react-router-dom";
import {
  ShoppingBag,
  LogOut,
  Crown,
  Menu,
  X,
  ClipboardList,
  User,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { UserAvatarBubble } from "@/components/profile/ProfileAvatar";
import { mainNavLinks } from "@/components/nav/nav-config";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { CartDrawer } from "@/components/CartDrawer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { MobileNavSheet } from "@/components/MobileNavSheet";
import { AndroidAppDownload } from "@/components/AndroidAppDownload";
import { PwaInstallBanner } from "@/components/PwaInstallBanner";
import { LEGAL_LINKS } from "@/lib/legal-content";
import { cn } from "@/lib/utils";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const location = useLocation();
  const { itemCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <div className="min-h-dvh overflow-x-hidden bg-background bg-[radial-gradient(ellipse_at_top,hsl(32_40%_94%),transparent_55%)]">
      <header className="sticky top-0 z-50 bg-card/92 backdrop-blur-lg border-b border-border/50 shadow-sm safe-area-pt">
        <nav className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16 gap-1.5 sm:gap-2">
            <BrandLogo size="md" />

            <div className="hidden lg:flex items-center gap-1 bg-muted/50 rounded-full p-1 border border-border/50">
              {mainNavLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all",
                      active
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:text-foreground hover:bg-card",
                    )}
                  >
                    <Icon className="h-4 w-4" strokeWidth={active ? 2.5 : 2} />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-xl h-10 w-10 hover:bg-primary/10 hidden md:flex"
                onClick={() => setCartOpen(true)}
                aria-label="Корзина"
              >
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-0.5 -right-0.5 h-5 min-w-5 px-1 flex items-center justify-center bg-accent text-accent-foreground text-[10px] font-black border-2 border-card">
                    {itemCount > 9 ? "9+" : itemCount}
                  </Badge>
                )}
              </Button>

              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hidden sm:flex gap-2 pl-1.5 pr-3 rounded-xl border-border/80 h-10"
                    >
                      {user && (
                        <UserAvatarBubble user={user} className="h-7 w-7 text-xs" />
                      )}
                      <span className="font-semibold max-w-[100px] truncate">
                        {user?.name.split(" ")[0]}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 rounded-xl">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer">
                        <User className="h-4 w-4 mr-2" />
                        Профиль
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/orders" className="cursor-pointer">
                        <ClipboardList className="h-4 w-4 mr-2" />
                        Мои заказы
                      </Link>
                    </DropdownMenuItem>
                    {user?.loyaltyPoints != null && user.loyaltyPoints > 0 && (
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="text-primary font-semibold">
                          <Crown className="h-4 w-4 mr-2" />
                          {user.loyaltyPoints} баллов
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logout()}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Выйти
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  asChild
                  size="sm"
                  className="hidden sm:flex bg-primary rounded-xl font-bold h-10"
                >
                  <Link to="/login">Войти</Link>
                </Button>
              )}

              <Button
                asChild
                size="sm"
                className="hidden md:flex bg-gradient-to-r from-primary to-orange-600 hover:opacity-95 text-primary-foreground font-bold rounded-xl h-10 px-5 shadow-md"
              >
                <Link to="/menu">Заказать</Link>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden rounded-xl"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Меню"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>

        </nav>
      </header>

      <MobileNavSheet
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
        activePath={location.pathname}
      />

      <main className="page-with-bottom-nav min-w-0 w-full">{children}</main>

      <footer className="bg-secondary text-secondary-foreground mt-16 border-t border-white/5 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
            <div>
              <BrandLogo size="sm" className="mb-4" showText />
              <p className="text-sm opacity-80">
                Быстрая доставка вкусной еды по городу
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Меню</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li>
                  <Link to="/menu" className="hover:text-accent">
                    Полное меню
                  </Link>
                </li>
                <li>
                  <Link to="/menu" className="hover:text-accent">
                    Комбо
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Компания</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li>
                  <Link to="/about" className="hover:text-accent">
                    О нас
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-accent">
                    Контакты
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Документы</h4>
              <ul className="space-y-2 text-sm opacity-80">
                {LEGAL_LINKS.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="hover:text-accent">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <AndroidAppDownload variant="footer" />
          </div>
          <div className="border-t border-white/20 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm opacity-60">
            <p>&copy; 2026 Скорость & Вкус</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center">
              {LEGAL_LINKS.map((link) => (
                <Link key={link.to} to={link.to} className="hover:text-accent hover:opacity-100">
                  {link.label.replace("Политика конфиденциальности", "Конфиденциальность").replace("Согласие на обработку данных", "Согласие на данные")}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
      <MobileBottomNav />
      <PwaInstallBanner />
    </div>
  );
}
