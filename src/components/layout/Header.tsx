"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Settings, Trophy } from "lucide-react";

import {
  isNavItemActive,
  mainNavItems,
} from "@/components/layout/nav-items";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg-primary/95 backdrop-blur supports-[backdrop-filter]:bg-bg-primary/80">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold">
          <Trophy className="h-6 w-6 text-accent-gold" />
          <span className="hidden sm:inline">Mundial 2026</span>
        </Link>

        <nav
          className="hidden min-w-0 flex-1 md:flex md:items-center md:justify-center md:gap-0.5"
          aria-label="Principal"
        >
          {mainNavItems.map(({ href, label, icon: Icon }) => {
            const active = isNavItemActive(pathname, href);

            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-accent-green/10 text-accent-green"
                    : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={active ? 2.5 : 2} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Link
            href="/buscar"
            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-bg-secondary hover:text-text-primary"
            aria-label="Buscar"
          >
            <Search className="h-5 w-5" />
          </Link>
          <Link
            href="/configuracion"
            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-bg-secondary hover:text-text-primary"
            aria-label="Configuración"
          >
            <Settings className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
