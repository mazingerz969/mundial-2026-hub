"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, ClipboardList, Gamepad2, Home, Shield } from "lucide-react";

const navItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/equipos", label: "Equipos", icon: Shield },
  { href: "/calendario", label: "Calend.", icon: Calendar },
  { href: "/quiniela", label: "Quiniela", icon: ClipboardList },
  { href: "/juegos", label: "Juegos", icon: Gamepad2 },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-bg-secondary md:hidden">
      <div className="mx-auto flex max-w-5xl justify-around px-2 py-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`flex min-w-[64px] flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs transition-colors ${
                active
                  ? "text-accent-green"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
