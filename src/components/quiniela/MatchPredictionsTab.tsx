"use client";

import { useMemo, useState } from "react";

import { MatchPredictionCard } from "@/components/quiniela/MatchPredictionCard";
import { PHASE_LABELS } from "@/lib/constants/labels";
import { matches } from "@/lib/data";
import type { QuinielaResults } from "@/lib/games/quiniela/types";
import type { QuinielaStorage } from "@/lib/storage/quiniela";
import {
  saveMatchMvp,
  saveMatchPrediction,
} from "@/lib/storage/quiniela";

interface MatchPredictionsTabProps {
  storage: QuinielaStorage;
  results: QuinielaResults;
  timezone: string;
  onUpdate: (storage: QuinielaStorage) => void;
}

export function MatchPredictionsTab({
  storage,
  results,
  timezone,
  onUpdate,
}: MatchPredictionsTabProps) {
  const [phaseFilter, setPhaseFilter] = useState<string>("all");
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(() => {
    let list = [...matches].sort(
      (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
    );
    if (phaseFilter !== "all") {
      list = list.filter((m) => m.phase === phaseFilter);
    }
    if (!showAll) {
      const open = list.filter((m) => m.status === "scheduled");
      list = open.length > 0 ? open.slice(0, 20) : list.slice(0, 20);
    }
    return list;
  }, [phaseFilter, showAll]);

  const phases = ["all", "group", "round_of_32", "round_of_16", "quarter", "semi", "final"];

  return (
    <div className="space-y-4">
      <p className="text-sm text-text-secondary">
        Marca resultado y MVP de cada partido antes del pitido inicial.
        Resultado exacto: 5 pts · 1X2: 3 pts · MVP: 4 pts.
      </p>

      <div className="flex flex-wrap gap-1.5">
        {phases.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPhaseFilter(p)}
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

      <ul className="space-y-3">
        {filtered.map((match) => (
          <li key={match.id}>
            <MatchPredictionCard
              match={match}
              storage={storage}
              results={results}
              timezone={timezone}
              onSaveScore={(id, home, away) =>
                onUpdate(saveMatchPrediction(id, home, away))
              }
              onSaveMvp={(id, playerId) => onUpdate(saveMatchMvp(id, playerId))}
            />
          </li>
        ))}
      </ul>

      {!showAll && matches.length > 20 && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="w-full rounded-lg border border-border py-2 text-sm text-accent-green hover:bg-bg-secondary"
        >
          Ver los {matches.length} partidos
        </button>
      )}
    </div>
  );
}
