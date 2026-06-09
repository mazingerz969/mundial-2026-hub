"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Flag } from "@/components/data/Flag";
import { PlayerAvatar } from "@/components/data/PlayerAvatar";
import { getTeamById } from "@/lib/data";
import {
  groupSearchResults,
  searchAll,
  SEARCH_TYPE_LABELS,
  type SearchResult,
  type SearchResultType,
} from "@/lib/data/search";

function SearchResultIcon({
  type,
  item,
}: {
  type: SearchResultType;
  item: SearchResult;
}) {
  if (type === "player" && item.playerPosition) {
    return (
      <PlayerAvatar
        name={item.title}
        position={item.playerPosition}
        size="sm"
      />
    );
  }

  if (type === "team") {
    const team = getTeamById(item.id);
    if (team) {
      return <Flag flagCode={team.flagCode} alt={team.name} size={28} />;
    }
  }

  return null;
}

function highlightMatch(text: string, query: string) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-accent-green/30 px-0.5 text-text-primary">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export function SearchView() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(timer);
  }, [query]);

  const results = useMemo(
    () => searchAll(debouncedQuery),
    [debouncedQuery],
  );
  const grouped = useMemo(() => groupSearchResults(results), [results]);

  const order: SearchResultType[] = ["team", "player", "match", "venue"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Búsqueda</h1>
        <p className="mt-1 text-text-secondary">
          Equipos, jugadores, partidos y sedes
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar Messi, Argentina, Azteca…"
          className="w-full rounded-xl border border-border bg-bg-secondary py-3 pl-10 pr-4 text-text-primary placeholder:text-text-secondary focus:border-accent-green focus:outline-none focus:ring-1 focus:ring-accent-green"
          autoFocus
          aria-label="Buscar en el hub del Mundial"
        />
      </div>

      {debouncedQuery.length > 0 && debouncedQuery.length < 2 && (
        <p className="text-sm text-text-secondary">
          Escribe al menos 2 caracteres.
        </p>
      )}

      {debouncedQuery.length >= 2 && results.length === 0 && (
        <div className="rounded-xl border border-border bg-bg-secondary px-4 py-8 text-center">
          <p className="text-text-secondary">
            Sin resultados para &ldquo;{debouncedQuery}&rdquo;
          </p>
          <p className="mt-2 text-sm text-text-secondary">
            Prueba con un grupo (ej. &ldquo;Grupo J&rdquo;) o nombre de sede.
          </p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-6">
          {order.map((type) => {
            const items = grouped[type];
            if (items.length === 0) return null;

            return (
              <section key={type}>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-secondary">
                  {SEARCH_TYPE_LABELS[type]}
                </h2>
                <ul className="divide-y divide-border rounded-xl border border-border bg-bg-secondary">
                  {items.map((item) => (
                    <li key={`${type}-${item.id}`}>
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-bg-elevated"
                      >
                        <SearchResultIcon type={type} item={item} />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">
                            {highlightMatch(item.title, debouncedQuery)}
                          </p>
                          <p className="mt-0.5 text-sm text-text-secondary">
                            {item.subtitle}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      {query.length === 0 && (
        <div className="rounded-xl border border-border bg-bg-secondary p-4">
          <p className="text-sm font-medium">Sugerencias</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {["Argentina", "Messi", "Grupo J", "Azteca", "España"].map(
              (term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setQuery(term)}
                  className="rounded-full bg-bg-elevated px-3 py-1 text-xs text-text-secondary hover:text-text-primary"
                >
                  {term}
                </button>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
