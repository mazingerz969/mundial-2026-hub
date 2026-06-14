"use client";

import { useEffect, useState } from "react";

import { AwardsTab } from "@/components/quiniela/AwardsTab";
import { MatchPredictionsTab } from "@/components/quiniela/MatchPredictionsTab";
import { useLiveData } from "@/components/providers/LiveDataProvider";
import { useSettings } from "@/components/providers/SettingsProvider";
import { QUINIELA_POINTS } from "@/lib/games/quiniela/types";
import {
  computeQuinielaScore,
  loadQuinielaStorage,
  type QuinielaStorage,
} from "@/lib/storage/quiniela";

type Tab = "resumen" | "partidos" | "jugadores";

const TABS: { id: Tab; label: string }[] = [
  { id: "resumen", label: "Resumen" },
  { id: "partidos", label: "Partidos" },
  { id: "jugadores", label: "Goleadores y MVP" },
];

export function QuinielaView() {
  const { settings } = useSettings();
  const { matches, quinielaResults, tournament } = useLiveData();
  const [tab, setTab] = useState<Tab>("resumen");
  const [storage, setStorage] = useState<QuinielaStorage>(() => loadQuinielaStorage());

  useEffect(() => {
    setStorage(loadQuinielaStorage());
  }, []);

  const score = computeQuinielaScore(storage, matches, quinielaResults);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quiniela</h1>
        <p className="mt-1 text-text-secondary">
          Predicciones del {tournament.shortName} · Partidos, goleadores y MVPs
        </p>
      </div>

      <div className="rounded-2xl border border-accent-gold/30 bg-accent-gold/5 p-5 text-center">
        <p className="text-sm text-accent-gold">Puntuación total</p>
        <p className="mt-1 text-4xl font-bold tabular-nums text-accent-gold">
          {score.total}
        </p>
        <p className="mt-2 text-xs text-text-secondary">pts acumulados</p>
      </div>

      <div className="flex gap-1 rounded-xl border border-border bg-bg-secondary p-1">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex-1 rounded-lg px-2 py-2 text-xs font-medium transition-colors sm:text-sm ${
              tab === id
                ? "bg-accent-green text-bg-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "resumen" && (
        <div className="space-y-4">
          <ul className="divide-y divide-border rounded-xl border border-border bg-bg-secondary">
            {[
              { label: "Resultados de partidos", pts: score.matches, max: "5/partido" },
              { label: "MVP por partido", pts: score.matchMvps, max: "4/partido" },
              { label: "Top goleadores", pts: score.topScorers, max: "10/8/6/4/2" },
              { label: "MVP del torneo", pts: score.tournamentMvp, max: "15" },
            ].map(({ label, pts, max }) => (
              <li
                key={label}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
                <span>{label}</span>
                <span className="tabular-nums">
                  <span className="font-semibold text-accent-green">{pts}</span>
                  <span className="text-text-secondary"> / {max}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="rounded-xl border border-border bg-bg-secondary p-4 text-sm">
            <p className="font-medium">Tu progreso</p>
            <ul className="mt-3 space-y-2 text-text-secondary">
              <li>
                {score.matchPredictionsCount}/{matches.length} partidos con
                resultado
              </li>
              <li>{score.matchMvpsCount} MVPs de partido elegidos</li>
              <li>
                {score.topScorersCount}/5 goleadores ·{" "}
                {score.hasTournamentMvp ? "MVP torneo ✓" : "MVP torneo pendiente"}
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-dashed border-border p-4 text-xs text-text-secondary">
            <p className="font-medium text-text-primary">Cómo puntuar</p>
            <ul className="mt-2 space-y-1">
              <li>Resultado exacto: {QUINIELA_POINTS.exactScore} pts</li>
              <li>1X2 (gana/empata): {QUINIELA_POINTS.matchOutcome} pts</li>
              <li>MVP partido: {QUINIELA_POINTS.matchMvp} pts</li>
              <li>Top goleadores en posición: 10/8/6/4/2 pts</li>
              <li>MVP torneo: {QUINIELA_POINTS.tournamentMvp} pts</li>
            </ul>
          </div>
        </div>
      )}

      {tab === "partidos" && (
        <MatchPredictionsTab
          storage={storage}
          results={quinielaResults}
          timezone={settings.timezone}
          onUpdate={setStorage}
        />
      )}

      {tab === "jugadores" && (
        <AwardsTab
          storage={storage}
          results={quinielaResults}
          onUpdate={setStorage}
        />
      )}
    </div>
  );
}
