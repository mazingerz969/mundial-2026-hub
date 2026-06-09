import type { Match } from "@/lib/schemas";
import type { QuinielaResults } from "@/lib/games/quiniela/types";

import {
  scoreMatchMvp,
  scoreMatchResult,
  scoreTopScorers,
  scoreTournamentMvp,
} from "@/lib/games/quiniela/scoring";

export interface QuinielaStorage {
  version: 1;
  matches: Record<string, { homeScore: number; awayScore: number }>;
  matchMvps: Record<string, string>;
  topScorers: string[];
  tournamentMvp: string | null;
}

const STORAGE_KEY = "mundial2026_quiniela";

export const DEFAULT_QUINIELA: QuinielaStorage = {
  version: 1,
  matches: {},
  matchMvps: {},
  topScorers: [],
  tournamentMvp: null,
};

export function loadQuinielaStorage(): QuinielaStorage {
  if (typeof window === "undefined") return { ...DEFAULT_QUINIELA };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_QUINIELA };
    const parsed = JSON.parse(raw) as Partial<QuinielaStorage>;
    return {
      ...DEFAULT_QUINIELA,
      ...parsed,
      version: 1,
      matches: parsed.matches ?? {},
      matchMvps: parsed.matchMvps ?? {},
      topScorers: parsed.topScorers ?? [],
    };
  } catch {
    return { ...DEFAULT_QUINIELA };
  }
}

export function saveQuinielaStorage(data: QuinielaStorage): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function saveMatchPrediction(
  matchId: string,
  homeScore: number,
  awayScore: number,
): QuinielaStorage {
  const storage = loadQuinielaStorage();
  storage.matches[matchId] = { homeScore, awayScore };
  saveQuinielaStorage(storage);
  return storage;
}

export function saveMatchMvp(matchId: string, playerId: string | null): QuinielaStorage {
  const storage = loadQuinielaStorage();
  if (playerId) storage.matchMvps[matchId] = playerId;
  else delete storage.matchMvps[matchId];
  saveQuinielaStorage(storage);
  return storage;
}

export function saveTopScorers(playerIds: string[]): QuinielaStorage {
  const storage = loadQuinielaStorage();
  storage.topScorers = playerIds.slice(0, 5);
  saveQuinielaStorage(storage);
  return storage;
}

export function saveTournamentMvp(playerId: string | null): QuinielaStorage {
  const storage = loadQuinielaStorage();
  storage.tournamentMvp = playerId;
  saveQuinielaStorage(storage);
  return storage;
}

export interface QuinielaScoreBreakdown {
  matches: number;
  matchMvps: number;
  topScorers: number;
  tournamentMvp: number;
  total: number;
  matchPredictionsCount: number;
  matchMvpsCount: number;
  topScorersCount: number;
  hasTournamentMvp: boolean;
}

export function computeQuinielaScore(
  storage: QuinielaStorage,
  allMatches: Match[],
  results: QuinielaResults,
): QuinielaScoreBreakdown {
  let matchPoints = 0;
  let mvpPoints = 0;

  for (const match of allMatches) {
    matchPoints += scoreMatchResult(storage.matches[match.id], match);
    mvpPoints += scoreMatchMvp(storage.matchMvps[match.id], match, results);
  }

  const topScorersPts = scoreTopScorers(storage.topScorers, results.topScorers);
  const tournamentMvpPts = scoreTournamentMvp(
    storage.tournamentMvp,
    results.tournamentMvp,
  );

  return {
    matches: matchPoints,
    matchMvps: mvpPoints,
    topScorers: topScorersPts,
    tournamentMvp: tournamentMvpPts,
    total: matchPoints + mvpPoints + topScorersPts + tournamentMvpPts,
    matchPredictionsCount: Object.keys(storage.matches).length,
    matchMvpsCount: Object.keys(storage.matchMvps).length,
    topScorersCount: storage.topScorers.length,
    hasTournamentMvp: storage.tournamentMvp != null,
  };
}

export function getQuinielaStats(
  allMatches: Match[],
  results: QuinielaResults,
) {
  const storage = loadQuinielaStorage();
  return computeQuinielaScore(storage, allMatches, results);
}
