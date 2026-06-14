import { challenges, players, realTeams as teams } from "@/lib/data";
import { getPlayerCost } from "@/lib/games/reto11/cost";
import type { Challenge, Player } from "@/lib/schemas";

export function getEligiblePlayers(challenge: Challenge): Player[] {
  let pool = [...players];

  if (challenge.rules.allowedTeams?.length) {
    const allowed = new Set(challenge.rules.allowedTeams);
    pool = pool.filter((p) => allowed.has(p.teamId));
  }

  if (challenge.rules.allowedGroups?.length) {
    const allowedGroups = new Set(challenge.rules.allowedGroups);
    const teamIds = new Set(
      teams.filter((t) => allowedGroups.has(t.group)).map((t) => t.id),
    );
    pool = pool.filter((p) => teamIds.has(p.teamId));
  }

  if (challenge.rules.excludedPlayers?.length) {
    const excluded = new Set(challenge.rules.excludedPlayers);
    pool = pool.filter((p) => !excluded.has(p.id));
  }

  return pool.sort((a, b) => getPlayerCost(b) - getPlayerCost(a));
}

export function canFieldEleven(challenge: Challenge): boolean {
  return getEligiblePlayers(challenge).length >= 11;
}

export function getChallengeById(id: string): Challenge | undefined {
  return challenges.find((c) => c.id === id);
}
