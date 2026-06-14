import type { Match } from "@/lib/schemas";

import { isMatchPredictionLocked } from "./scoring";

export type QuinielaMatchGroup = "open" | "live" | "closed";

export function getQuinielaMatchGroup(
  match: Match,
  now = Date.now(),
): QuinielaMatchGroup {
  if (match.status === "live") return "live";
  if (match.status === "finished" || match.status === "postponed") return "closed";
  if (isMatchPredictionLocked(match, now)) return "closed";
  return "open";
}

export function groupMatchesForQuiniela(
  matches: Match[],
  now = Date.now(),
): Record<QuinielaMatchGroup, Match[]> {
  const sorted = [...matches].sort(
    (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
  );

  const groups: Record<QuinielaMatchGroup, Match[]> = {
    open: [],
    live: [],
    closed: [],
  };

  for (const match of sorted) {
    groups[getQuinielaMatchGroup(match, now)].push(match);
  }

  return groups;
}

export function getFirstKickoffTime(matches: Match[]): number | null {
  if (matches.length === 0) return null;
  const sorted = [...matches].sort(
    (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
  );
  return new Date(sorted[0]!.datetime).getTime();
}

export function formatKickoffCountdown(
  iso: string,
  now = Date.now(),
): string | null {
  const ms = new Date(iso).getTime() - now;
  if (ms <= 0) return null;

  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);

  if (hours >= 48) return null;
  if (hours >= 24) return `Cierra en ${Math.floor(hours / 24)} d`;
  if (hours >= 1) return `Cierra en ${hours} h`;
  if (minutes >= 1) return `Cierra en ${minutes} min`;
  return "Cierra pronto";
}

export interface QuinielaAlerts {
  openWithoutPrediction: number;
  closingWithin24h: number;
  awardsOpen: boolean;
  awardsFilled: boolean;
}

export function getQuinielaAlerts(
  matches: Match[],
  storage: {
    matches: Record<string, { homeScore: number; awayScore: number }>;
    topScorers: string[];
    tournamentMvp: string | null;
  },
  awardsLocked: boolean,
  now = Date.now(),
): QuinielaAlerts {
  const groups = groupMatchesForQuiniela(matches, now);
  const openWithoutPrediction = groups.open.filter(
    (m) => !storage.matches[m.id],
  ).length;

  const closingWithin24h = groups.open.filter((m) => {
    if (storage.matches[m.id]) return false;
    const ms = new Date(m.datetime).getTime() - now;
    return ms > 0 && ms <= 86_400_000;
  }).length;

  const filledScorers = storage.topScorers.filter(Boolean).length;

  return {
    openWithoutPrediction,
    closingWithin24h,
    awardsOpen: !awardsLocked,
    awardsFilled: filledScorers >= 5 && storage.tournamentMvp != null,
  };
}
