import { realTeams as teams } from "@/lib/data";
import { getPlayerCost } from "@/lib/games/reto11/cost";
import type { Challenge, Player } from "@/lib/schemas";

export interface BonusLine {
  type: string;
  label: string;
  points: number;
}

export interface ScoreResult {
  base: number;
  bonuses: BonusLine[];
  total: number;
}

function countByTeam(players: Player[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const p of players) {
    map.set(p.teamId, (map.get(p.teamId) ?? 0) + 1);
  }
  return map;
}

function countPairsFromSameTeam(players: Player[]): number {
  let pairs = 0;
  const byTeam = countByTeam(players);
  for (const count of byTeam.values()) {
    if (count >= 2) {
      pairs += (count * (count - 1)) / 2;
    }
  }
  return pairs;
}

function countPairsFromSameClub(players: Player[]): number {
  let pairs = 0;
  const byClub = new Map<string, number>();
  for (const p of players) {
    if (!p.club) continue;
    byClub.set(p.club, (byClub.get(p.club) ?? 0) + 1);
  }
  for (const count of byClub.values()) {
    if (count >= 2) {
      pairs += (count * (count - 1)) / 2;
    }
  }
  return pairs;
}

function hasAllConfederations(players: Player[]): boolean {
  const teamMap = new Map(teams.map((t) => [t.id, t.confederation]));
  const confs = new Set<string>();
  for (const p of players) {
    const conf = teamMap.get(p.teamId);
    if (conf) confs.add(conf);
  }
  const required = ["UEFA", "CONMEBOL", "CONCACAF", "CAF", "AFC", "OFC"];
  return required.every((c) => confs.has(c));
}

function hasPerfectFormation(
  players: Player[],
  challenge: Challenge,
): boolean {
  const req = challenge.rules.requiredPositions;
  if (!req) return false;

  const counts = players.reduce(
    (acc, p) => {
      acc[p.position] += 1;
      return acc;
    },
    { GK: 0, DF: 0, MF: 0, FW: 0 } as Record<string, number>,
  );

  return (Object.entries(req) as [keyof typeof req, number][]).every(
    ([pos, min]) => counts[pos] >= min,
  );
}

export function calculateScore(
  players: Player[],
  challenge: Challenge,
): ScoreResult {
  const base = players.reduce((sum, p) => sum + getPlayerCost(p) * 8, 0);
  const bonuses: BonusLine[] = [];

  for (const bonus of challenge.scoring.bonuses) {
    switch (bonus.type) {
      case "same_team_pairs": {
        const teamPairs = countPairsFromSameTeam(players);
        const clubPairs = countPairsFromSameClub(players);
        const pairs = Math.max(teamPairs, clubPairs);
        const minPairs = bonus.minPairs ?? 1;
        if (pairs >= minPairs) {
          const earnedPairs = pairs - minPairs + 1;
          bonuses.push({
            type: bonus.type,
            label: `Pares misma selección/club (×${earnedPairs})`,
            points: bonus.points * earnedPairs,
          });
        }
        break;
      }
      case "all_confederations": {
        if (hasAllConfederations(players)) {
          bonuses.push({
            type: bonus.type,
            label: "Todas las confederaciones",
            points: bonus.points,
          });
        }
        break;
      }
      case "perfect_formation": {
        if (hasPerfectFormation(players, challenge)) {
          bonuses.push({
            type: bonus.type,
            label: "Formación cumplida",
            points: bonus.points,
          });
        }
        break;
      }
    }
  }

  const total = base + bonuses.reduce((sum, b) => sum + b.points, 0);

  return { base, bonuses, total };
}
