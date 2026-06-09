export interface AppSettings {
  version: 1;
  favoriteTeamId: string | null;
  timezone: string;
  spoilerMode: boolean;
  theme: "dark" | "light";
}

const STORAGE_KEY = "mundial2026_settings";

export const DEFAULT_SETTINGS: AppSettings = {
  version: 1,
  favoriteTeamId: null,
  timezone:
    typeof Intl !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "America/Mexico_City",
  spoilerMode: true,
  theme: "dark",
};

export function loadSettings(): AppSettings {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };

    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      version: 1,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function detectTimezone(): string {
  if (typeof Intl === "undefined") return DEFAULT_SETTINGS.timezone;
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
