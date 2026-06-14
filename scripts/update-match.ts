/**
 * Actualiza resultados en data/live-overrides.json sin tocar el calendario base.
 *
 * Ejemplos:
 *   npm run update-match -- match-group-a-01 2 1 finished
 *   npm run update-match -- match-group-a-02 --live 1 0
 *   npm run update-match -- match-r32-01 1 1 finished --penalties 4 3
 *   npm run update-match -- --mvp match-group-a-01 emiliano-martinez
 *   npm run update-match -- --scorer lionel-messi 3
 */
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

import { LiveOverridesSchema } from "../src/lib/data/live-types";
import { PlayersArraySchema } from "../src/lib/schemas";

const DATA_DIR = join(process.cwd(), "data");
const OVERRIDES_PATH = join(DATA_DIR, "live-overrides.json");

function loadOverrides() {
  const raw = readFileSync(OVERRIDES_PATH, "utf-8");
  return LiveOverridesSchema.parse(JSON.parse(raw));
}

function saveOverrides(data: ReturnType<typeof loadOverrides>) {
  writeFileSync(
    OVERRIDES_PATH,
    `${JSON.stringify(data, null, 2)}\n`,
    "utf-8",
  );
}

function usage() {
  console.log(`
Uso:
  npm run update-match -- <matchId> <home> <away> <status>
  npm run update-match -- <matchId> --live <home> <away>
  npm run update-match -- <matchId> <home> <away> finished --penalties <h> <a>
  npm run update-match -- --mvp <matchId> <playerId>
  npm run update-match -- --scorer <playerId> <goals>
  npm run update-match -- --phase group|round_of_32|round_of_16|quarter|semi|final

Status: scheduled | live | finished | postponed
`);
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    usage();
    process.exit(1);
  }

  const overrides = loadOverrides();
  overrides.matches ??= {};
  overrides.quinielaResults ??= {};
  overrides.quinielaResults.matchMvps ??= {};

  if (args[0] === "--mvp" && args.length >= 3) {
    const [, matchId, playerId] = args;
    overrides.quinielaResults.matchMvps![matchId!] = playerId!;
    console.log(`✓ MVP partido ${matchId}: ${playerId}`);
  } else if (args[0] === "--scorer" && args.length >= 3) {
    const [, playerId, goalsRaw] = args;
    const goals = Number.parseInt(goalsRaw!, 10);
    const players = PlayersArraySchema.parse(
      JSON.parse(readFileSync(join(DATA_DIR, "players.json"), "utf-8")),
    );
    if (!players.some((p) => p.id === playerId)) {
      console.error(`Jugador no encontrado: ${playerId}`);
      process.exit(1);
    }
    overrides.quinielaResults.topScorers ??= [];
    const existing = overrides.quinielaResults.topScorers.find(
      (e) => e.playerId === playerId,
    );
    if (existing) existing.goals = goals;
    else overrides.quinielaResults.topScorers.push({ playerId: playerId!, goals });
    overrides.quinielaResults.topScorers.sort((a, b) => b.goals - a.goals);
    console.log(`✓ Goleador ${playerId}: ${goals} goles`);
  } else if (args[0] === "--phase" && args.length >= 2) {
    overrides.tournament ??= {};
    overrides.tournament.currentPhase = args[1] as never;
    overrides.tournament.lastUpdated = new Date().toISOString().slice(0, 10);
    console.log(`✓ Fase torneo: ${args[1]}`);
  } else if (args.length >= 2) {
    const matchId = args[0]!;
    let home: number;
    let away: number;
    let status: string;

    if (args[1] === "--live" && args.length >= 4) {
      home = Number.parseInt(args[2]!, 10);
      away = Number.parseInt(args[3]!, 10);
      status = "live";
    } else if (args.length >= 4) {
      home = Number.parseInt(args[1]!, 10);
      away = Number.parseInt(args[2]!, 10);
      status = args[3]!;
    } else {
      usage();
      process.exit(1);
    }

    const patch: Record<string, unknown> = {
      status,
      score: { home, away },
    };

    const penIdx = args.indexOf("--penalties");
    if (penIdx !== -1 && args.length >= penIdx + 3) {
      patch.penaltyScore = {
        home: Number.parseInt(args[penIdx + 1]!, 10),
        away: Number.parseInt(args[penIdx + 2]!, 10),
      };
    }

    overrides.matches[matchId] = patch as never;
    console.log(`✓ ${matchId}: ${home}-${away} (${status})`);
  } else {
    usage();
    process.exit(1);
  }

  overrides.updatedAt = new Date().toISOString();
  saveOverrides(overrides);

  console.log("\nSiguiente paso:");
  console.log("  git add data/live-overrides.json && git commit -m 'update live results' && git push");
  console.log("  (La web se actualiza sola en ~1-2 min si LIVE_DATA_URL apunta al JSON en GitHub)");
}

main();
