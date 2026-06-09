export interface DailyCompletedEntry {
  challengeId: string;
  score: number;
  playerIds: string[];
}

export interface Reto11Storage {
  version: 1;
  dailyCompleted: Record<string, DailyCompletedEntry>;
  bestScores: Record<string, number>;
  totalGamesPlayed: number;
}

const STORAGE_KEY = "mundial2026_reto11";

export const DEFAULT_RETO11: Reto11Storage = {
  version: 1,
  dailyCompleted: {},
  bestScores: {},
  totalGamesPlayed: 0,
};

export function loadReto11Storage(): Reto11Storage {
  if (typeof window === "undefined") return { ...DEFAULT_RETO11 };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_RETO11 };
    const parsed = JSON.parse(raw) as Partial<Reto11Storage>;
    return { ...DEFAULT_RETO11, ...parsed, version: 1 };
  } catch {
    return { ...DEFAULT_RETO11 };
  }
}

export function saveReto11Storage(data: Reto11Storage): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export interface SaveGameResult {
  isNewBest: boolean;
  isDailyOfficial: boolean;
  previousBest: number | null;
}

export function saveGameResult(
  challengeId: string,
  score: number,
  playerIds: string[],
  options: {
    isDaily: boolean;
    dailyDateKey: string;
  },
): SaveGameResult {
  const storage = loadReto11Storage();
  const previousBest = storage.bestScores[challengeId] ?? null;
  let isNewBest = false;
  let isDailyOfficial = false;

  storage.totalGamesPlayed += 1;

  if (previousBest == null || score > previousBest) {
    storage.bestScores[challengeId] = score;
    isNewBest = true;
  }

  if (options.isDaily && !(options.dailyDateKey in storage.dailyCompleted)) {
    storage.dailyCompleted[options.dailyDateKey] = {
      challengeId,
      score,
      playerIds,
    };
    isDailyOfficial = true;
  }

  saveReto11Storage(storage);

  return { isNewBest, isDailyOfficial, previousBest };
}

export function getBestScore(challengeId: string): number | null {
  return loadReto11Storage().bestScores[challengeId] ?? null;
}

export function getReto11Stats() {
  const storage = loadReto11Storage();
  const bestOverall = Object.values(storage.bestScores);
  return {
    totalGamesPlayed: storage.totalGamesPlayed,
    bestOverall: bestOverall.length ? Math.max(...bestOverall) : null,
    challengeBests: storage.bestScores,
    dailyCompleted: storage.dailyCompleted,
  };
}
