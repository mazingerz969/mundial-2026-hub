export type Corner = "left" | "center" | "right";

export type ShotResult = "goal" | "save" | "miss";

export type GamePhase =
  | "pick-team"
  | "shoot"
  | "save"
  | "reveal"
  | "finished";

export interface PenaltyRecord {
  shooter: "user" | "cpu";
  shooterCorner: Corner;
  keeperCorner: Corner;
  power?: number;
  result: ShotResult;
  round: number;
}

export interface Tanda90State {
  phase: GamePhase;
  userTeamId: string | null;
  cpuTeamId: string | null;
  userScore: number;
  cpuScore: number;
  userShotsTaken: number;
  cpuShotsTaken: number;
  isSuddenDeath: boolean;
  history: PenaltyRecord[];
  /** Esquina elegida por el tirador activo */
  pendingShooterCorner: Corner | null;
  pendingPower: number | null;
  /** Esquina del disparo CPU (fase save) */
  pendingCpuCorner: Corner | null;
  /** Durante fase save: tiempo límite */
  saveDeadline: number | null;
  lastResult: ShotResult | null;
  winner: "user" | "cpu" | "draw" | null;
}

export const REGULAR_ROUNDS = 5;

export const CORNER_LABELS: Record<Corner, string> = {
  left: "Izquierda",
  center: "Centro",
  right: "Derecha",
};
