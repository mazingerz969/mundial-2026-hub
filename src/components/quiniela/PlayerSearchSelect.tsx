"use client";

import { ChevronDown, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Flag } from "@/components/data/Flag";
import { PlayerAvatar } from "@/components/data/PlayerAvatar";
import {
  getPlayerById,
  getPlayersByTeamId,
  getTeamById,
  players,
  sortPlayersBySquad,
  realTeams,
} from "@/lib/data";
import type { Player } from "@/lib/schemas";

interface PlayerSearchSelectProps {
  value: string | null;
  onChange: (playerId: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  hint?: string;
  /** Oculta jugadores ya elegidos en otros slots (p. ej. goleadores). */
  excludePlayerIds?: string[];
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function matchesQuery(player: Player, query: string): boolean {
  const q = normalize(query.trim());
  if (!q) return true;

  const team = getTeamById(player.teamId);
  const haystack = normalize(
    `${player.name} ${team?.name ?? ""} ${team?.shortName ?? ""} ${player.club ?? ""}`,
  );
  return haystack.includes(q);
}

function PlayerOption({
  player,
  selected,
  onSelect,
}: {
  player: Player;
  selected: boolean;
  onSelect: () => void;
}) {
  const team = getTeamById(player.teamId);

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
          selected
            ? "bg-accent-green/15 text-accent-green"
            : "hover:bg-bg-secondary"
        }`}
      >
        <PlayerAvatar name={player.name} position={player.position} size="sm" />
        <span className="min-w-0 flex-1 truncate">{player.name}</span>
        {player.number != null && (
          <span className="text-xs tabular-nums text-text-secondary">
            #{player.number}
          </span>
        )}
        <span className="text-xs text-text-secondary">{team?.shortName}</span>
      </button>
    </li>
  );
}

export function PlayerSearchSelect({
  value,
  onChange,
  disabled = false,
  placeholder = "Buscar jugador…",
  label,
  hint,
  excludePlayerIds = [],
}: PlayerSearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = value ? getPlayerById(value) : null;
  const exclude = useMemo(() => new Set(excludePlayerIds), [excludePlayerIds]);

  const sortedTeams = useMemo(
    () => [...realTeams].sort((a, b) => a.name.localeCompare(b.name, "es")),
    [],
  );

  const displayList = useMemo(() => {
    const base = teamFilter
      ? getPlayersByTeamId(teamFilter)
      : sortPlayersBySquad([...players]);

    return base.filter(
      (player) => !exclude.has(player.id) && matchesQuery(player, query),
    );
  }, [teamFilter, query, exclude]);

  const canBrowseByTeam = Boolean(teamFilter);
  const canSearchGlobally = query.trim().length >= 2;
  const showList = canBrowseByTeam || canSearchGlobally;

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function pick(playerId: string) {
    onChange(playerId);
    setOpen(false);
    setQuery("");
    setTeamFilter("");
  }

  function clear() {
    onChange(null);
    setQuery("");
    setTeamFilter("");
  }

  if (disabled && selected) {
    const team = getTeamById(selected.teamId);
    return (
      <div className="space-y-1">
        {label && (
          <p className="text-xs font-medium text-text-secondary">{label}</p>
        )}
        <div className="flex items-center gap-2 rounded-lg bg-bg-elevated px-3 py-2 text-sm">
          <PlayerAvatar
            name={selected.name}
            position={selected.position}
            size="sm"
          />
          <span className="min-w-0 flex-1 truncate">{selected.name}</span>
          {team && <Flag flagCode={team.flagCode} alt={team.name} size={16} />}
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative space-y-1">
      {label && (
        <p className="text-xs font-medium text-text-secondary">{label}</p>
      )}

      {selected && !open ? (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-bg-secondary px-3 py-2">
          <PlayerAvatar
            name={selected.name}
            position={selected.position}
            size="sm"
          />
          <span className="min-w-0 flex-1 truncate text-sm">{selected.name}</span>
          {!disabled && (
            <>
              <button
                type="button"
                onClick={clear}
                className="rounded p-1 text-text-secondary hover:text-text-primary"
                aria-label="Quitar jugador"
              >
                <X className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="rounded p-1 text-text-secondary hover:text-text-primary"
                aria-label="Cambiar jugador"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((prev) => !prev)}
          className="flex w-full items-center gap-2 rounded-lg border border-border bg-bg-secondary px-3 py-2 text-left text-sm text-text-secondary disabled:opacity-50"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="truncate">{placeholder}</span>
          <ChevronDown className="ml-auto h-4 w-4 shrink-0" />
        </button>
      )}

      {open && !disabled && (
        <div className="absolute z-30 mt-1 w-full rounded-xl border border-border bg-bg-elevated p-3 shadow-xl">
          <div className="space-y-2">
            <label className="block">
              <span className="mb-1 block text-xs text-text-secondary">
                Filtrar por equipo
              </span>
              <select
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg-secondary px-3 py-2 text-sm"
              >
                <option value="">— Todos los equipos —</option>
                {sortedTeams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nombre, selección o club…"
                autoFocus
                className="w-full rounded-lg border border-border bg-bg-secondary py-2 pl-9 pr-3 text-sm"
              />
            </div>
          </div>

          {!showList && (
            <p className="mt-3 rounded-lg bg-bg-secondary px-3 py-4 text-center text-xs text-text-secondary">
              {teamFilter
                ? "Mostrando plantilla completa del equipo seleccionado."
                : "Elige un equipo arriba para ver su plantilla (26 jugadores) o escribe al menos 2 letras para buscar entre los 1.248 jugadores del torneo."}
            </p>
          )}

          {showList && displayList.length === 0 && (
            <p className="mt-3 rounded-lg bg-bg-secondary px-3 py-4 text-center text-xs text-text-secondary">
              Sin resultados. Prueba otro nombre o equipo.
            </p>
          )}

          {showList && displayList.length > 0 && (
            <>
              <p className="mt-2 text-xs text-text-secondary">
                {displayList.length} jugador
                {displayList.length !== 1 ? "es" : ""}
                {teamFilter && getTeamById(teamFilter)
                  ? ` · ${getTeamById(teamFilter)!.name}`
                  : query.trim()
                    ? ` · búsqueda «${query.trim()}»`
                    : ""}
              </p>
              <ul className="mt-1 max-h-64 overflow-y-auto rounded-lg border border-border bg-bg-primary divide-y divide-border">
                {displayList.map((player) => (
                  <PlayerOption
                    key={player.id}
                    player={player}
                    selected={value === player.id}
                    onSelect={() => pick(player.id)}
                  />
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {hint && <p className="text-xs text-text-secondary">{hint}</p>}
    </div>
  );
}
