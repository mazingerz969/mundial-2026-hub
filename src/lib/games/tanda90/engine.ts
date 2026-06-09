import type { Corner, ShotResult, Tanda90State } from "./types";
import { REGULAR_ROUNDS } from "./types";

const CORNERS: Corner[] = ["left", "center", "right"];

export function createInitialState(): Tanda90State {
  return {
    phase: "pick-team",
    userTeamId: null,
    cpuTeamId: null,
    userScore: 0,
    cpuScore: 0,
    userShotsTaken: 0,
    cpuShotsTaken: 0,
    isSuddenDeath: false,
    history: [],
    pendingShooterCorner: null,
    pendingPower: null,
    pendingCpuCorner: null,
    saveDeadline: null,
    lastResult: null,
    winner: null,
  };
}

export function pickRandomCorner(): Corner {
  return CORNERS[Math.floor(Math.random() * CORNERS.length)]!;
}

/** CPU portero: 40% adivina la esquina del usuario */
export function cpuKeeperChoice(shooterCorner: Corner): Corner {
  if (Math.random() < 0.4) return shooterCorner;
  return pickRandomCorner();
}

/** CPU tirador: elige esquina aleatoria (70% coherente = random uniforme en v1) */
export function cpuShooterChoice(): Corner {
  return pickRandomCorner();
}

/**
 * Potencia ideal 70–90. Fuera de ese rango aumenta probabilidad de fallo.
 * Misma esquina = parada.
 */
export function resolveShot(
  shooterCorner: Corner,
  keeperCorner: Corner,
  power?: number,
): ShotResult {
  if (power !== undefined) {
    if (power < 35 || power > 98) return "miss";
    if (power < 70 || power > 90) {
      if (Math.random() < 0.35) return "miss";
    }
  }
  if (shooterCorner === keeperCorner) {
    return "save";
  }
  return "goal";
}

export function isUserTurnToShoot(state: Tanda90State): boolean {
  const total = state.userShotsTaken + state.cpuShotsTaken;
  return total % 2 === 0;
}

export function bothTeamsFinishedRegular(state: Tanda90State): boolean {
  return (
    state.userShotsTaken >= REGULAR_ROUNDS &&
    state.cpuShotsTaken >= REGULAR_ROUNDS &&
    !state.isSuddenDeath
  );
}

export function needsSuddenDeath(state: Tanda90State): boolean {
  return (
    state.userShotsTaken >= REGULAR_ROUNDS &&
    state.cpuShotsTaken >= REGULAR_ROUNDS &&
    state.userScore === state.cpuScore
  );
}

export function isGameOver(state: Tanda90State): boolean {
  if (state.phase === "finished") return true;

  if (!state.isSuddenDeath) {
    if (
      state.userShotsTaken >= REGULAR_ROUNDS &&
      state.cpuShotsTaken >= REGULAR_ROUNDS
    ) {
      return state.userScore !== state.cpuScore;
    }
    return false;
  }

  // Muerte súbita: tras un par completo (user+cpu) con diferencia
  if (state.userShotsTaken > REGULAR_ROUNDS && state.cpuShotsTaken > REGULAR_ROUNDS) {
    const sdUser = state.userShotsTaken - REGULAR_ROUNDS;
    const sdCpu = state.cpuShotsTaken - REGULAR_ROUNDS;
    if (sdUser === sdCpu && sdUser > 0) {
      return state.userScore !== state.cpuScore;
    }
  }

  return false;
}

export function getWinner(state: Tanda90State): "user" | "cpu" | "draw" {
  if (state.userScore > state.cpuScore) return "user";
  if (state.cpuScore > state.userScore) return "cpu";
  return "draw";
}

export function getCurrentRoundLabel(state: Tanda90State): string {
  const n = Math.max(state.userShotsTaken, state.cpuShotsTaken) + 1;
  if (state.isSuddenDeath) return `Muerte súbita · Tanda ${n - REGULAR_ROUNDS}`;
  return `Ronda ${Math.min(n, REGULAR_ROUNDS)}/${REGULAR_ROUNDS}`;
}

export function applyShotResult(
  state: Tanda90State,
  record: Omit<import("./types").PenaltyRecord, "round">,
): Tanda90State {
  const round = Math.max(state.userShotsTaken, state.cpuShotsTaken) + 1;
  const fullRecord = { ...record, round };

  let userScore = state.userScore;
  let cpuScore = state.cpuScore;
  let userShotsTaken = state.userShotsTaken;
  let cpuShotsTaken = state.cpuShotsTaken;

  if (record.shooter === "user" && record.result === "goal") userScore += 1;
  if (record.shooter === "cpu" && record.result === "goal") cpuScore += 1;
  if (record.shooter === "user") userShotsTaken += 1;
  if (record.shooter === "cpu") cpuShotsTaken += 1;

  const next: Tanda90State = {
    ...state,
    userScore,
    cpuScore,
    userShotsTaken,
    cpuShotsTaken,
    history: [...state.history, fullRecord],
    pendingShooterCorner: null,
    pendingPower: null,
    pendingCpuCorner: null,
    saveDeadline: null,
    lastResult: record.result,
    phase: "reveal",
  };

  const regularDone =
    userShotsTaken >= REGULAR_ROUNDS && cpuShotsTaken >= REGULAR_ROUNDS;

  if (regularDone && !next.isSuddenDeath && userScore === cpuScore) {
    next.isSuddenDeath = true;
  }

  const suddenDeathPairDone =
    next.isSuddenDeath &&
    userShotsTaken > REGULAR_ROUNDS &&
    userShotsTaken === cpuShotsTaken;

  const regularDoneWithWinner =
    regularDone && !state.isSuddenDeath && userScore !== cpuScore;

  if (regularDoneWithWinner || (suddenDeathPairDone && userScore !== cpuScore)) {
    next.phase = "finished";
    next.winner = getWinner(next);
  }

  return next;
}

export function nextActivePhase(state: Tanda90State): Tanda90State {
  if (state.phase === "finished") return state;
  const userShoots = isUserTurnToShoot(state);
  return {
    ...state,
    phase: userShoots ? "shoot" : "save",
    lastResult: null,
    pendingCpuCorner: userShoots ? null : cpuShooterChoice(),
    saveDeadline: userShoots ? null : Date.now() + 1500,
  };
}
