export interface Tanda90Storage {
  version: 1;
  wins: number;
  losses: number;
  bestStreak: number;
  currentStreak: number;
}

const STORAGE_KEY = "mundial2026_tanda90";

export const DEFAULT_TANDA90: Tanda90Storage = {
  version: 1,
  wins: 0,
  losses: 0,
  bestStreak: 0,
  currentStreak: 0,
};

export function loadTanda90Storage(): Tanda90Storage {
  if (typeof window === "undefined") return { ...DEFAULT_TANDA90 };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_TANDA90 };
    const parsed = JSON.parse(raw) as Partial<Tanda90Storage>;
    return { ...DEFAULT_TANDA90, ...parsed, version: 1 };
  } catch {
    return { ...DEFAULT_TANDA90 };
  }
}

export function saveTanda90Storage(data: Tanda90Storage): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function recordMatchResult(winner: "user" | "cpu" | "draw"): void {
  if (winner === "draw") return;

  const storage = loadTanda90Storage();

  if (winner === "user") {
    storage.wins += 1;
    storage.currentStreak += 1;
    if (storage.currentStreak > storage.bestStreak) {
      storage.bestStreak = storage.currentStreak;
    }
  } else {
    storage.losses += 1;
    storage.currentStreak = 0;
  }

  saveTanda90Storage(storage);
}

export function getTanda90Stats() {
  return loadTanda90Storage();
}
