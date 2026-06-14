/**
 * Sincroniza resultados REALES desde football-data.org → live-overrides.json
 *
 * Requiere cuenta gratis: https://www.football-data.org/client/register
 * Añade el token a .env.local:
 *   FOOTBALL_DATA_API_KEY=tu_token
 *
 * Uso:
 *   npm run sync-results              # desde inicio torneo hasta hoy
 *   npm run sync-results -- --dry-run # solo muestra, no escribe
 *   npm run sync-results -- --from 2026-06-11 --to 2026-06-19
 *
 * NO usa IA — los LLM inventan marcadores. Solo fuentes verificables.
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

import { LiveOverridesSchema } from "../src/lib/data/live-types";
import { loadMatches } from "./lib/team-mapping";

const DATA_DIR = join(process.cwd(), "data");
const OVERRIDES_PATH = join(DATA_DIR, "live-overrides.json");

type ApiStatus = "SCHEDULED" | "TIMED" | "IN_PLAY" | "PAUSED" | "FINISHED" | "POSTPONED" | "CANCELLED";

interface ApiTeam {
  name?: string;
  shortName?: string;
  tla?: string;
}

interface ApiMatch {
  id: number;
  utcDate: string;
  status: ApiStatus;
  homeTeam: ApiTeam;
  awayTeam: ApiTeam;
  score: {
    fullTime: { home: number | null; away: number | null };
    penalty?: { home: number | null; away: number | null };
  };
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

function mapStatus(status: ApiStatus): "scheduled" | "live" | "finished" | "postponed" | null {
  switch (status) {
    case "FINISHED":
      return "finished";
    case "IN_PLAY":
    case "PAUSED":
      return "live";
    case "SCHEDULED":
    case "TIMED":
      return "scheduled";
    case "POSTPONED":
    case "CANCELLED":
      return "postponed";
    default:
      return null;
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  let dryRun = false;
  let from = "2026-06-11";
  let to = new Date().toISOString().slice(0, 10);

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--dry-run") dryRun = true;
    if (args[i] === "--from" && args[i + 1]) from = args[++i]!;
    if (args[i] === "--to" && args[i + 1]) to = args[++i]!;
  }

  return { dryRun, from, to };
}

async function fetchFootballData(
  token: string,
  from: string,
  to: string,
): Promise<ApiMatch[]> {
  const url = new URL("https://api.football-data.org/v4/competitions/WC/matches");
  url.searchParams.set("dateFrom", from);
  url.searchParams.set("dateTo", to);

  const response = await fetch(url.toString(), {
    headers: { "X-Auth-Token": token },
  });

  const body = (await response.json()) as ApiResponse;

  if (!response.ok) {
    throw new Error(
      body.message ??
        `football-data.org respondió ${response.status}. ¿Token válido?`,
    );
  }

  return body.matches ?? [];
}

function loadOverrides() {
  const raw = readFileSync(OVERRIDES_PATH, "utf-8");
  return LiveOverridesSchema.parse(JSON.parse(raw));
}

function saveOverrides(data: ReturnType<typeof loadOverrides>) {
  writeFileSync(OVERRIDES_PATH, `${JSON.stringify(data, null, 2)}\n`, "utf-8");
}

async function main() {
  const { dryRun, from, to } = parseArgs();
  const token = loadEnvKey();

  if (!token) {
    console.error(`
✗ Falta FOOTBALL_DATA_API_KEY

1. Regístrate gratis: https://www.football-data.org/client/register
2. Crea .env.local en la raíz del proyecto:

   FOOTBALL_DATA_API_KEY=tu_token_aqui

3. Vuelve a ejecutar: npm run sync-results

Nota: No usamos IA para marcadores — alucinan resultados falsos.
`);
    process.exit(1);
  }

  console.log(`Sincronizando Mundial (WC) ${from} → ${to}...\n`);

  let apiMatches: ApiMatch[];
  try {
    apiMatches = await fetchFootballData(token, from, to);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`✗ Error de red o API: ${msg}`);
    process.exit(1);
  }

  if (apiMatches.length === 0) {
    console.log("La API no devolvió partidos en ese rango.");
    console.log("Puede que aún no haya datos publicados para esas fechas.");
    process.exit(0);
  }

  const localMatches = loadMatches();
  const overrides = loadOverrides();
  overrides.matches ??= {};

  let updated = 0;
  let skipped = 0;
  let unmapped = 0;

  for (const api of apiMatches) {
    const localId = `fd-${api.id}`;
    const exists = localMatches.some((m) => m.id === localId);

    if (!exists) {
      unmapped++;
      console.log(
        `⚠ Sin partido en matches.json: ${api.homeTeam.name ?? "?"} vs ${api.awayTeam.name ?? "?"} (fd-${api.id})`,
      );
      continue;
    }

    const status = mapStatus(api.status);
    if (!status || status === "scheduled") {
      skipped++;
      continue;
    }

    const home = api.score.fullTime.home;
    const away = api.score.fullTime.away;

    if (status === "finished" && (home == null || away == null)) {
      skipped++;
      continue;
    }

    const patch: Record<string, unknown> = {
      status,
      datetime: api.utcDate,
    };

    if (home != null && away != null) {
      patch.score = { home, away };
    } else if (status === "live") {
      patch.score = { home: home ?? 0, away: away ?? 0 };
    }

    const penHome = api.score.penalty?.home;
    const penAway = api.score.penalty?.away;
    if (penHome != null && penAway != null) {
      patch.penaltyScore = { home: penHome, away: penAway };
    }

    const label = `${api.homeTeam.name} ${home ?? "?"}-${away ?? "?"} ${api.awayTeam.name}`;
    console.log(`✓ ${localId}: ${label} (${status})`);

    if (!dryRun) {
      overrides.matches[localId] = patch as never;
      updated++;
    }
  }

  if (!dryRun && updated > 0) {
    overrides.updatedAt = new Date().toISOString();
    overrides.tournament = {
      ...overrides.tournament,
      lastUpdated: new Date().toISOString().slice(0, 10),
    };
    saveOverrides(overrides);
  }

  console.log(`
Resumen: ${updated} actualizados, ${skipped} omitidos, ${unmapped} sin emparejar
${dryRun ? "(dry-run — no se escribió live-overrides.json)" : ""}

Siguiente paso:
  git add data/live-overrides.json && git commit -m "sync results from API" && git push
`);
}

main();
