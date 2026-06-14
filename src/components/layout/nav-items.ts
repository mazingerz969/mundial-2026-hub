import {
  Calendar,
  ClipboardList,
  Gamepad2,
  Home,
  Shield,
  type LucideIcon,
} from "lucide-react";

export type MainNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const mainNavItems: MainNavItem[] = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/equipos", label: "Equipos", icon: Shield },
  { href: "/calendario", label: "Calendario", icon: Calendar },
  { href: "/quiniela", label: "Quiniela", icon: ClipboardList },
  { href: "/juegos", label: "Juegos", icon: Gamepad2 },
];

export function isNavItemActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
