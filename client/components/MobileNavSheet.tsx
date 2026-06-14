import { Link } from "react-router-dom";
import {
  ClipboardList,
  Download,
  LogOut,
  Phone,
  Smartphone,
  User,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { mainNavLinks } from "@/components/nav/nav-config";
import { LEGAL_LINKS } from "@/lib/legal-content";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";

const APK_URL = "/downloads/skorost-vkus.apk";

interface MobileNavSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activePath: string;
}

export function MobileNavSheet({ open, onOpenChange, activePath }: MobileNavSheetProps) {
  const { isAuthenticated, user, logout } = useAuth();
  const { itemCount } = useCart();

  const isActive = (path: string) =>
    path === "/" ? activePath === "/" : activePath.startsWith(path);

  const close = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl px-4 pb-6 safe-area-pb max-h-[85dvh]"
      >
        <SheetHeader className="text-left pb-2">
          <SheetTitle>Навигация</SheetTitle>
        </SheetHeader>

        <nav className="grid grid-cols-2 gap-2 py-2" aria-label="Разделы сайта">
          {mainNavLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={close}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-3 font-semibold text-sm border transition-colors",
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/40 border-border/60 hover:bg-muted",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-1 pt-2 border-t border-border/60">
          {isAuthenticated ? (
            <>
              <Link
                to="/orders"
                onClick={close}
                className="flex items-center gap-3 py-2.5 px-3 rounded-xl font-semibold text-sm hover:bg-muted"
              >
                <ClipboardList className="h-5 w-5" />
                Мои заказы
              </Link>
              <Link
                to="/profile"
                onClick={close}
                className="flex items-center gap-3 py-2.5 px-3 rounded-xl font-semibold text-sm hover:bg-muted"
              >
                <User className="h-5 w-5" />
                Профиль
              </Link>
              <button
                type="button"
                onClick={() => {
                  close();
                  logout();
                }}
                className="flex w-full items-center gap-3 py-2.5 px-3 rounded-xl font-semibold text-sm hover:bg-muted text-left"
              >
                <LogOut className="h-5 w-5" />
                Выйти ({user?.name.split(" ")[0]})
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={close}
              className="flex items-center gap-3 py-2.5 px-3 rounded-xl font-semibold text-sm bg-primary/10 text-primary"
            >
              <User className="h-5 w-5" />
              Войти в аккаунт
            </Link>
          )}

          <Link
            to="/contact"
            onClick={close}
            className="flex items-center gap-3 py-2.5 px-3 rounded-xl font-semibold text-sm hover:bg-muted"
          >
            <Phone className="h-5 w-5" />
            Контакты
          </Link>

          <Link
            to="/cart"
            onClick={close}
            className="flex items-center gap-3 py-2.5 px-3 rounded-xl font-semibold text-sm hover:bg-muted"
          >
            Корзина {itemCount > 0 ? `(${itemCount})` : ""}
          </Link>

          <a
            href={APK_URL}
            download="skorost-vkus.apk"
            onClick={close}
            className="flex items-center gap-3 py-2.5 px-3 rounded-xl font-semibold text-sm bg-[#3DDC84]/15 text-[#1a6b3a] border border-[#3DDC84]/30"
          >
            <Smartphone className="h-5 w-5" />
            Скачать APK
            <Download className="h-4 w-4 ml-auto opacity-70" />
          </a>
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-1 pt-3 text-xs text-muted-foreground">
          {LEGAL_LINKS.map((link) => (
            <Link key={link.to} to={link.to} onClick={close} className="hover:text-primary">
              {link.label.replace("Политика конфиденциальности", "Конфиденциальность")}
            </Link>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
