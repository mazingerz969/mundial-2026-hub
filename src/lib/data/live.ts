import liveOverridesData from "@/data/live-overrides.json";
import matchesData from "@/data/matches.json";
import quinielaResultsData from "@/data/quiniela-results.json";
import tournamentData from "@/data/tournament.json";

import { QuinielaResultsSchema } from "@/lib/games/quiniela/types";
import {
  getCachedFootballDataLive,
  type ApiLivePatch,
} from "@/lib/data/football-data-live";
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
  source: "embedded" | "remote" | "api" | "merged";
  liveMatchCount: number;
};

function applyMatchOverride(
  match: Match,
  override?: MatchOverride,
  apiPatch?: ApiLivePatch,
): Match {
  const merged: Match = { ...match };

  if (override) {
    if (override.status !== undefined) merged.status = override.status;
    if (override.score !== undefined) merged.score = override.score;
    if (override.penaltyScore !== undefined) {
      merged.penaltyScore = override.penaltyScore;
    }
    if (override.datetime !== undefined) merged.datetime = override.datetime;
  }

  if (apiPatch) {
    if (apiPatch.status !== undefined) merged.status = apiPatch.status;
    if (apiPatch.score !== undefined) merged.score = apiPatch.score;
    if (apiPatch.penaltyScore !== undefined) {
      merged.penaltyScore = apiPatch.penaltyScore;
    }
    if (apiPatch.datetime !== undefined) merged.datetime = apiPatch.datetime;
    if (apiPatch.minute != null) merged.minute = apiPatch.minute;
    else if (merged.status !== "live") delete merged.minute;
  }

  return merged;
}

export function applyLiveOverrides(
  overrides: LiveOverrides,
  matches: Match[] = baseMatches,
  tournament: Tournament = baseTournament,
  quinielaResults: QuinielaResults = baseQuinielaResults,
  apiPatches: Record<string, ApiLivePatch> = {},
): LiveSnapshot {
  const matchMap = overrides.matches ?? {};
  const mergedMatches = matches.map((match) =>
    applyMatchOverride(
      match,
      matchMap[match.id],
      apiPatches[match.id],
    ),
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

  const liveMatchCount = mergedMatches.filter((m) => m.status === "live").length;

  return {
    matches: mergedMatches,
    tournament: mergedTournament,
    quinielaResults: mergedQuiniela,
    updatedAt: overrides.updatedAt ?? null,
    source: "embedded",
    liveMatchCount,
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
  const [overrides, apiLive] = await Promise.all([
    fetchLiveOverrides(),
    process.env.FOOTBALL_DATA_API_KEY
      ? getCachedFootballDataLive()
      : Promise.resolve(null),
  ]);

  const snapshot = applyLiveOverrides(
    overrides,
    baseMatches,
    baseTournament,
    baseQuinielaResults,
    apiLive?.patches ?? {},
  );

  if (apiLive) {
    snapshot.updatedAt = apiLive.fetchedAt;
    snapshot.source = "api";
  } else if (process.env.LIVE_DATA_URL) {
    snapshot.source = "remote";
  }

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
  getMatchesForToday,
  getNextMatchForTeamFromList,
  getNextScheduledFromList,
  getRecentFinishedFromList,
  getUpcomingFromList,
  isMatchUpcoming,
} from "@/lib/utils/tournament-status";
