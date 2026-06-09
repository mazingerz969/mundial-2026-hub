"use client";

import { useMemo, useState } from "react";

import { PlayerRow } from "@/components/data/PlayerRow";
import { POSITION_LABELS } from "@/lib/constants/labels";
import type { Player, Position } from "@/lib/schemas";

type SortOption = "rating" | "number" | "name";

interface SquadListProps {
  players: Player[];
}

const POSITIONS: (Position | "ALL")[] = ["ALL", "GK", "DF", "MF", "FW"];

export function SquadList({ players }: SquadListProps) {
  const [positionFilter, setPositionFilter] = useState<Position | "ALL">("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("rating");

  const filtered = useMemo(() => {
    let list = [...players];

    if (positionFilter !== "ALL") {
      list = list.filter((p) => p.position === positionFilter);
    }

    switch (sortBy) {
      case "number":
        list.sort(
          (a, b) => (a.number ?? 999) - (b.number ?? 999),
        );
        break;
      case "name":
        list.sort((a, b) => a.name.localeCompare(b.name, "es"));
        break;
      default:
        list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [players, positionFilter, sortBy]);

  if (players.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-bg-secondary px-4 py-6 text-sm text-text-secondary">
        Plantilla en actualización. Vuelve pronto.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {POSITIONS.map((pos) => (
          <button
            key={pos}
            type="button"
            onClick={() => setPositionFilter(pos)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              positionFilter === pos
                ? "bg-accent-green text-bg-primary"
                : "bg-bg-elevated text-text-secondary hover:text-text-primary"
            }`}
          >
            {pos === "ALL" ? "Todos" : pos}
          </button>
        ))}

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="ml-auto rounded-lg border border-border bg-bg-secondary px-3 py-1 text-xs"
          aria-label="Ordenar plantilla"
        >
          <option value="rating">Por rating</option>
          <option value="number">Por dorsal</option>
          <option value="name">Por nombre</option>
        </select>
      </div>

      {filtered.length > 0 ? (
        <ul className="divide-y divide-border rounded-xl border border-border bg-bg-secondary">
          {filtered.map((player) => (
            <PlayerRow key={player.id} player={player} />
          ))}
        </ul>
      ) : (
        <p className="text-sm text-text-secondary">
          No hay jugadores en {POSITION_LABELS[positionFilter] ?? positionFilter}.
        </p>
      )}
    </div>
  );
}
