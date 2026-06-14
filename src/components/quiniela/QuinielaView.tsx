"use client";

import { useEffect, useMemo, useState } from "react";

import { AwardsTab } from "@/components/quiniela/AwardsTab";
import { MatchPredictionsTab } from "@/components/quiniela/MatchPredictionsTab";
import { useLiveData } from "@/components/providers/LiveDataProvider";
import { useSettings } from "@/components/providers/SettingsProvider";
import {
  getQuinielaAlerts,
  groupMatchesForQuiniela,
} from "@/lib/games/quiniela/match-groups";
import { areAwardsLocked } from "@/lib/games/quiniela/scoring";
import { QUINIELA_POINTS } from "@/lib/games/quiniela/types";
import {
  computeQuinielaScore,
  loadQuinielaStorage,
  type QuinielaStorage,
} from "@/lib/storage/quiniela";

type Tab = "resumen" | "partidos" | "premios";

const TABS: { id: Tab; label: string }[] = [
  { id: "resumen", label: "Resumen" },
  { id: "partidos", label: "Partidos" },
  { id: "premios", label: "Premios del torneo" },
];

export function QuinielaView() {
  const { settings } = useSettings();
  const { matches, quinielaResults, tournament } = useLiveData();
  const [tab, setTab] = useState<Tab>("partidos");
  const [storage, setStorage] = useState<QuinielaStorage>(() => loadQuinielaStorage());

  useEffect(() => {
    setStorage(loadQuinielaStorage());
  }, []);

  const score = computeQuinielaScore(storage, matches, quinielaResults);
  const awardsLocked = areAwardsLocked(matches);
  const alerts = useMemo(
    () => getQuinielaAlerts(matches, storage, awardsLocked),
    [matches, storage, awardsLocked],
  );
  const groups = useMemo(() => groupMatchesForQuiniela(matches), [matches]);
  const scoredMatches = matches.filter((m) => m.status === "finished").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quiniela</h1>
        <p className="mt-1 text-text-secondary">
          Predicciones del {tournament.shortName} · Partidos y premios globales
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
          {(alerts.openWithoutPrediction > 0 ||
            alerts.closingWithin24h > 0 ||
            (alerts.awardsOpen && !alerts.awardsFilled)) && (
            <ul className="space-y-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
              {alerts.closingWithin24h > 0 && (
                <li>
                  {alerts.closingWithin24h} partido
                  {alerts.closingWithin24h === 1 ? "" : "s"} cierra en menos de
                  24 h sin predicción
                </li>
              )}
              {alerts.openWithoutPrediction > 0 && (
                <li>
                  {alerts.openWithoutPrediction} partido
                  {alerts.openWithoutPrediction === 1 ? "" : "s"} abierto
                  {alerts.openWithoutPrediction === 1 ? "" : "s"} sin marcador
                </li>
              )}
              {alerts.awardsOpen && !alerts.awardsFilled && (
                <li>Premios del torneo pendientes — cierran con el primer partido</li>
              )}
            </ul>
          )}

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
                {score.matchPredictionsCount} predicciones · {groups.open.length}{" "}
                partidos abiertos · {scoredMatches} ya puntuados
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
          spoilerMode={settings.spoilerMode}
          onUpdate={setStorage}
        />
      )}

      {tab === "premios" && (
        <AwardsTab
          storage={storage}
          results={quinielaResults}
          matches={matches}
          timezone={settings.timezone}
          onUpdate={setStorage}
        />
      )}
    </div>
  );
}
