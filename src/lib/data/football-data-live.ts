import { unstable_cache } from "next/cache";

import type { MatchOverride } from "@/lib/data/live-types";
import type { Match } from "@/lib/schemas";

export const WC_LIVE_CACHE_TAG = "wc-live";

type ApiStatus =
  | "SCHEDULED"
  | "TIMED"
  | "IN_PLAY"
  | "PAUSED"
  | "FINISHED"
  | "POSTPONED"
  | "CANCELLED"
  | "SUSPENDED"
  | "AWARDED";

interface ApiMatch {
  id: number;
  utcDate: string;
  status: ApiStatus;
  minute?: number | null;
  score: {
    fullTime: { home: number | null; away: number | null };
    halfTime?: { home: number | null; away: number | null };
    penalty?: { home: number | null; away: number | null };
  };
}

interface ApiResponse {
  matches?: ApiMatch[];
  message?: string;
}

export type ApiLivePatch = MatchOverride & {
  minute?: number;
};

export type FootballDataLiveResult = {
  patches: Record<string, ApiLivePatch>;
  fetchedAt: string;
  matchCount: number;
};

function mapStatus(status: ApiStatus): Match["status"] | null {
  switch (status) {
    case "FINISHED":
    case "AWARDED":
      return "finished";
    case "IN_PLAY":
    case "PAUSED":
      return "live";
    case "SCHEDULED":
    case "TIMED":
      return "scheduled";
    case "POSTPONED":
    case "CANCELLED":
    case "SUSPENDED":
      return "postponed";
    default:
      return null;
  }
}

function dateOffset(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

async function fetchFootballDataLive(): Promise<FootballDataLiveResult | null> {
  const token = process.env.FOOTBALL_DATA_API_KEY;
  if (!token) return null;

  const dateFrom = process.env.WC_LIVE_DATE_FROM ?? "2026-06-11";
  const dateTo = process.env.WC_LIVE_DATE_TO ?? dateOffset(2);

  const url = new URL(
    "https://api.football-data.org/v4/competitions/WC/matches",
  );
  url.searchParams.set("dateFrom", dateFrom);
  url.searchParams.set("dateTo", dateTo);

  const response = await fetch(url.toString(), {
    headers: { "X-Auth-Token": token },
    next: { revalidate: 60, tags: [WC_LIVE_CACHE_TAG] },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiResponse;
    console.error(
      "[football-data-live]",
      response.status,
      body.message ?? "fetch failed",
    );
    return null;
  }

  const body = (await response.json()) as ApiResponse;
  const patches: Record<string, ApiLivePatch> = {};

  for (const api of body.matches ?? []) {
    const localId = `fd-${api.id}`;
    const status = mapStatus(api.status);
    if (!status) continue;

    const home = api.score.fullTime.home;
    const away = api.score.fullTime.away;
    const penHome = api.score.penalty?.home;
    const penAway = api.score.penalty?.away;

    const patch: ApiLivePatch = {
      status,
      datetime: api.utcDate,
    };

    if (status === "live") {
      patch.score = { home: home ?? 0, away: away ?? 0 };
      if (api.minute != null) patch.minute = api.minute;
    } else if (status === "finished" && home != null && away != null) {
      patch.score = { home, away };
    } else if (status === "scheduled") {
      continue;
    }

    if (penHome != null && penAway != null) {
      patch.penaltyScore = { home: penHome, away: penAway };
    }

    patches[localId] = patch;
  }

  return {
    patches,
    fetchedAt: new Date().toISOString(),
    matchCount: Object.keys(patches).length,
  };
}

export const getCachedFootballDataLive = unstable_cache(
  fetchFootballDataLive,
  ["football-data-wc-live-v1"],
  { revalidate: 60, tags: [WC_LIVE_CACHE_TAG] },
);

export async function warmFootballDataLiveCache(): Promise<FootballDataLiveResult | null> {
  return fetchFootballDataLive();
}
