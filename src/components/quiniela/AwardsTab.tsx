"use client";

import { PlayerSearchSelect } from "@/components/quiniela/PlayerSearchSelect";
import { getPlayerById } from "@/lib/data";
import {
  areAwardsLocked,
  scoreTopScorers,
  scoreTournamentMvp,
} from "@/lib/games/quiniela/scoring";
import type { QuinielaResults } from "@/lib/games/quiniela/types";
import type { Match } from "@/lib/schemas";
import type { QuinielaStorage } from "@/lib/storage/quiniela";
import { saveTopScorers, saveTournamentMvp } from "@/lib/storage/quiniela";
import { formatMatchDateTime } from "@/lib/utils/datetime";

interface AwardsTabProps {
  storage: QuinielaStorage;
  results: QuinielaResults;
  matches: Match[];
  timezone: string;
  onUpdate: (storage: QuinielaStorage) => void;
}

const RANK_LABELS = ["1º", "2º", "3º", "4º", "5º"];

function paddedScorers(ids: string[]): string[] {
  const next = [...ids];
  while (next.length < 5) next.push("");
  return next.slice(0, 5);
}

export function AwardsTab({
  storage,
  results,
  matches,
  timezone,
  onUpdate,
}: AwardsTabProps) {
  const locked = areAwardsLocked(matches);
  const firstMatch = [...matches].sort(
    (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
  )[0];

  const slots = paddedScorers(storage.topScorers);
  const filledScorers = slots.filter(Boolean).length;
  const topScorersPts = scoreTopScorers(slots, results.topScorers);
  const mvpPts = scoreTournamentMvp(storage.tournamentMvp, results.tournamentMvp);

  function setScorerAt(index: number, playerId: string | null) {
    const next = paddedScorers(storage.topScorers);
    if (playerId) {
      const dup = next.indexOf(playerId);
      if (dup !== -1) next[dup] = "";
      next[index] = playerId;
    } else {
      next[index] = "";
    }
    onUpdate(saveTopScorers(next));
  }

  return (
    <div className="space-y-8">
      <div
        className={`rounded-xl border px-4 py-3 text-sm ${
          locked
            ? "border-amber-500/30 bg-amber-500/10 text-amber-100"
            : "border-accent-green/30 bg-accent-green/10 text-text-primary"
        }`}
      >
        {locked ? (
          <p>
            Cerrado — el torneo ya empezó. Los premios globales solo se pueden
            rellenar antes del primer partido.
          </p>
        ) : (
          <p>
            Abierto — cierra con el pitido inicial
            {firstMatch
              ? ` (${formatMatchDateTime(firstMatch.datetime, timezone)})`
              : ""}
            . Rellena tu top 5 de goleadores y el MVP del torneo.
          </p>
        )}
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Pichichi — Top 5 goleadores</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Ordena tu top 5 del torneo. Acierto en posición: 10/8/6/4/2 pts.
            En top 5 sin posición exacta: 3 pts.
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            {filledScorers}/5 elegidos
          </p>
        </div>

        <div className="space-y-3">
          {RANK_LABELS.map((label, index) => {
            const excludePlayerIds = slots.filter(
              (id, i) => i !== index && Boolean(id),
            ) as string[];

            return (
              <PlayerSearchSelect
                key={label}
                label={label}
                value={slots[index] || null}
                onChange={(id) => setScorerAt(index, id)}
                disabled={locked}
                placeholder={`Goleador ${label}…`}
                excludePlayerIds={excludePlayerIds}
                hint="Elige equipo para ver plantilla completa o busca por nombre"
              />
            );
          })}
        </div>

        {results.topScorers.length > 0 && (
          <div className="rounded-lg border border-border bg-bg-elevated p-3 text-sm">
            <p className="font-medium">Ranking oficial</p>
            <ol className="mt-2 space-y-1 text-text-secondary">
              {results.topScorers.map((entry, i) => (
                <li key={entry.playerId}>
                  {i + 1}. {getPlayerById(entry.playerId)?.name ?? entry.playerId}{" "}
                  ({entry.goals} goles)
                </li>
              ))}
            </ol>
            {topScorersPts > 0 && (
              <p className="mt-2 text-accent-green">+{topScorersPts} pts</p>
            )}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">MVP del torneo</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Balón de Oro / mejor jugador del Mundial. 15 pts si aciertas.
          </p>
        </div>

        <PlayerSearchSelect
          value={storage.tournamentMvp}
          onChange={(id) => onUpdate(saveTournamentMvp(id))}
          disabled={locked}
          placeholder="Elegir MVP del torneo…"
          hint="Elige equipo para ver plantilla completa o busca por nombre"
        />

        {results.tournamentMvp && (
          <p className="text-sm text-text-secondary">
            Oficial:{" "}
            {getPlayerById(results.tournamentMvp)?.name ?? results.tournamentMvp}
            {mvpPts > 0 && (
              <span className="ml-2 text-accent-green">+{mvpPts} pts</span>
            )}
          </p>
        )}
      </section>
    </div>
  );
}
