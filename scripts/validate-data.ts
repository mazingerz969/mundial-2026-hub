import { readFileSync } from "fs";
import { join } from "path";

import {
  ChallengesArraySchema,
  MatchesArraySchema,
  PlayersArraySchema,
  TeamsArraySchema,
  TournamentSchema,
  VenuesArraySchema,
} from "../src/lib/schemas";

const DATA_DIR = join(process.cwd(), "data");

function loadJson<T>(filename: string): T {
  const raw = readFileSync(join(DATA_DIR, filename), "utf-8");
  return JSON.parse(raw) as T;
}

function assertUniqueIds(ids: string[], label: string, errors: string[]): void {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) {
      errors.push(`ID duplicado en ${label}: "${id}"`);
    }
    seen.add(id);
  }
}

function main(): void {
  const errors: string[] = [];
  const warnings: string[] = [];

  console.log("Validando datos del Mundial 2026...\n");

  const tournament = TournamentSchema.parse(loadJson("tournament.json"));
  const teams = TeamsArraySchema.parse(loadJson("teams.json"));
  const players = PlayersArraySchema.parse(loadJson("players.json"));
  const venues = VenuesArraySchema.parse(loadJson("venues.json"));
  const matches = MatchesArraySchema.parse(loadJson("matches.json"));
  const challenges = ChallengesArraySchema.parse(loadJson("challenges.json"));

  console.log("✓ Esquemas Zod válidos");

  assertUniqueIds(
    teams.map((t) => t.id),
    "teams.json",
    errors,
  );
  assertUniqueIds(
    players.map((p) => p.id),
    "players.json",
    errors,
  );
  assertUniqueIds(
    matches.map((m) => m.id),
    "matches.json",
    errors,
  );
  assertUniqueIds(
    venues.map((v) => v.id),
    "venues.json",
    errors,
  );
  assertUniqueIds(
    challenges.map((c) => c.id),
    "challenges.json",
    errors,
  );

  const teamIds = new Set(teams.map((t) => t.id));
  const venueIds = new Set(venues.map((v) => v.id));

  for (const player of players) {
    if (!teamIds.has(player.teamId)) {
      errors.push(
        `Jugador "${player.id}": teamId "${player.teamId}" no existe en teams.json`,
      );
    }
  }

  for (const match of matches) {
    if (!teamIds.has(match.homeTeamId)) {
      errors.push(
        `Partido "${match.id}": homeTeamId "${match.homeTeamId}" no existe`,
      );
    }
    if (!teamIds.has(match.awayTeamId)) {
      errors.push(
        `Partido "${match.id}": awayTeamId "${match.awayTeamId}" no existe`,
      );
    }
    if (!venueIds.has(match.venueId)) {
      errors.push(`Partido "${match.id}": venueId "${match.venueId}" no existe`);
    }
    if (match.homeTeamId === match.awayTeamId) {
      errors.push(`Partido "${match.id}": un equipo no puede jugar contra sí mismo`);
    }
  }

  if (matches.length !== 104) {
    warnings.push(`matches.json tiene ${matches.length} partidos (esperado 104)`);
  }

  const groupCounts = new Map<string, number>();
  for (const team of teams) {
    if (team.id.startsWith("tbd-")) continue;
    groupCounts.set(team.group, (groupCounts.get(team.group) ?? 0) + 1);
  }
  for (const [group, count] of groupCounts) {
    if (count !== 4) {
      warnings.push(`Grupo ${group}: ${count} equipos (esperado 4)`);
    }
  }

  if (teams.length !== tournament.teamCount) {
    warnings.push(
      `teams.json tiene ${teams.length} equipos; tournament.teamCount es ${tournament.teamCount}`,
    );
  }

  const playersByTeamCount = new Map<string, number>();
  for (const player of players) {
    playersByTeamCount.set(
      player.teamId,
      (playersByTeamCount.get(player.teamId) ?? 0) + 1,
    );
  }
  let teamsUnder26 = 0;
  for (const team of teams) {
    if (team.id.startsWith("tbd-")) continue;
    const count = playersByTeamCount.get(team.id) ?? 0;
    if (count < 11) {
      errors.push(`Equipo "${team.name}": solo ${count} jugadores (mínimo 11)`);
    } else if (count < 26) {
      teamsUnder26++;
    }
  }
  if (teamsUnder26 > 0) {
    warnings.push(`${teamsUnder26} equipos con menos de 26 jugadores`);
  }

  const tournamentStart = new Date(`${tournament.startDate}T00:00:00Z`);
  const tournamentEnd = new Date(`${tournament.endDate}T23:59:59Z`);
  for (const match of matches) {
    const matchDate = new Date(match.datetime);
    if (matchDate < tournamentStart || matchDate > tournamentEnd) {
      warnings.push(
        `Partido "${match.id}": fecha fuera del rango del torneo`,
      );
    }
  }

  console.log(`\nResumen:`);
  console.log(`  Equipos:    ${teams.length}`);
  console.log(`  Jugadores:  ${players.length}`);
  console.log(`  Partidos:   ${matches.length}`);
  console.log(`  Sedes:      ${venues.length}`);
  console.log(`  Retos:      ${challenges.length}`);

  if (warnings.length > 0) {
    console.log(`\n⚠ Advertencias (${warnings.length}):`);
    warnings.forEach((w) => console.log(`  - ${w}`));
  }

  if (errors.length > 0) {
    console.error(`\n✗ Errores (${errors.length}):`);
    errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }

  console.log("\n✓ Validación completada sin errores");
}

main();
