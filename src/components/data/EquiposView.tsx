"use client";

import { useMemo, useState } from "react";

import { TeamCard } from "@/components/data/TeamCard";
import { useSettings } from "@/components/providers/SettingsProvider";
import {
  CONFEDERATION_LABELS,
  GROUPS,
} from "@/lib/constants/labels";
import { teams } from "@/lib/data";
import type { Team } from "@/lib/schemas";

type SortOption = "group" | "name" | "ranking";

export function EquiposView() {
  const { settings } = useSettings();
  const [groupFilter, setGroupFilter] = useState<string | null>(null);
  const [confederationFilter, setConfederationFilter] = useState<string | null>(
    null,
  );
  const [sortBy, setSortBy] = useState<SortOption>("group");

  const confederations = useMemo(
    () => [...new Set(teams.map((t) => t.confederation))].sort(),
    [],
  );

  const filtered = useMemo(() => {
    let list = [...teams];

    if (groupFilter) {
      list = list.filter((t) => t.group === groupFilter);
    }
    if (confederationFilter) {
      list = list.filter((t) => t.confederation === confederationFilter);
    }

    switch (sortBy) {
      case "name":
        list.sort((a, b) => a.name.localeCompare(b.name, "es"));
        break;
      case "ranking":
        list.sort((a, b) => a.fifaRanking - b.fifaRanking);
        break;
      default:
        list.sort((a, b) =>
          a.group === b.group
            ? a.fifaRanking - b.fifaRanking
            : a.group.localeCompare(b.group),
        );
    }

    return list;
  }, [groupFilter, confederationFilter, sortBy]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Equipos</h1>
        <p className="mt-1 text-text-secondary">
          {filtered.length} de {teams.length} selecciones
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="rounded-lg border border-border bg-bg-secondary px-3 py-2 text-sm"
          aria-label="Ordenar equipos"
        >
          <option value="group">Por grupo</option>
          <option value="name">Alfabético</option>
          <option value="ranking">Ranking FIFA</option>
        </select>

        <select
          value={confederationFilter ?? ""}
          onChange={(e) =>
            setConfederationFilter(e.target.value || null)
          }
          className="rounded-lg border border-border bg-bg-secondary px-3 py-2 text-sm"
          aria-label="Filtrar por confederación"
        >
          <option value="">Todas las confederaciones</option>
          {confederations.map((c) => (
            <option key={c} value={c}>
              {CONFEDERATION_LABELS[c] ?? c}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setGroupFilter(null)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            groupFilter === null
              ? "bg-accent-green text-bg-primary"
              : "bg-bg-elevated text-text-secondary hover:text-text-primary"
          }`}
        >
          Todos
        </button>
        {GROUPS.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGroupFilter(g)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              groupFilter === g
                ? "bg-accent-green text-bg-primary"
                : "bg-bg-elevated text-text-secondary hover:text-text-primary"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((team: Team) => (
            <TeamCard
              key={team.id}
              team={team}
              isFavorite={settings.favoriteTeamId === team.id}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-border bg-bg-secondary px-4 py-8 text-center text-sm text-text-secondary">
          Ningún equipo coincide con los filtros.
        </p>
      )}
    </div>
  );
}
