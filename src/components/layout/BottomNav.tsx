"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  isNavItemActive,
  mainNavItems,
} from "@/components/layout/nav-items";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-bg-secondary md:hidden"
      aria-label="Principal"
    >
      <div className="mx-auto flex max-w-5xl justify-around px-2 py-2">
        {mainNavItems.map(({ href, label, icon: Icon }) => {
          const active = isNavItemActive(pathname, href);

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
              <span>{href === "/calendario" ? "Calend." : label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
