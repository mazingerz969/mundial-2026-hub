import type { TriviaSessionResult } from "@/lib/games/trivia/types";

export interface TriviaStorage {
  version: 1;
  bestScore: number;
  bestCorrect: number;
  gamesPlayed: number;
  totalCorrect: number;
}

const STORAGE_KEY = "mundial2026_trivia";

export const DEFAULT_TRIVIA: TriviaStorage = {
  version: 1,
  bestScore: 0,
  bestCorrect: 0,
  gamesPlayed: 0,
  totalCorrect: 0,
};

export function loadTriviaStorage(): TriviaStorage {
  if (typeof window === "undefined") return { ...DEFAULT_TRIVIA };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_TRIVIA };
    const parsed = JSON.parse(raw) as Partial<TriviaStorage>;
    return { ...DEFAULT_TRIVIA, ...parsed, version: 1 };
  } catch {
    return { ...DEFAULT_TRIVIA };
  }
}

export function saveTriviaStorage(data: TriviaStorage): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function recordTriviaResult(result: TriviaSessionResult): {
  isNewBest: boolean;
} {
  const storage = loadTriviaStorage();
  storage.gamesPlayed += 1;
  storage.totalCorrect += result.correctCount;

  const isNewBest = result.score > storage.bestScore;
  if (isNewBest) {
    storage.bestScore = result.score;
  }
  if (result.correctCount > storage.bestCorrect) {
    storage.bestCorrect = result.correctCount;
  }

  saveTriviaStorage(storage);
  return { isNewBest };
}

export function getTriviaStats() {
  return loadTriviaStorage();
}
