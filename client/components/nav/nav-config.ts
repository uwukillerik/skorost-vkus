import type { LucideIcon } from "lucide-react";
import {
  Home,
  UtensilsCrossed,
  ShoppingBag,
  ClipboardList,
  User,
  LogIn,
  Info,
  Phone,
} from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  auth?: boolean;
  showBadge?: boolean;
  emphasis?: boolean;
}

export const mainNavLinks: NavItem[] = [
  { to: "/", label: "Главная", icon: Home },
  { to: "/menu", label: "Меню", icon: UtensilsCrossed },
  { to: "/about", label: "О нас", icon: Info },
  { to: "/contact", label: "Контакты", icon: Phone },
];

export const bottomNavLinks: NavItem[] = [
  { to: "/", label: "Главная", icon: Home },
  { to: "/menu", label: "Меню", icon: UtensilsCrossed },
  { to: "/cart", label: "Корзина", icon: ShoppingBag, showBadge: true, emphasis: true },
  { to: "/orders", label: "Заказы", icon: ClipboardList, auth: true },
  { to: "/profile", label: "Профиль", icon: User, auth: true },
  { to: "/login", label: "Войти", icon: LogIn, auth: false },
];
