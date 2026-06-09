import type { Challenge, Player, Position } from "@/lib/schemas";

import { getLineupCost, getPlayerCost } from "@/lib/games/reto11/cost";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function countByPosition(players: Player[]): Record<Position, number> {
  return players.reduce(
    (acc, p) => {
      acc[p.position] += 1;
      return acc;
    },
    { GK: 0, DF: 0, MF: 0, FW: 0 } as Record<Position, number>,
  );
}

function countByTeam(players: Player[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const p of players) {
    map.set(p.teamId, (map.get(p.teamId) ?? 0) + 1);
  }
  return map;
}

export function validateLineup(
  players: Player[],
  challenge: Challenge,
  teamsById: Map<string, { group: string; name: string }>,
): ValidationResult {
  const errors: string[] = [];
  const rules = challenge.rules;

  if (players.length !== rules.maxPlayers) {
    errors.push(
      `Necesitas exactamente ${rules.maxPlayers} jugadores (tienes ${players.length}).`,
    );
  }

  const ids = new Set<string>();
  for (const p of players) {
    if (ids.has(p.id)) {
      errors.push(`Jugador duplicado: ${p.name}.`);
    }
    ids.add(p.id);
  }

  if (rules.budget != null) {
    const total = getLineupCost(players);
    if (total > rules.budget) {
      errors.push(
        `Superas el presupuesto en ${total - rules.budget} puntos (${total}/${rules.budget}).`,
      );
    }
  }

  if (rules.maxPerTeam != null) {
    const byTeam = countByTeam(players);
    for (const [teamId, count] of byTeam) {
      if (count > rules.maxPerTeam) {
        const name = teamsById.get(teamId)?.name ?? teamId;
        errors.push(
          `Máximo ${rules.maxPerTeam} jugadores por selección (${name}: ${count}).`,
        );
      }
    }
  }

  if (rules.minPerTeam != null && rules.allowedTeams?.length === 1) {
    const teamId = rules.allowedTeams[0];
    const count = players.filter((p) => p.teamId === teamId).length;
    if (count < rules.minPerTeam) {
      errors.push(`Necesitas al menos ${rules.minPerTeam} jugadores de esa selección.`);
    }
  }

  if (rules.requiredPositions) {
    const counts = countByPosition(players);
    for (const [pos, min] of Object.entries(rules.requiredPositions)) {
      const position = pos as Position;
      if (counts[position] < min) {
        errors.push(
          `Necesitas al menos ${min} ${positionLabel(position)} (tienes ${counts[position]}).`,
        );
      }
    }
  }

  if (rules.allowedGroups?.length) {
    const allowed = new Set(rules.allowedGroups);
    for (const p of players) {
      const group = teamsById.get(p.teamId)?.group;
      if (!group || !allowed.has(group)) {
        errors.push(
          `${p.name} no pertenece a los grupos permitidos (${rules.allowedGroups.join(", ")}).`,
        );
      }
    }
  }

  if (rules.allowedTeams?.length) {
    const allowed = new Set(rules.allowedTeams);
    for (const p of players) {
      if (!allowed.has(p.teamId)) {
        errors.push(`${p.name} no está en las selecciones permitidas.`);
      }
    }
  }

  if (rules.excludedPlayers?.length) {
    const excluded = new Set(rules.excludedPlayers);
    for (const p of players) {
      if (excluded.has(p.id)) {
        errors.push(`${p.name} está excluido de este reto.`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

function positionLabel(pos: Position): string {
  const labels: Record<Position, string> = {
    GK: "portero(s)",
    DF: "defensa(s)",
    MF: "medio(s)",
    FW: "delantero(s)",
  };
  return labels[pos];
}

export function getPositionProgress(
  players: Player[],
  challenge: Challenge,
): { position: Position; current: number; required: number }[] {
  if (!challenge.rules.requiredPositions) return [];

  const counts = countByPosition(players);
  return (Object.entries(challenge.rules.requiredPositions) as [Position, number][]).map(
    ([position, required]) => ({
      position,
      current: counts[position],
      required,
    }),
  );
}

export function getBudgetProgress(
  players: Player[],
  challenge: Challenge,
): { current: number; max: number } | null {
  if (challenge.rules.budget == null) return null;
  const current = getLineupCost(players);
  return { current, max: challenge.rules.budget };
}
