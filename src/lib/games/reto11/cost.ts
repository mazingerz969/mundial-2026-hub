import type { Player } from "@/lib/schemas";

/**
 * Coste de mercado para retos con presupuesto.
 * Escala el rating (55–92) a un rango jugable (~1–13) para presupuestos ~100.
 */
export function getPlayerCost(player: Player): number {
  return Math.max(1, Math.round((player.rating - 52) / 3));
}

export function getLineupCost(players: Player[]): number {
  return players.reduce((sum, player) => sum + getPlayerCost(player), 0);
}

export function canAffordPlayer(
  currentPlayers: Player[],
  candidate: Player,
  budget: number,
): boolean {
  return getLineupCost(currentPlayers) + getPlayerCost(candidate) <= budget;
}
