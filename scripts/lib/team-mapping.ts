import { readFileSync } from "fs";
import { join } from "path";

import type { Team } from "../src/lib/schemas";

const DATA_DIR = join(process.cwd(), "data");

/** Nombres alternativos que usan APIs / medios → id interno */
const API_ALIASES: Record<string, string> = {
  Mexico: "mexico",
  México: "mexico",
  "South Africa": "south-africa",
  "Korea Republic": "south-korea",
  "South Korea": "south-korea",
  Denmark: "denmark",
  Canada: "canada",
  Switzerland: "switzerland",
  Ukraine: "ukraine",
  Qatar: "qatar",
  Brazil: "brazil",
  Morocco: "morocco",
  Haiti: "haiti",
  Scotland: "scotland",
  "United States": "usa",
  USA: "usa",
  Australia: "australia",
  Paraguay: "paraguay",
  Austria: "austria",
  Germany: "germany",
  Curaçao: "curacao",
  Curacao: "curacao",
  "Côte d'Ivoire": "ivory-coast",
  "Ivory Coast": "ivory-coast",
  Ecuador: "ecuador",
  Netherlands: "netherlands",
  Japan: "japan",
  Tunisia: "tunisia",
  "Cape Verde": "cape-verde",
  "Cabo Verde": "cape-verde",
  Belgium: "belgium",
  Egypt: "egypt",
  Iran: "iran",
  "New Zealand": "new-zealand",
  Spain: "spain",
  "Saudi Arabia": "saudi-arabia",
  Jordan: "jordan",
  Uzbekistan: "uzbekistan",
  France: "france",
  Senegal: "senegal",
  Norway: "norway",
  Iceland: "iceland",
  Argentina: "argentina",
  Algeria: "algeria",
  Croatia: "croatia",
  Ghana: "ghana",
  England: "england",
  Panama: "panama",
  Gabon: "gabon",
  Jamaica: "jamaica",
  Portugal: "portugal",
  Colombia: "colombia",
  Iraq: "iraq",
  Oman: "oman",
};

function normalize(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

export function buildTeamIdLookup(teams: Team[]): Map<string, string> {
  const map = new Map<string, string>();

  for (const team of teams) {
    map.set(normalize(team.name), team.id);
    map.set(normalize(team.shortName), team.id);
    map.set(team.id, team.id);
  }

  for (const [alias, id] of Object.entries(API_ALIASES)) {
    map.set(normalize(alias), id);
  }

  return map;
}

export function resolveTeamId(
  lookup: Map<string, string>,
  names: string[],
): string | null {
  for (const name of names) {
    if (!name) continue;
    const id = lookup.get(normalize(name));
    if (id) return id;
  }
  return null;
}

export function loadTeams(): Team[] {
  return JSON.parse(
    readFileSync(join(DATA_DIR, "teams.json"), "utf-8"),
  ) as Team[];
}

export function loadMatches() {
  return JSON.parse(
    readFileSync(join(DATA_DIR, "matches.json"), "utf-8"),
  ) as Array<{
    id: string;
    homeTeamId: string;
    awayTeamId: string;
    datetime: string;
  }>;
}

export function utcDateKey(iso: string): string {
  return iso.slice(0, 10);
}

export function findLocalMatchId(
  localMatches: ReturnType<typeof loadMatches>,
  homeTeamId: string,
  awayTeamId: string,
  utcDate: string,
): string | null {
  const sameDay = localMatches.filter((m) => {
    const localDay = new Date(m.datetime).toISOString().slice(0, 10);
    return localDay === utcDate || m.datetime.startsWith(utcDate);
  });

  const direct = sameDay.find(
    (m) => m.homeTeamId === homeTeamId && m.awayTeamId === awayTeamId,
  );
  if (direct) return direct.id;

  const swapped = sameDay.find(
    (m) => m.homeTeamId === awayTeamId && m.awayTeamId === homeTeamId,
  );
  return swapped?.id ?? null;
}
