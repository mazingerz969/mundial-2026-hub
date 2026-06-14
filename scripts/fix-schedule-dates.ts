/**
 * Corrige fechas del calendario:
 * 1. Sincroniza fechas reales desde football-data.org (emparejamientos que coinciden)
 * 2. Reparte el resto de fase de grupos en varios días (no 24 el mismo día)
 *
 * Uso: npm run fix-schedule
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

import type { Match } from "../src/lib/schemas";
import {
  buildTeamIdLookup,
  findLocalMatchId,
  loadMatches,
  loadTeams,
  resolveTeamId,
  utcDateKey,
} from "./lib/team-mapping";

const DATA_DIR = join(process.cwd(), "data");
const MATCHES_PATH = join(DATA_DIR, "matches.json");

const BUCKET_DATES = new Set(["2026-06-11", "2026-06-19", "2026-06-26"]);

const MD_WINDOWS: Record<number, string[]> = {
  1: ["2026-06-11", "2026-06-12", "2026-06-13", "2026-06-14", "2026-06-15", "2026-06-16"],
  2: ["2026-06-16", "2026-06-17", "2026-06-18", "2026-06-19", "2026-06-20", "2026-06-21"],
  3: ["2026-06-22", "2026-06-23", "2026-06-24", "2026-06-25", "2026-06-26", "2026-06-27"],
};

const KICKOFF_UTC = ["17:00:00Z", "20:00:00Z", "23:00:00Z", "02:00:00Z"];

interface ApiTeam {
  name?: string;
  shortName?: string;
  tla?: string;
}

interface ApiMatch {
  utcDate: string;
  homeTeam: ApiTeam;
  awayTeam: ApiTeam;
}

function loadEnvKey(): string {
  const envPaths = [join(process.cwd(), ".env.local"), join(process.cwd(), ".env")];
  for (const envPath of envPaths) {
    if (!existsSync(envPath)) continue;
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed.startsWith("FOOTBALL_DATA_API_KEY=")) {
        return trimmed.slice("FOOTBALL_DATA_API_KEY=".length).replace(/^["']|["']$/g, "");
      }
    }
  }
  return process.env.FOOTBALL_DATA_API_KEY ?? "";
}

function dateKey(iso: string): string {
  return iso.slice(0, 10);
}

function isBucketDate(iso: string): boolean {
  return BUCKET_DATES.has(dateKey(iso));
}

async function fetchApiMatches(token: string): Promise<ApiMatch[]> {
  const url = new URL("https://api.football-data.org/v4/competitions/WC/matches");
  url.searchParams.set("dateFrom", "2026-06-11");
  url.searchParams.set("dateTo", "2026-07-20");

  const response = await fetch(url.toString(), {
    headers: { "X-Auth-Token": token },
  });

  const body = (await response.json()) as { matches?: ApiMatch[]; message?: string };
  if (!response.ok) {
    throw new Error(body.message ?? `API ${response.status}`);
  }

  return body.matches ?? [];
}

function syncFromApi(
  matches: Match[],
  apiMatches: ApiMatch[],
  lookup: ReturnType<typeof buildTeamIdLookup>,
): number {
  let updated = 0;

  for (const api of apiMatches) {
    const homeId = resolveTeamId(lookup, [
      api.homeTeam.name ?? "",
      api.homeTeam.shortName ?? "",
      api.homeTeam.tla ?? "",
    ]);
    const awayId = resolveTeamId(lookup, [
      api.awayTeam.name ?? "",
      api.awayTeam.shortName ?? "",
      api.awayTeam.tla ?? "",
    ]);
    if (!homeId || !awayId) continue;

    const localId = findLocalMatchId(matches, homeId, awayId, utcDateKey(api.utcDate));
    if (!localId) continue;

    const local = matches.find((m) => m.id === localId)!;
    if (local.datetime === api.utcDate) continue;

    local.datetime = api.utcDate;
    updated++;
  }

  return updated;
}

function redistributeGroupBuckets(matches: Match[]): number {
  let updated = 0;

  for (const md of [1, 2, 3] as const) {
    const window = MD_WINDOWS[md]!;
    const bucket = matches.filter(
      (m) =>
        m.phase === "group" &&
        m.matchday === md &&
        isBucketDate(m.datetime),
    );

    bucket.sort((a, b) => a.id.localeCompare(b.id));

    bucket.forEach((match, idx) => {
      const day = window[idx % window.length]!;
      const time = KICKOFF_UTC[idx % KICKOFF_UTC.length]!;
      const next = `${day}T${time}`;
      if (match.datetime !== next) {
        match.datetime = next;
        updated++;
      }
    });
  }

  return updated;
}

function printDistribution(matches: Match[]) {
  const byDate: Record<string, number> = {};
  for (const m of matches) {
    const d = dateKey(m.datetime);
    byDate[d] = (byDate[d] || 0) + 1;
  }

  console.log("\nDistribución por día:");
  for (const [d, c] of Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b))) {
    console.log(`  ${d}: ${c}`);
  }
}

async function main() {
  const token = loadEnvKey();
  const matches = loadMatches() as Match[];
  const teams = loadTeams();
  const lookup = buildTeamIdLookup(teams);

  let apiUpdated = 0;
  if (token) {
    console.log("Paso 1: fechas reales desde football-data.org...");
    const apiMatches = await fetchApiMatches(token);
    apiUpdated = syncFromApi(matches, apiMatches, lookup);
    console.log(`  → ${apiUpdated} partidos actualizados desde API`);
  } else {
    console.log("Paso 1: omitido (sin FOOTBALL_DATA_API_KEY)");
  }

  console.log("\nPaso 2: repartir jornadas en varios días...");
  const spread = redistributeGroupBuckets(matches);
  console.log(`  → ${spread} partidos redistribuidos`);

  writeFileSync(MATCHES_PATH, `${JSON.stringify(matches, null, 2)}\n`, "utf-8");
  console.log(`\n✓ Guardado ${MATCHES_PATH}`);
  printDistribution(matches);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
