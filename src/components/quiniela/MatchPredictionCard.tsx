"use client";

import { Lock } from "lucide-react";
import { useEffect, useMemo } from "react";

import { Flag } from "@/components/data/Flag";
import { MatchMvpSelect } from "@/components/quiniela/MatchMvpSelect";
import { PHASE_LABELS } from "@/lib/constants/labels";
import { getPlayerById, getTeamById } from "@/lib/data";
import { isMatchPredictionLocked, scoreMatchMvp, scoreMatchResult } from "@/lib/games/quiniela/scoring";
import type { QuinielaResults } from "@/lib/games/quiniela/types";
import type { Match } from "@/lib/schemas";
import type { QuinielaStorage } from "@/lib/storage/quiniela";
import { formatMatchDateTime } from "@/lib/utils/datetime";

interface MatchPredictionCardProps {
  match: Match;
  storage: QuinielaStorage;
  results: QuinielaResults;
  timezone: string;
  onSaveScore: (matchId: string, home: number, away: number) => void;
  onSaveMvp: (matchId: string, playerId: string | null) => void;
}

export function MatchPredictionCard({
  match,
  storage,
  results,
  timezone,
  onSaveScore,
  onSaveMvp,
}: MatchPredictionCardProps) {
  const home = getTeamById(match.homeTeamId);
  const away = getTeamById(match.awayTeamId);
  const locked = isMatchPredictionLocked(match);
  const prediction = storage.matches[match.id];
  const mvpId = storage.matchMvps[match.id] ?? null;

  const validMvpId = useMemo(() => {
    if (!mvpId) return null;
    const player = getPlayerById(mvpId);
    if (!player) return null;
    if (
      player.teamId !== match.homeTeamId &&
      player.teamId !== match.awayTeamId
    ) {
      return null;
    }
    return mvpId;
  }, [mvpId, match.homeTeamId, match.awayTeamId]);

  useEffect(() => {
    if (mvpId && !validMvpId) {
      onSaveMvp(match.id, null);
    }
  }, [match.id, mvpId, validMvpId, onSaveMvp]);

  const resultPts = scoreMatchResult(prediction, match);
  const mvpPts = scoreMatchMvp(validMvpId ?? undefined, match, results);
  const finished = match.status === "finished";

  return (
    <article className="rounded-xl border border-border bg-bg-secondary p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-text-secondary">
        <span>{formatMatchDateTime(match.datetime, timezone)}</span>
        <div className="flex items-center gap-2">
          <span>{PHASE_LABELS[match.phase] ?? match.phase}</span>
          {locked && (
            <span className="inline-flex items-center gap-1 text-amber-400">
              <Lock className="h-3 w-3" />
              Cerrado
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {home && <Flag flagCode={home.flagCode} alt={home.name} size={24} />}
          <span className="truncate text-sm font-medium">{home?.name}</span>
        </div>

        {finished && match.score && !locked ? null : (
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              max={15}
              disabled={locked}
              value={prediction?.homeScore ?? ""}
              placeholder="0"
              onChange={(e) => {
                const homeScore = Math.max(0, parseInt(e.target.value, 10) || 0);
                onSaveScore(match.id, homeScore, prediction?.awayScore ?? 0);
              }}
              className="w-12 rounded-lg border border-border bg-bg-elevated py-2 text-center text-sm font-bold tabular-nums disabled:opacity-50"
              aria-label={`Goles ${home?.name ?? "local"}`}
            />
            <span className="text-text-secondary">–</span>
            <input
              type="number"
              min={0}
              max={15}
              disabled={locked}
              value={prediction?.awayScore ?? ""}
              placeholder="0"
              onChange={(e) => {
                const awayScore = Math.max(0, parseInt(e.target.value, 10) || 0);
                onSaveScore(match.id, prediction?.homeScore ?? 0, awayScore);
              }}
              className="w-12 rounded-lg border border-border bg-bg-elevated py-2 text-center text-sm font-bold tabular-nums disabled:opacity-50"
              aria-label={`Goles ${away?.name ?? "visitante"}`}
            />
          </div>
        )}

        {finished && match.score && (
          <span className="text-lg font-bold tabular-nums">
            {match.score.home} – {match.score.away}
          </span>
        )}

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <span className="truncate text-right text-sm font-medium">{away?.name}</span>
          {away && <Flag flagCode={away.flagCode} alt={away.name} size={24} />}
        </div>
      </div>

      <div className="mt-3 border-t border-border pt-3">
        <MatchMvpSelect
          homeTeamId={match.homeTeamId}
          awayTeamId={match.awayTeamId}
          value={validMvpId}
          onChange={(id) => onSaveMvp(match.id, id)}
          disabled={locked}
        />
        {results.matchMvps[match.id] && finished && (
          <p className="mt-1 text-xs text-text-secondary">
            Oficial: {getPlayerById(results.matchMvps[match.id]!)?.name ?? "—"}
          </p>
        )}
      </div>

      {finished && (resultPts > 0 || mvpPts > 0) && (
        <p className="mt-2 text-xs font-medium text-accent-green">
          +{resultPts + mvpPts} pts
          {resultPts > 0 ? ` (resultado ${resultPts})` : ""}
          {mvpPts > 0 ? ` (MVP ${mvpPts})` : ""}
        </p>
      )}
    </article>
  );
}
