import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { UserAvatarBubble } from "@/components/profile/ProfileAvatar";
import { bottomNavLinks } from "@/components/nav/nav-config";

export function MobileBottomNav() {
  const location = useLocation();
  const { itemCount } = useCart();
  const { isAuthenticated, user } = useAuth();

  const hideOn =
    location.pathname.startsWith("/admin") ||
    location.pathname === "/checkout" ||
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/register") ||
    location.pathname.startsWith("/legal");

  if (hideOn) return null;

  const visibleLinks = bottomNavLinks.filter((l) => {
    if (l.auth === true) return isAuthenticated;
    if (l.auth === false) return !isAuthenticated;
    return true;
  });

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border/70 bg-card/98 backdrop-blur-lg safe-area-pb"
      aria-label="Основная навигация"
    >
      <div className="flex items-stretch justify-around h-14 max-w-lg mx-auto px-1 pt-1">
        {visibleLinks.map((link) => {
          const active =
            link.to === "/"
              ? location.pathname === "/"
              : link.to === "/orders"
                ? location.pathname.startsWith("/orders") ||
                  location.pathname.startsWith("/order/")
                : link.to === "/login"
                  ? location.pathname.startsWith("/login") ||
                    location.pathname.startsWith("/register")
                  : location.pathname.startsWith(link.to);
          const Icon = link.icon;
          const isCart = link.emphasis;

          return (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 min-w-0 py-0.5 gap-0 rounded-lg transition-colors",
                active && "text-primary",
                !active && "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "flex items-center justify-center rounded-xl transition-all",
                  isCart ? "h-9 w-9 -mt-1" : "h-8 w-8",
                  active && isCart && "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20",
                  active && !isCart && "bg-primary/10",
                  !active && isCart && "bg-muted",
                )}
              >
                {link.to === "/profile" && user ? (
                  <UserAvatarBubble
                    user={user}
                    className={cn(
                      isCart ? "h-7 w-7" : "h-7 w-7",
                      active && "ring-2 ring-primary ring-offset-1 ring-offset-card",
                    )}
                  />
                ) : (
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                )}
              </span>
              <span className="text-[10px] font-semibold leading-none">
                {link.label}
              </span>
              {link.showBadge && itemCount > 0 && (
                <span className="absolute top-0 right-[22%] min-w-[16px] h-4 bg-accent text-accent-foreground text-[9px] font-black rounded-full flex items-center justify-center px-1">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
