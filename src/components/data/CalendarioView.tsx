"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { MatchRow } from "@/components/data/MatchRow";
import { useSettings } from "@/components/providers/SettingsProvider";
import { GROUPS, PHASE_LABELS } from "@/lib/constants/labels";
import { getTeamById, matches, teams } from "@/lib/data";
import type { Match } from "@/lib/schemas";
import {
  getDateKeyInTimezone,
  getTodayKeyInTimezone,
  getTomorrowKeyInTimezone,
  isWithinWeek,
} from "@/lib/utils/datetime";

type DateFilter = "all" | "today" | "tomorrow" | "week";
type StatusFilter = "all" | Match["status"];

export function CalendarioView() {
  const searchParams = useSearchParams();
  const { settings } = useSettings();
  const [phaseFilter, setPhaseFilter] = useState<string>("all");
  const [groupFilter, setGroupFilter] = useState<string | null>(null);
  const [teamFilter, setTeamFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  useEffect(() => {
    const matchId = searchParams.get("match");
    const venueId = searchParams.get("venue");
    if (matchId) setHighlightId(matchId);
    if (venueId) {
      const match = matches.find((m) => m.venueId === venueId);
      if (match) setHighlightId(match.id);
    }
  }, [searchParams]);

  const filtered = useMemo(() => {
    const tz = settings.timezone;
    const today = getTodayKeyInTimezone(tz);
    const tomorrow = getTomorrowKeyInTimezone(tz);

    return [...matches]
      .filter((m) => {
        if (phaseFilter !== "all" && m.phase !== phaseFilter) return false;
        if (groupFilter && m.group !== groupFilter) return false;
        if (teamFilter && m.homeTeamId !== teamFilter && m.awayTeamId !== teamFilter)
          return false;
        if (favoriteOnly && settings.favoriteTeamId) {
          if (
            m.homeTeamId !== settings.favoriteTeamId &&
            m.awayTeamId !== settings.favoriteTeamId
          ) {
            return false;
          }
        }
        if (statusFilter !== "all" && m.status !== statusFilter) return false;

        if (dateFilter === "today") {
          return getDateKeyInTimezone(m.datetime, tz) === today;
        }
        if (dateFilter === "tomorrow") {
          return getDateKeyInTimezone(m.datetime, tz) === tomorrow;
        }
        if (dateFilter === "week") {
          return isWithinWeek(m.datetime, tz);
        }

        return true;
      })
      .sort(
        (a, b) =>
          new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
      );
  }, [
    phaseFilter,
    groupFilter,
    teamFilter,
    dateFilter,
    statusFilter,
    favoriteOnly,
    settings.timezone,
    settings.favoriteTeamId,
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Calendario</h1>
        <p className="mt-1 text-text-secondary">
          {filtered.length} partidos · Hora: {settings.timezone.replace("_", " ")}
        </p>
      </div>

      <div className="space-y-3 rounded-xl border border-border bg-bg-secondary p-4">
        <div className="flex flex-wrap gap-2">
          {(["all", "today", "tomorrow", "week"] as DateFilter[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDateFilter(d)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                dateFilter === d
                  ? "bg-accent-green text-bg-primary"
                  : "bg-bg-elevated text-text-secondary"
              }`}
            >
              {d === "all"
                ? "Todos"
                : d === "today"
                  ? "Hoy"
                  : d === "tomorrow"
                    ? "Mañana"
                    : "Esta semana"}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value)}
            className="rounded-lg border border-border bg-bg-primary px-3 py-2 text-sm"
            aria-label="Filtrar por fase"
          >
            <option value="all">Todas las fases</option>
            {Object.entries(PHASE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="max-w-[200px] rounded-lg border border-border bg-bg-primary px-3 py-2 text-sm"
            aria-label="Filtrar por equipo"
          >
            <option value="">Todos los equipos</option>
            {[...teams]
              .sort((a, b) => a.name.localeCompare(b.name, "es"))
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="rounded-lg border border-border bg-bg-primary px-3 py-2 text-sm"
            aria-label="Filtrar por estado"
          >
            <option value="all">Todos los estados</option>
            <option value="scheduled">Programados</option>
            <option value="live">En juego</option>
            <option value="finished">Finalizados</option>
            <option value="postponed">Aplazados</option>
          </select>
        </div>

        {phaseFilter === "group" && (
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setGroupFilter(null)}
              className={`rounded-full px-2.5 py-0.5 text-xs ${
                !groupFilter
                  ? "bg-accent-green text-bg-primary"
                  : "bg-bg-elevated text-text-secondary"
              }`}
            >
              Grupos
            </button>
            {GROUPS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGroupFilter(g)}
                className={`rounded-full px-2.5 py-0.5 text-xs ${
                  groupFilter === g
                    ? "bg-accent-green text-bg-primary"
                    : "bg-bg-elevated text-text-secondary"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        )}

        {settings.favoriteTeamId && (
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={favoriteOnly}
              onChange={(e) => setFavoriteOnly(e.target.checked)}
              className="rounded border-border accent-accent-green"
            />
            Solo {getTeamById(settings.favoriteTeamId)?.name ?? "mi favorito"}
          </label>
        )}
      </div>

      {filtered.length > 0 ? (
        <ul className="space-y-3">
          {filtered.map((match) => (
            <li key={match.id} id={match.id}>
              <MatchRow
                match={match}
                timezone={settings.timezone}
                spoilerMode={settings.spoilerMode}
                highlight={highlightId === match.id}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-border bg-bg-secondary px-4 py-8 text-center text-sm text-text-secondary">
          No hay partidos con estos filtros.
        </p>
      )}
    </div>
  );
}
