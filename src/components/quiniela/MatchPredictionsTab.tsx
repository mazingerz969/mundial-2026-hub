"use client";

import { useMemo, useState } from "react";

import { MatchPredictionCard } from "@/components/quiniela/MatchPredictionCard";
import { useLiveMatches } from "@/components/providers/LiveDataProvider";
import { PHASE_LABELS } from "@/lib/constants/labels";
import { groupMatchesForQuiniela } from "@/lib/games/quiniela/match-groups";
import type { QuinielaResults } from "@/lib/games/quiniela/types";
import type { Match } from "@/lib/schemas";
import type { QuinielaStorage } from "@/lib/storage/quiniela";
import {
  saveMatchMvp,
  saveMatchPrediction,
} from "@/lib/storage/quiniela";

interface MatchPredictionsTabProps {
  storage: QuinielaStorage;
  results: QuinielaResults;
  timezone: string;
  spoilerMode: boolean;
  onUpdate: (storage: QuinielaStorage) => void;
}

const PHASES = [
  "all",
  "group",
  "round_of_32",
  "round_of_16",
  "quarter",
  "semi",
  "third_place",
  "final",
] as const;

const OPEN_BATCH = 15;

function filterByPhase(list: Match[], phaseFilter: string): Match[] {
  if (phaseFilter === "all") return list;
  return list.filter((m) => m.phase === phaseFilter);
}

function MatchSection({
  title,
  description,
  matches,
  storage,
  results,
  timezone,
  spoilerMode,
  onSaveScore,
  onSaveMvp,
  defaultCollapsed = false,
}: {
  title: string;
  description?: string;
  matches: Match[];
  storage: QuinielaStorage;
  results: QuinielaResults;
  timezone: string;
  spoilerMode: boolean;
  onSaveScore: (id: string, home: number, away: number) => void;
  onSaveMvp: (id: string, playerId: string | null) => void;
  defaultCollapsed?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  if (matches.length === 0) return null;

  return (
    <section className="space-y-3">
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-xs text-text-secondary">{description}</p>
          ) : null}
        </div>
        <span className="text-xs text-text-secondary">
          {matches.length} · {collapsed ? "Mostrar" : "Ocultar"}
        </span>
      </button>

      {!collapsed && (
        <ul className="space-y-3">
          {matches.map((match) => (
            <li key={match.id}>
              <MatchPredictionCard
                match={match}
                storage={storage}
                results={results}
                timezone={timezone}
                spoilerMode={spoilerMode}
                onSaveScore={onSaveScore}
                onSaveMvp={onSaveMvp}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function MatchPredictionsTab({
  storage,
  results,
  timezone,
  spoilerMode,
  onUpdate,
}: MatchPredictionsTabProps) {
  const allMatches = useLiveMatches();
  const [phaseFilter, setPhaseFilter] = useState<string>("all");
  const [openLimit, setOpenLimit] = useState(OPEN_BATCH);

  const groups = useMemo(() => {
    const filtered = filterByPhase(allMatches, phaseFilter);
    return groupMatchesForQuiniela(filtered);
  }, [allMatches, phaseFilter]);

  const openWithoutPrediction = groups.open.filter(
    (m) => !storage.matches[m.id],
  ).length;

  const visibleOpen = groups.open.slice(0, openLimit);
  const hiddenOpen = groups.open.length - visibleOpen.length;

  return (
    <div className="space-y-6">
      <p className="text-sm text-text-secondary">
        Predice el marcador y el MVP de cada partido antes del pitido inicial.
        Resultado exacto: 5 pts · 1X2: 3 pts · MVP: 4 pts.
      </p>

      {openWithoutPrediction > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          Tienes {openWithoutPrediction} partido
          {openWithoutPrediction === 1 ? "" : "s"} abierto
          {openWithoutPrediction === 1 ? "" : "s"} sin predicción.
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {PHASES.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => {
              setPhaseFilter(p);
              setOpenLimit(OPEN_BATCH);
            }}
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              phaseFilter === p
                ? "bg-accent-green text-bg-primary"
                : "bg-bg-elevated text-text-secondary"
            }`}
          >
            {p === "all" ? "Todos" : PHASE_LABELS[p] ?? p}
          </button>
        ))}
      </div>

      <MatchSection
        title="Próximos"
        description="Los más cercanos primero — editable hasta el pitido"
        matches={visibleOpen}
        storage={storage}
        results={results}
        timezone={timezone}
        spoilerMode={spoilerMode}
        onSaveScore={(id, home, away) =>
          onUpdate(saveMatchPrediction(id, home, away))
        }
        onSaveMvp={(id, playerId) => onUpdate(saveMatchMvp(id, playerId))}
      />

      {hiddenOpen > 0 && (
        <button
          type="button"
          onClick={() => setOpenLimit((n) => n + OPEN_BATCH)}
          className="w-full rounded-lg border border-border py-2 text-sm text-accent-green hover:bg-bg-secondary"
        >
          Ver {Math.min(hiddenOpen, OPEN_BATCH)} partidos más ({hiddenOpen} restantes)
        </button>
      )}

      {groups.open.length > OPEN_BATCH && openLimit >= groups.open.length && (
        <button
          type="button"
          onClick={() => setOpenLimit(OPEN_BATCH)}
          className="w-full rounded-lg border border-dashed border-border py-2 text-xs text-text-secondary hover:bg-bg-secondary"
        >
          Mostrar solo los {OPEN_BATCH} más próximos
        </button>
      )}

      <MatchSection
        title="En directo"
        description="Predicción bloqueada — partido en juego"
        matches={groups.live}
        storage={storage}
        results={results}
        timezone={timezone}
        spoilerMode={spoilerMode}
        onSaveScore={(id, home, away) =>
          onUpdate(saveMatchPrediction(id, home, away))
        }
        onSaveMvp={(id, playerId) => onUpdate(saveMatchMvp(id, playerId))}
      />

      <MatchSection
        title="Cerrados"
        description="Partidos jugados — compara tu predicción con el resultado"
        matches={[...groups.closed].reverse()}
        storage={storage}
        results={results}
        timezone={timezone}
        spoilerMode={spoilerMode}
        onSaveScore={(id, home, away) =>
          onUpdate(saveMatchPrediction(id, home, away))
        }
        onSaveMvp={(id, playerId) => onUpdate(saveMatchMvp(id, playerId))}
        defaultCollapsed
      />

      {groups.open.length === 0 &&
        groups.live.length === 0 &&
        groups.closed.length === 0 && (
          <p className="rounded-xl border border-border bg-bg-secondary px-4 py-8 text-center text-sm text-text-secondary">
            No hay partidos con este filtro.
          </p>
        )}
    </div>
  );
}
