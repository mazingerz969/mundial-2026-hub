import Link from "next/link";

import { Flag } from "@/components/data/Flag";
import { PHASE_LABELS, STATUS_LABELS } from "@/lib/constants/labels";
import { getTeamById, getVenueById } from "@/lib/data";
import type { Match } from "@/lib/schemas";
import { formatMatchDateTime } from "@/lib/utils/datetime";

interface MatchRowProps {
  match: Match;
  timezone: string;
  spoilerMode: boolean;
  compact?: boolean;
  highlight?: boolean;
}

function StatusBadge({ status }: { status: Match["status"] }) {
  const styles: Record<Match["status"], string> = {
    scheduled: "bg-bg-elevated text-text-secondary",
    live: "bg-accent-green/20 text-accent-green animate-pulse",
    finished: "bg-accent-blue/20 text-accent-blue",
    postponed: "bg-amber-500/20 text-amber-400",
  };

  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function MatchRow({
  match,
  timezone,
  spoilerMode,
  compact = false,
  highlight = false,
}: MatchRowProps) {
  const home = getTeamById(match.homeTeamId);
  const away = getTeamById(match.awayTeamId);
  const venue = getVenueById(match.venueId);

  const showScore =
    !spoilerMode &&
    match.score &&
    (match.status === "finished" || match.status === "live");

  const timeLabel = formatMatchDateTime(match.datetime, timezone, {
    timeOnly: compact,
  });
  const dateTimeLabel = compact
    ? timeLabel
    : formatMatchDateTime(match.datetime, timezone);

  return (
    <article
      className={`rounded-xl border bg-bg-secondary p-4 ${
        highlight ? "border-accent-green/50" : "border-border"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-text-secondary">
        <span>{compact ? dateTimeLabel : dateTimeLabel}</span>
        <div className="flex items-center gap-2">
          <span>{PHASE_LABELS[match.phase] ?? match.phase}</span>
          <StatusBadge status={match.status} />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {home && (
            <Flag flagCode={home.flagCode} alt={home.name} size={24} />
          )}
          <Link
            href={`/equipos/${match.homeTeamId}`}
            className="truncate font-medium hover:text-accent-green"
          >
            {home?.name ?? match.homeTeamId}
          </Link>
        </div>

        <div className="shrink-0 px-2 text-center">
          {showScore ? (
            <span className="text-lg font-bold tabular-nums">
              {match.score!.home} – {match.score!.away}
            </span>
          ) : match.status === "live" && spoilerMode ? (
            <span className="text-sm text-accent-green">En juego</span>
          ) : (
            <span className="text-sm text-text-secondary">vs</span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <Link
            href={`/equipos/${match.awayTeamId}`}
            className="truncate text-right font-medium hover:text-accent-green"
          >
            {away?.name ?? match.awayTeamId}
          </Link>
          {away && (
            <Flag flagCode={away.flagCode} alt={away.name} size={24} />
          )}
        </div>
      </div>

      {!compact && (
        <p className="mt-2 text-sm text-text-secondary">
          {venue?.name ?? match.venueId}
          {match.group ? ` · Grupo ${match.group}` : ""}
        </p>
      )}

      {spoilerMode && match.status === "finished" && (
        <p className="mt-2 text-xs text-text-secondary">
          Resultado oculto — desactiva en ajustes
        </p>
      )}
    </article>
  );
}
