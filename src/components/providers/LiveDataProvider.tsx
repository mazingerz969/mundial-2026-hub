"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  getEmbeddedSnapshot,
  type LiveSnapshot,
} from "@/lib/data/live";
import type { Match } from "@/lib/schemas";
import type { QuinielaResults } from "@/lib/games/quiniela/types";
import type { Tournament } from "@/lib/schemas";

const REFRESH_MS = 2 * 60 * 1000;

interface LiveDataContextValue extends LiveSnapshot {
  loading: boolean;
  refresh: () => Promise<void>;
}

const LiveDataContext = createContext<LiveDataContextValue | null>(null);

const initial = getEmbeddedSnapshot();

export function LiveDataProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<LiveSnapshot>(initial);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/live", { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as LiveSnapshot;
      setSnapshot(data);
    } catch {
      // Mantener último snapshot válido
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const value = useMemo<LiveDataContextValue>(
    () => ({
      ...snapshot,
      loading,
      refresh,
    }),
    [snapshot, loading, refresh],
  );

  return (
    <LiveDataContext.Provider value={value}>{children}</LiveDataContext.Provider>
  );
}

export function useLiveData(): LiveDataContextValue {
  const context = useContext(LiveDataContext);
  if (!context) {
    return {
      ...initial,
      loading: false,
      refresh: async () => {},
    };
  }
  return context;
}

export function useLiveMatches(): Match[] {
  return useLiveData().matches;
}

export function useLiveQuinielaResults(): QuinielaResults {
  return useLiveData().quinielaResults;
}

export function useLiveTournament(): Tournament {
  return useLiveData().tournament;
}
