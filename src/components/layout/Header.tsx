import Link from "next/link";
import { Search, Settings, Trophy } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg-primary/95 backdrop-blur supports-[backdrop-filter]:bg-bg-primary/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Trophy className="h-6 w-6 text-accent-gold" />
          <span>Mundial 2026</span>
        </Link>
        <div className="flex items-center gap-2">
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
