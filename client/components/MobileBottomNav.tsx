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
    <div
      className="md:hidden fixed inset-x-0 bottom-0 z-40 pointer-events-none px-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]"
      aria-hidden={false}
    >
      <nav
        className="liquid-glass-nav pointer-events-auto mx-auto max-w-md rounded-[1.75rem] px-2 py-1.5"
        aria-label="Основная навигация"
      >
        <div className="flex items-center justify-around gap-0.5">
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
                  "relative flex flex-col items-center justify-center flex-1 min-w-0 py-1 gap-0.5 rounded-2xl transition-all duration-300",
                  active && !isCart && "text-primary",
                  !active && !isCart && "text-muted-foreground",
                  isCart && "text-primary-foreground",
                )}
              >
                {active && !isCart && (
                  <span
                    className="absolute inset-x-1 inset-y-0.5 rounded-2xl bg-primary/12 border border-primary/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
                    aria-hidden
                  />
                )}

                <span
                  className={cn(
                    "relative z-[1] flex items-center justify-center transition-all duration-300",
                    isCart
                      ? cn(
                          "h-11 w-11 -mt-2 rounded-2xl shadow-lg",
                          active
                            ? "bg-gradient-to-br from-primary to-orange-600 shadow-primary/35 ring-2 ring-white/30"
                            : "bg-gradient-to-br from-primary/90 to-orange-600/90 shadow-primary/25",
                        )
                      : "h-8 w-8 rounded-xl",
                  )}
                >
                  {link.to === "/profile" && user ? (
                    <UserAvatarBubble
                      user={user}
                      className={cn(
                        "h-7 w-7",
                        active && "ring-2 ring-primary/40 ring-offset-2 ring-offset-transparent",
                      )}
                    />
                  ) : (
                    <Icon
                      className={cn(isCart ? "h-5 w-5" : "h-[1.125rem] w-[1.125rem]")}
                      strokeWidth={active ? 2.5 : 2}
                    />
                  )}
                </span>

                <span
                  className={cn(
                    "relative z-[1] text-[10px] font-bold leading-none tracking-tight",
                    isCart && "-mt-0.5",
                    active && !isCart && "text-primary",
                  )}
                >
                  {link.label}
                </span>

                {link.showBadge && itemCount > 0 && (
                  <span
                    className={cn(
                      "absolute z-[2] min-w-[18px] h-[18px] bg-accent text-accent-foreground text-[9px] font-black rounded-full flex items-center justify-center px-1 shadow-md border-2 border-white/80",
                      isCart ? "top-0 right-[18%]" : "top-0 right-[20%]",
                    )}
                  >
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
