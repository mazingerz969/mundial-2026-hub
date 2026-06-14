import liveOverridesData from "@/data/live-overrides.json";
import matchesData from "@/data/matches.json";
import quinielaResultsData from "@/data/quiniela-results.json";
import tournamentData from "@/data/tournament.json";

import { QuinielaResultsSchema } from "@/lib/games/quiniela/types";
import {
  LiveOverridesSchema,
  type LiveOverrides,
  type MatchOverride,
} from "@/lib/data/live-types";
import {
  MatchesArraySchema,
  TournamentSchema,
  type Match,
  type Tournament,
} from "@/lib/schemas";
import type { QuinielaResults } from "@/lib/games/quiniela/types";

const baseMatches = MatchesArraySchema.parse(matchesData);
const baseTournament = TournamentSchema.parse(tournamentData);
const baseQuinielaResults = QuinielaResultsSchema.parse(quinielaResultsData);
const embeddedOverrides = LiveOverridesSchema.parse(liveOverridesData);

export type LiveSnapshot = {
  matches: Match[];
  tournament: Tournament;
  quinielaResults: QuinielaResults;
  updatedAt: string | null;
  source: "embedded" | "remote" | "merged";
};

function applyMatchOverride(match: Match, override?: MatchOverride): Match {
  if (!override) return match;

  return {
    ...match,
    ...(override.status !== undefined ? { status: override.status } : {}),
    ...(override.score !== undefined ? { score: override.score } : {}),
    ...(override.penaltyScore !== undefined
      ? { penaltyScore: override.penaltyScore }
      : {}),
    ...(override.datetime !== undefined ? { datetime: override.datetime } : {}),
  };
}

export function applyLiveOverrides(
  overrides: LiveOverrides,
  matches: Match[] = baseMatches,
  tournament: Tournament = baseTournament,
  quinielaResults: QuinielaResults = baseQuinielaResults,
): LiveSnapshot {
  const matchMap = overrides.matches ?? {};
  const mergedMatches = matches.map((match) =>
    applyMatchOverride(match, matchMap[match.id]),
  );

  const mergedTournament: Tournament = {
    ...tournament,
    ...(overrides.tournament?.currentPhase
      ? { currentPhase: overrides.tournament.currentPhase }
      : {}),
    ...(overrides.tournament?.lastUpdated
      ? { lastUpdated: overrides.tournament.lastUpdated }
      : {}),
  };

  const qr = overrides.quinielaResults ?? {};
  const mergedQuiniela: QuinielaResults = {
    topScorers: qr.topScorers ?? quinielaResults.topScorers,
    tournamentMvp: qr.tournamentMvp ?? quinielaResults.tournamentMvp,
    matchMvps: { ...quinielaResults.matchMvps, ...(qr.matchMvps ?? {}) },
  };

  return {
    matches: mergedMatches,
    tournament: mergedTournament,
    quinielaResults: mergedQuiniela,
    updatedAt: overrides.updatedAt ?? null,
    source: "embedded",
  };
}

export async function fetchLiveOverrides(): Promise<LiveOverrides> {
  const url = process.env.LIVE_DATA_URL;

  if (!url) {
    return embeddedOverrides;
  }

  try {
    const response = await fetch(url, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return embeddedOverrides;
    }

    const remote = LiveOverridesSchema.parse(await response.json());
    return {
      updatedAt: remote.updatedAt ?? embeddedOverrides.updatedAt ?? null,
      tournament: { ...embeddedOverrides.tournament, ...remote.tournament },
      matches: { ...embeddedOverrides.matches, ...remote.matches },
      quinielaResults: {
        ...embeddedOverrides.quinielaResults,
        ...remote.quinielaResults,
        matchMvps: {
          ...embeddedOverrides.quinielaResults?.matchMvps,
          ...remote.quinielaResults?.matchMvps,
        },
      },
    };
  } catch {
    return embeddedOverrides;
  }
}

export async function getLiveSnapshot(): Promise<LiveSnapshot> {
  const overrides = await fetchLiveOverrides();
  const snapshot = applyLiveOverrides(overrides);
  snapshot.source = process.env.LIVE_DATA_URL ? "remote" : "embedded";
  return snapshot;
}

export function getEmbeddedSnapshot(): LiveSnapshot {
  return applyLiveOverrides(embeddedOverrides);
}

export function filterMatchesByTeamId(list: Match[], teamId: string): Match[] {
  return list.filter(
    (match) => match.homeTeamId === teamId || match.awayTeamId === teamId,
  );
}

export {
  countFinishedMatches,
  getLiveFromList,
  getNextMatchForTeamFromList,
  getRecentFinishedFromList,
  getUpcomingFromList,
  isMatchUpcoming,
} from "@/lib/utils/tournament-status";
