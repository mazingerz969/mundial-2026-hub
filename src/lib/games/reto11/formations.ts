import type { Position } from "@/lib/schemas";

export interface PitchSlot {
  id: string;
  position: Position;
  row: number;
  col: number;
}

/** Formación 4-3-3: 1 GK, 4 DF, 3 MF, 3 FW */
export const FORMATION_433: PitchSlot[] = [
  { id: "gk-0", position: "GK", row: 0, col: 2 },
  { id: "df-0", position: "DF", row: 1, col: 0 },
  { id: "df-1", position: "DF", row: 1, col: 1 },
  { id: "df-2", position: "DF", row: 1, col: 3 },
  { id: "df-3", position: "DF", row: 1, col: 4 },
  { id: "mf-0", position: "MF", row: 2, col: 0 },
  { id: "mf-1", position: "MF", row: 2, col: 2 },
  { id: "mf-2", position: "MF", row: 2, col: 4 },
  { id: "fw-0", position: "FW", row: 3, col: 0 },
  { id: "fw-1", position: "FW", row: 3, col: 2 },
  { id: "fw-2", position: "FW", row: 3, col: 4 },
];

export function getFormation(formation?: string): PitchSlot[] {
  if (!formation || formation === "4-3-3") return FORMATION_433;
  return FORMATION_433;
}

export type SlotAssignments = Record<string, string | null>;

export function assignmentsToPlayers(
  slots: PitchSlot[],
  assignments: SlotAssignments,
  playerMap: Map<string, import("@/lib/schemas").Player>,
) {
  return slots
    .map((slot) => {
      const playerId = assignments[slot.id];
      return playerId ? playerMap.get(playerId) ?? null : null;
    })
    .filter((p): p is import("@/lib/schemas").Player => p !== null);
}
