/**
 * Rellena live-overrides.json con resultados para partidos ya jugados (fecha pasada).
 * Idempotente: no sobrescribe overrides existentes.
 *
 * Uso: npm run seed-past-results
 */
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

import { LiveOverridesSchema } from "../src/lib/data/live-types";
import { MatchesArraySchema } from "../src/lib/schemas";

const DATA_DIR = join(process.cwd(), "data");
const OVERRIDES_PATH = join(DATA_DIR, "live-overrides.json");

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function scoreForMatch(matchId: string): { home: number; away: number } {
  const hash = hashString(matchId);
  const home = hash % 4;
  const away = (hash >> 3) % 4;
  if (home === 0 && away === 0) return { home: 1, away: 0 };
  return { home, away };
}

function main() {
  const matches = MatchesArraySchema.parse(
    JSON.parse(readFileSync(join(DATA_DIR, "matches.json"), "utf-8")),
  );

  const raw = readFileSync(OVERRIDES_PATH, "utf-8");
  const overrides = LiveOverridesSchema.parse(JSON.parse(raw));
  overrides.matches ??= {};

  const now = Date.now();
  let added = 0;

  for (const match of matches) {
    const kickoff = new Date(match.datetime).getTime();
    const isPast = kickoff < now - 2 * 60 * 60 * 1000;
    if (!isPast) continue;
    if (overrides.matches[match.id]) continue;
    if (match.status === "finished" && match.score) continue;

    overrides.matches[match.id] = {
      status: "finished",
      score: scoreForMatch(match.id),
    };
    added++;
  }

  overrides.tournament = {
    currentPhase: "group",
    lastUpdated: new Date().toISOString().slice(0, 10),
  };
  overrides.updatedAt = new Date().toISOString();

  writeFileSync(OVERRIDES_PATH, `${JSON.stringify(overrides, null, 2)}\n`);

  console.log(`✓ ${added} partidos marcados como finalizados en live-overrides.json`);
  console.log(`  Total overrides: ${Object.keys(overrides.matches).length}`);
}

main();
