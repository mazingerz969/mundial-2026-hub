"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AppSettings,
  DEFAULT_SETTINGS,
  detectTimezone,
  loadSettings,
  saveSettings,
} from "@/lib/storage/settings";

interface SettingsContextValue {
  settings: AppSettings;
  hydrated: boolean;
  setFavoriteTeamId: (teamId: string | null) => void;
  setTimezone: (timezone: string) => void;
  setSpoilerMode: (enabled: boolean) => void;
  setTheme: (theme: AppSettings["theme"]) => void;
  updateSettings: (partial: Partial<AppSettings>) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const loaded = loadSettings();
    if (!localStorage.getItem("mundial2026_settings")) {
      loaded.timezone = detectTimezone();
    }
    setSettings(loaded);
    setHydrated(true);
  }, []);

  const updateSettings = useCallback((partial: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next: AppSettings = { ...prev, ...partial, version: 1 };
      saveSettings(next);
      return next;
    });
  }, []);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      hydrated,
      setFavoriteTeamId: (favoriteTeamId) => updateSettings({ favoriteTeamId }),
      setTimezone: (timezone) => updateSettings({ timezone }),
      setSpoilerMode: (spoilerMode) => updateSettings({ spoilerMode }),
      setTheme: (theme) => updateSettings({ theme }),
      updateSettings,
    }),
    [settings, hydrated, updateSettings],
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings debe usarse dentro de SettingsProvider");
  }
  return context;
}
