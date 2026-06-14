import type { Player } from "@/lib/schemas";

/**
 * Coste de mercado para retos con presupuesto.
 * Usa valor de mercado real cuando existe; si no, coste base igual para todos.
 */
export function getPlayerCost(player: Player): number {
  const value = player.marketValueEuros;
  if (value != null && value > 0) {
    return Math.max(1, Math.min(15, Math.round(Math.log10(value) * 2.5 - 2)));
  }
  return 4;
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
