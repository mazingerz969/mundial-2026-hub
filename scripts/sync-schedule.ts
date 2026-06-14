/**
 * Sincroniza fechas REALES desde football-data.org → data/matches.json
 *
 * Uso:
 *   npm run sync-schedule
 *   npm run sync-schedule -- --dry-run
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

interface ApiResponse {
  matches?: ApiMatch[];
  message?: string;
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

async function fetchSchedule(token: string): Promise<ApiMatch[]> {
  const url = new URL("https://api.football-data.org/v4/competitions/WC/matches");
  url.searchParams.set("dateFrom", "2026-06-11");
  url.searchParams.set("dateTo", "2026-07-20");

  const response = await fetch(url.toString(), {
    headers: { "X-Auth-Token": token },
  });

  const body = (await response.json()) as ApiResponse;
  if (!response.ok) {
    throw new Error(body.message ?? `API respondió ${response.status}`);
  }

  return body.matches ?? [];
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const token = loadEnvKey();

  if (!token) {
    console.error("✗ Falta FOOTBALL_DATA_API_KEY en .env.local");
    process.exit(1);
  }

  console.log("Sincronizando calendario real (WC)...\n");

  const apiMatches = await fetchSchedule(token);
  const teams = loadTeams();
  const lookup = buildTeamIdLookup(teams);
  const matches = loadMatches() as Match[];

  let updated = 0;
  let unchanged = 0;
  let unmapped = 0;

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

    if (!homeId || !awayId) {
      unmapped++;
      continue;
    }

    const localId = findLocalMatchId(matches, homeId, awayId, utcDateKey(api.utcDate));
    if (!localId) {
      unmapped++;
      console.log(
        `⚠ Sin partido local: ${api.homeTeam.name} vs ${api.awayTeam.name} (${utcDateKey(api.utcDate)})`,
      );
      continue;
    }

    const local = matches.find((m) => m.id === localId)!;
    if (local.datetime === api.utcDate) {
      unchanged++;
      continue;
    }

    console.log(
      `✓ ${localId}: ${api.homeTeam.name} vs ${api.awayTeam.name} → ${local.datetime} → ${api.utcDate}`,
    );

    if (!dryRun) {
      local.datetime = api.utcDate;
      updated++;
    }
  }

  if (!dryRun && updated > 0) {
    writeFileSync(MATCHES_PATH, `${JSON.stringify(matches, null, 2)}\n`, "utf-8");
  }

  const byDate: Record<string, number> = {};
  for (const m of matches) {
    const d = m.datetime.slice(0, 10);
    byDate[d] = (byDate[d] || 0) + 1;
  }

  console.log(`
Resumen: ${updated} fechas actualizadas, ${unchanged} sin cambios, ${unmapped} sin emparejar
${dryRun ? "(dry-run — no se escribió matches.json)" : ""}

Distribución en matches.json:
${Object.entries(byDate)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([d, c]) => `  ${d}: ${c}`)
  .join("\n")}
`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
