import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import {
  WC_LIVE_CACHE_TAG,
  warmFootballDataLiveCache,
} from "@/lib/data/football-data-live";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;

  return request.headers.get("x-cron-secret") === secret;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.FOOTBALL_DATA_API_KEY) {
    return NextResponse.json(
      { error: "FOOTBALL_DATA_API_KEY not configured" },
      { status: 503 },
    );
  }

  revalidateTag(WC_LIVE_CACHE_TAG);
  const live = await warmFootballDataLiveCache();

  return NextResponse.json({
    ok: true,
    at: live?.fetchedAt ?? new Date().toISOString(),
    patches: live?.matchCount ?? 0,
  });
}
