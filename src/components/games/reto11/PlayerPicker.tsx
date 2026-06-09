"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { PlayerAvatar } from "@/components/data/PlayerAvatar";
import { getTeamById } from "@/lib/data";
import { getPlayerCost } from "@/lib/games/reto11/cost";
import type { Challenge, Player, Position } from "@/lib/schemas";
import { getEligiblePlayers } from "@/lib/games/reto11/pool";

interface PlayerPickerProps {
  challenge: Challenge;
  selectedIds: Set<string>;
  filterPosition: Position | null;
  onSelectPlayer: (player: Player) => void;
  selectedPlayers: Player[];
}

export function PlayerPicker({
  challenge,
  selectedIds,
  filterPosition,
  onSelectPlayer,
  selectedPlayers,
}: PlayerPickerProps) {
  const [query, setQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState<Position | "ALL">("ALL");
  const budget = challenge.rules.budget ?? null;

  const pool = useMemo(() => getEligiblePlayers(challenge), [challenge]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pool.filter((p) => {
      if (selectedIds.has(p.id)) return false;
      if (filterPosition && p.position !== filterPosition) return false;
      if (positionFilter !== "ALL" && p.position !== positionFilter) return false;

      if (!q) return true;
      const team = getTeamById(p.teamId);
      const haystack = `${p.name} ${p.club ?? ""} ${team?.name ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [pool, selectedIds, filterPosition, positionFilter, query]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar jugador o club…"
          className="w-full rounded-lg border border-border bg-bg-secondary py-2.5 pl-9 pr-3 text-sm focus:border-accent-green focus:outline-none"
        />
      </div>

      {!filterPosition && (
        <div className="flex flex-wrap gap-1.5">
          {(["ALL", "GK", "DF", "MF", "FW"] as const).map((pos) => (
            <button
              key={pos}
              type="button"
              onClick={() => setPositionFilter(pos)}
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                positionFilter === pos
                  ? "bg-accent-green text-bg-primary"
                  : "bg-bg-elevated text-text-secondary"
              }`}
            >
              {pos === "ALL" ? "Todos" : pos}
            </button>
          ))}
        </div>
      )}

      <ul className="max-h-64 space-y-1 overflow-y-auto rounded-xl border border-border bg-bg-secondary">
        {filtered.length === 0 ? (
          <li className="px-4 py-6 text-center text-sm text-text-secondary">
            No hay jugadores disponibles.
          </li>
        ) : (
          filtered.slice(0, 50).map((player) => {
            const team = getTeamById(player.teamId);
            const cost = getPlayerCost(player);
            const spent = selectedPlayers.reduce(
              (sum, p) => sum + getPlayerCost(p),
              0,
            );
            const overBudget =
              budget != null && spent + cost > budget;

            return (
              <li key={player.id}>
                <button
                  type="button"
                  onClick={() => onSelectPlayer(player)}
                  disabled={overBudget}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                    overBudget
                      ? "cursor-not-allowed opacity-45"
                      : "hover:bg-bg-elevated active:scale-[0.99]"
                  }`}
                >
                  <PlayerAvatar
                    name={player.name}
                    position={player.position}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{player.name}</p>
                    <p className="truncate text-xs text-text-secondary">
                      {team?.name} · {player.position}
                      {player.club ? ` · ${player.club}` : ""}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    {budget != null ? (
                      <>
                        <span
                          className={`block rounded px-2 py-0.5 text-sm font-semibold tabular-nums ${
                            overBudget
                              ? "bg-red-500/20 text-red-400"
                              : "bg-accent-gold/20 text-accent-gold"
                          }`}
                        >
                          {cost} pts
                        </span>
                        <span className="mt-0.5 block text-[10px] tabular-nums text-text-secondary">
                          {player.rating} OVR
                        </span>
                      </>
                    ) : (
                      <span className="rounded bg-bg-elevated px-2 py-0.5 text-sm font-semibold tabular-nums">
                        {player.rating}
                      </span>
                    )}
                  </div>
                </button>
              </li>
            );
          })
        )}
      </ul>
      {filtered.length > 50 && (
        <p className="text-xs text-text-secondary">
          Mostrando 50 de {filtered.length}. Afina la búsqueda.
        </p>
      )}
    </div>
  );
}
