import type { Match } from "@/lib/schemas";
import type { QuinielaResults } from "@/lib/games/quiniela/types";

export function isMatchPredictionLocked(match: Match, now = Date.now()): boolean {
  if (match.status !== "scheduled") return true;
  return new Date(match.datetime).getTime() <= now;
}

export function areAwardsLocked(
  tournamentStartDate: string,
  now = Date.now(),
): boolean {
  const start = new Date(`${tournamentStartDate}T00:00:00Z`).getTime();
  return now >= start;
}

export function getMatchOutcome(home: number, away: number): "H" | "D" | "A" {
  if (home > away) return "H";
  if (home < away) return "A";
  return "D";
}

export function isExactScore(
  predicted: { homeScore: number; awayScore: number },
  actual: { home: number; away: number },
): boolean {
  return predicted.homeScore === actual.home && predicted.awayScore === actual.away;
}

export function isOutcomeMatch(
  predicted: { homeScore: number; awayScore: number },
  actual: { home: number; away: number },
): boolean {
  return (
    getMatchOutcome(predicted.homeScore, predicted.awayScore) ===
    getMatchOutcome(actual.home, actual.away)
  );
}

export function scoreMatchResult(
  predicted: { homeScore: number; awayScore: number } | undefined,
  match: Match,
): number {
  if (!predicted || match.status !== "finished" || !match.score) return 0;
  if (isExactScore(predicted, match.score)) return 5;
  if (isOutcomeMatch(predicted, match.score)) return 3;
  return 0;
}

export function scoreMatchMvp(
  predictedMvpId: string | undefined,
  match: Match,
  results: QuinielaResults,
): number {
  if (match.status !== "finished") return 0;
  const officialMvp = results.matchMvps[match.id];
  if (officialMvp && predictedMvpId && predictedMvpId === officialMvp) return 4;
  return 0;
}

/** @deprecated use scoreMatchResult + scoreMatchMvp */
export function scoreMatchPrediction(
  predicted: { homeScore: number; awayScore: number } | undefined,
  match: Match,
  predictedMvpId: string | undefined,
  results: QuinielaResults,
): number {
  return (
    scoreMatchResult(predicted, match) +
    scoreMatchMvp(predictedMvpId, match, results)
  );
}

export function scoreTopScorers(
  picks: string[],
  official: QuinielaResults["topScorers"],
): number {
  if (official.length === 0 || picks.length === 0) return 0;

  const officialIds = official.map((e) => e.playerId);
  let points = 0;

  picks.forEach((playerId, index) => {
    const officialRank = officialIds.indexOf(playerId);
    if (officialRank === -1) return;

    if (officialRank === index) {
      const tier = [10, 8, 6, 4, 2][index] ?? 2;
      points += tier;
    } else if (officialRank < 5) {
      points += 3;
    }
  });

  return points;
}

export function scoreTournamentMvp(
  pick: string | null,
  official: string | null,
): number {
  if (!pick || !official) return 0;
  return pick === official ? 15 : 0;
}
