/**
 * Reemplaza teams.json, players.json y matches.json con datos REALES
 * de football-data.org (competición WC).
 *
 * Uso: npm run sync-from-api
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

import {
  MatchesArraySchema,
  PlayersArraySchema,
  TeamsArraySchema,
  TournamentSchema,
} from "../src/lib/schemas";
import type { Match, Player, Team } from "../src/lib/schemas";

const DATA_DIR = join(process.cwd(), "data");

const TLA_TO_ID: Record<string, string> = {
  ALG: "algeria",
  ARG: "argentina",
  AUS: "australia",
  AUT: "austria",
  BEL: "belgium",
  BIH: "bosnia",
  BRA: "brazil",
  CAN: "canada",
  CIV: "ivory-coast",
  COD: "congo-dr",
  COL: "colombia",
  CPV: "cape-verde",
  CRO: "croatia",
  CUW: "curacao",
  CZE: "czechia",
  ECU: "ecuador",
  EGY: "egypt",
  ENG: "england",
  ESP: "spain",
  FRA: "france",
  GER: "germany",
  GHA: "ghana",
  HAI: "haiti",
  IRN: "iran",
  IRQ: "iraq",
  JOR: "jordan",
  JPN: "japan",
  KOR: "south-korea",
  KSA: "saudi-arabia",
  MAR: "morocco",
  MEX: "mexico",
  NED: "netherlands",
  NOR: "norway",
  NZL: "new-zealand",
  PAN: "panama",
  PAR: "paraguay",
  POR: "portugal",
  QAT: "qatar",
  RSA: "south-africa",
  SCO: "scotland",
  SEN: "senegal",
  SUI: "switzerland",
  SWE: "sweden",
  TUN: "tunisia",
  TUR: "turkey",
  URY: "uruguay",
  USA: "usa",
  UZB: "uzbekistan",
};

const SPANISH_NAMES: Record<string, string> = {
  algeria: "Argelia",
  argentina: "Argentina",
  australia: "Australia",
  austria: "Austria",
  belgium: "Bélgica",
  bosnia: "Bosnia-Herzegovina",
  brazil: "Brasil",
  canada: "Canadá",
  "ivory-coast": "Costa de Marfil",
  "congo-dr": "Rep. Dem. del Congo",
  colombia: "Colombia",
  "cape-verde": "Cabo Verde",
  croatia: "Croacia",
  curacao: "Curazao",
  czechia: "Rep. Checa",
  ecuador: "Ecuador",
  egypt: "Egipto",
  england: "Inglaterra",
  spain: "España",
  france: "Francia",
  germany: "Alemania",
  ghana: "Ghana",
  haiti: "Haití",
  iran: "Irán",
  iraq: "Irak",
  jordan: "Jordania",
  japan: "Japón",
  "south-korea": "Corea del Sur",
  "saudi-arabia": "Arabia Saudita",
  morocco: "Marruecos",
  mexico: "México",
  netherlands: "Países Bajos",
  norway: "Noruega",
  "new-zealand": "Nueva Zelanda",
  panama: "Panamá",
  paraguay: "Paraguay",
  portugal: "Portugal",
  qatar: "Catar",
  "south-africa": "Sudáfrica",
  scotland: "Escocia",
  senegal: "Senegal",
  switzerland: "Suiza",
  sweden: "Suecia",
  tunisia: "Túnez",
  turkey: "Turquía",
  uruguay: "Uruguay",
  usa: "Estados Unidos",
  uzbekistan: "Uzbekistán",
};

const FLAG_BY_TLA: Record<string, string> = {
  ALG: "dz",
  ARG: "ar",
  AUS: "au",
  AUT: "at",
  BEL: "be",
  BIH: "ba",
  BRA: "br",
  CAN: "ca",
  CIV: "ci",
  COD: "cd",
  COL: "co",
  CPV: "cv",
  CRO: "hr",
  CUW: "cw",
  CZE: "cz",
  ECU: "ec",
  EGY: "eg",
  ENG: "gb",
  ESP: "es",
  FRA: "fr",
  GER: "de",
  GHA: "gh",
  HAI: "ht",
  IRN: "ir",
  IRQ: "iq",
  JOR: "jo",
  JPN: "jp",
  KOR: "kr",
  KSA: "sa",
  MAR: "ma",
  MEX: "mx",
  NED: "nl",
  NOR: "no",
  NZL: "nz",
  PAN: "pa",
  PAR: "py",
  POR: "pt",
  QAT: "qa",
  RSA: "za",
  SCO: "sc",
  SEN: "sn",
  SUI: "ch",
  SWE: "se",
  TUN: "tn",
  TUR: "tr",
  URY: "uy",
  USA: "us",
  UZB: "uz",
};

const CONFED_BY_AREA: Record<string, Team["confederation"]> = {
  ESP: "UEFA",
  GER: "UEFA",
  FRA: "UEFA",
  ENG: "UEFA",
  POR: "UEFA",
  NED: "UEFA",
  BEL: "UEFA",
  CRO: "UEFA",
  SUI: "UEFA",
  AUT: "UEFA",
  SCO: "UEFA",
  NOR: "UEFA",
  SWE: "UEFA",
  CZE: "UEFA",
  BIH: "UEFA",
  TUR: "UEFA",
  ARG: "CONMEBOL",
  BRA: "CONMEBOL",
  URY: "CONMEBOL",
  COL: "CONMEBOL",
  ECU: "CONMEBOL",
  PAR: "CONMEBOL",
  MEX: "CONCACAF",
  USA: "CONCACAF",
  CAN: "CONCACAF",
  PAN: "CONCACAF",
  HAI: "CONCACAF",
  CUW: "CONCACAF",
  MAR: "CAF",
  SEN: "CAF",
  GHA: "CAF",
  CIV: "CAF",
  RSA: "CAF",
  EGY: "CAF",
  TUN: "CAF",
  ALG: "CAF",
  CPV: "CAF",
  COD: "CAF",
  JPN: "AFC",
  KOR: "AFC",
  IRN: "AFC",
  KSA: "AFC",
  QAT: "AFC",
  AUS: "AFC",
  JOR: "AFC",
  UZB: "AFC",
  IRQ: "AFC",
  NZL: "OFC",
};

const VENUE_IDS = [
  "estadio-azteca",
  "akron",
  "bbva-monterrey",
  "metlife-stadium",
  "sofi-stadium",
  "att-stadium",
  "mercedes-benz-atlanta",
  "hard-rock-miami",
  "lumen-field",
  "levis-stadium",
  "lincoln-financial",
  "bmo-field",
  "bc-place",
];

interface ApiSquadPlayer {
  id: number;
  name: string;
  position: string;
  dateOfBirth?: string;
  nationality?: string;
  shirtNumber?: number | null;
  marketValue?: number | null;
}

interface ApiTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  coach?: { name?: string };
  squad?: ApiSquadPlayer[];
  area?: { name?: string };
}

interface ApiMatch {
  id: number;
  utcDate: string;
  status: string;
  matchday: number | null;
  stage: string;
  group: string | null;
  homeTeam: { id: number; tla: string; name: string };
  awayTeam: { id: number; tla: string; name: string };
  score: {
    fullTime: { home: number | null; away: number | null };
    penalty?: { home: number | null; away: number | null };
  };
}

function loadEnvKey(): string {
  const envPaths = [join(process.cwd(), ".env.local"), join(process.cwd(), ".env")];
  for (const envPath of envPaths) {
    if (!existsSync(envPath)) continue;
    for (const line of readFileSync(envPath, "utf-8").split("\n")) {
      const trimmed = line.trim();
      if (trimmed.startsWith("FOOTBALL_DATA_API_KEY=")) {
        return trimmed.slice("FOOTBALL_DATA_API_KEY=".length).replace(/^["']|["']$/g, "");
      }
    }
  }
  return process.env.FOOTBALL_DATA_API_KEY ?? "";
}

function loadLegacyTeams(): Team[] {
  try {
    return JSON.parse(readFileSync(join(DATA_DIR, "teams.json"), "utf-8")) as Team[];
  } catch {
    return [];
  }
}

async function apiGet<T>(path: string, token: string): Promise<T> {
  const response = await fetch(`https://api.football-data.org/v4${path}`, {
    headers: { "X-Auth-Token": token },
  });
  const body = (await response.json()) as T & { message?: string };
  if (!response.ok) {
    throw new Error(body.message ?? `API ${response.status} en ${path}`);
  }
  return body;
}

function mapPosition(apiPos: string): Player["position"] {
  const p = apiPos.toLowerCase();
  if (p.includes("goal")) return "GK";
  if (p.includes("def") || p.includes("back")) return "DF";
  if (
    p.includes("off") ||
    p.includes("forward") ||
    p.includes("wing") ||
    p.includes("striker")
  ) {
    return "FW";
  }
  return "MF";
}

function mapDetailedPosition(apiPos: string): string | undefined {
  if (["Goalkeeper", "Defence", "Midfield", "Offence"].includes(apiPos)) {
    return undefined;
  }
  return apiPos;
}

function mapPhase(stage: string): Match["phase"] {
  switch (stage) {
    case "GROUP_STAGE":
      return "group";
    case "LAST_32":
      return "round_of_32";
    case "LAST_16":
      return "round_of_16";
    case "QUARTER_FINALS":
      return "quarter";
    case "SEMI_FINALS":
      return "semi";
    case "THIRD_PLACE":
      return "third_place";
    case "FINAL":
      return "final";
    default:
      return "group";
  }
}

function mapStatus(status: string): Match["status"] {
  switch (status) {
    case "FINISHED":
      return "finished";
    case "IN_PLAY":
    case "PAUSED":
      return "live";
    case "POSTPONED":
    case "CANCELLED":
      return "postponed";
    default:
      return "scheduled";
  }
}

function ageFromBirthDate(birthDate?: string): number | undefined {
  if (!birthDate) return undefined;
  const born = new Date(birthDate);
  const ref = new Date("2026-06-11");
  let age = ref.getFullYear() - born.getFullYear();
  const m = ref.getMonth() - born.getMonth();
  if (m < 0 || (m === 0 && ref.getDate() < born.getDate())) age--;
  return age;
}

function extractGroup(group: string | null): string | undefined {
  if (!group) return undefined;
  const m = group.match(/GROUP_([A-L])/);
  return m?.[1];
}

async function main() {
  const token = loadEnvKey();
  if (!token) {
    console.error("✗ Falta FOOTBALL_DATA_API_KEY en .env.local");
    process.exit(1);
  }

  console.log("Descargando datos reales del Mundial (football-data.org)...\n");

  const legacy = loadLegacyTeams();
  const legacyByTla = new Map(
    legacy.map((t) => [t.shortName.toUpperCase(), t]),
  );

  const { teams: apiTeams } = await apiGet<{ teams: ApiTeam[] }>(
    "/competitions/WC/teams",
    token,
  );
  const { matches: apiMatches } = await apiGet<{ matches: ApiMatch[] }>(
    "/competitions/WC/matches?dateFrom=2026-06-11&dateTo=2026-07-20",
    token,
  );
  const competition = await apiGet<{
    name: string;
    currentSeason?: { startDate: string; endDate: string; currentMatchday?: number };
  }>("/competitions/WC", token);

  const apiIdToLocal = new Map<number, string>();
  const groupByApiTeamId = new Map<number, string>();

  for (const m of apiMatches) {
    if (m.stage !== "GROUP_STAGE" || !m.group) continue;
    const g = extractGroup(m.group);
    if (!g) continue;
    groupByApiTeamId.set(m.homeTeam.id, g);
    groupByApiTeamId.set(m.awayTeam.id, g);
  }

  const teams: Team[] = [];
  const players: Player[] = [];
  const placeholderTeams = new Map<string, Team>();

  function ensurePlaceholder(apiMatchId: number, side: "h" | "a"): string {
    const id = `tbd-${apiMatchId}-${side}`;
    if (!placeholderTeams.has(id)) {
      const group = "ABCDEFGHIJKL"[placeholderTeams.size % 12]!;
      placeholderTeams.set(id, {
        id,
        name: "Por definir",
        shortName: "TBD",
        group,
        fifaRanking: 99,
        coach: "—",
        confederation: "UEFA",
        flagCode: "un",
      });
    }
    return id;
  }

  for (const api of apiTeams) {
    const tla = api.tla.toUpperCase();
    const id = TLA_TO_ID[tla];
    if (!id) {
      throw new Error(`TLA sin mapear: ${tla} (${api.name})`);
    }

    apiIdToLocal.set(api.id, id);
    const legacyTeam = legacyByTla.get(tla);
    const group = groupByApiTeamId.get(api.id);
    if (!group) {
      throw new Error(`Grupo no encontrado para ${api.name} (${tla})`);
    }

    teams.push({
      id,
      name: SPANISH_NAMES[id] ?? api.name,
      shortName: tla.length === 3 ? tla : (legacyTeam?.shortName ?? tla.slice(0, 3)),
      group,
      fifaRanking: legacyTeam?.fifaRanking ?? 50,
      coach: api.coach?.name ?? legacyTeam?.coach ?? "—",
      confederation: CONFED_BY_AREA[tla] ?? legacyTeam?.confederation ?? "UEFA",
      flagCode: FLAG_BY_TLA[tla] ?? legacyTeam?.flagCode ?? "un",
      primaryColor: legacyTeam?.primaryColor,
      secondaryColor: legacyTeam?.secondaryColor,
    });

    for (const p of api.squad ?? []) {
      players.push({
        id: `fd-${p.id}`,
        name: p.name,
        teamId: id,
        position: mapPosition(p.position),
        detailedPosition: mapDetailedPosition(p.position),
        number: p.shirtNumber ?? undefined,
        birthDate: p.dateOfBirth?.slice(0, 10),
        age: ageFromBirthDate(p.dateOfBirth),
        nationality: p.nationality ?? undefined,
        marketValueEuros: p.marketValue ?? undefined,
      });
    }
  }

  const matches: Match[] = apiMatches
    .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime())
    .map((m, idx) => {
      const homeTeamId = m.homeTeam?.tla
        ? TLA_TO_ID[m.homeTeam.tla]
        : ensurePlaceholder(m.id, "h");
      const awayTeamId = m.awayTeam?.tla
        ? TLA_TO_ID[m.awayTeam.tla]
        : ensurePlaceholder(m.id, "a");

      if (!homeTeamId || !awayTeamId) {
        throw new Error(
          `Partido sin equipos mapeados: ${m.homeTeam?.name ?? "TBD"} vs ${m.awayTeam?.name ?? "TBD"}`,
        );
      }

      const status = mapStatus(m.status);
      const home = m.score.fullTime.home;
      const away = m.score.fullTime.away;
      const penHome = m.score.penalty?.home;
      const penAway = m.score.penalty?.away;

      return {
        id: `fd-${m.id}`,
        phase: mapPhase(m.stage),
        group: extractGroup(m.group),
        matchday: m.matchday ?? undefined,
        homeTeamId,
        awayTeamId,
        datetime: m.utcDate,
        venueId: VENUE_IDS[idx % VENUE_IDS.length]!,
        status,
        score:
          home != null && away != null ? { home, away } : null,
        penaltyScore:
          penHome != null && penAway != null
            ? { home: penHome, away: penAway }
            : null,
      };
    });

  teams.push(...placeholderTeams.values());
  teams.sort((a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name));

  const season = competition.currentSeason;
  const tournament = {
    id: "fifa-world-cup-2026",
    name: competition.name ?? "FIFA World Cup 2026",
    shortName: "Mundial 2026",
    hostCountries: ["Estados Unidos", "Canadá", "México"],
    startDate: season?.startDate ?? "2026-06-11",
    endDate: season?.endDate ?? "2026-07-19",
    teamCount: 48,
    timezoneDefault: "America/Mexico_City",
    currentPhase: "group" as const,
    dataVersion: 3,
    lastUpdated: new Date().toISOString().slice(0, 10),
  };

  TeamsArraySchema.parse(teams);
  PlayersArraySchema.parse(players);
  MatchesArraySchema.parse(matches);
  TournamentSchema.parse(tournament);

  writeFileSync(join(DATA_DIR, "teams.json"), `${JSON.stringify(teams, null, 2)}\n`);
  writeFileSync(join(DATA_DIR, "players.json"), `${JSON.stringify(players, null, 2)}\n`);
  writeFileSync(join(DATA_DIR, "matches.json"), `${JSON.stringify(matches, null, 2)}\n`);
  writeFileSync(join(DATA_DIR, "tournament.json"), `${JSON.stringify(tournament, null, 2)}\n`);

  writeFileSync(
    join(DATA_DIR, "live-overrides.json"),
    `${JSON.stringify(
      {
        updatedAt: new Date().toISOString(),
        tournament: { lastUpdated: tournament.lastUpdated },
        matches: {},
        quinielaResults: { topScorers: [], tournamentMvp: null, matchMvps: {} },
      },
      null,
      2,
    )}\n`,
  );

  writeFileSync(
    join(DATA_DIR, "quiniela-results.json"),
    `${JSON.stringify(
      { topScorers: [], tournamentMvp: null, matchMvps: {} },
      null,
      2,
    )}\n`,
  );

  console.log(`✓ ${teams.length} equipos`);
  console.log(`✓ ${players.length} jugadores (plantillas API)`);
  console.log(`✓ ${matches.length} partidos con fechas y resultados reales`);
  console.log(`✓ live-overrides.json reseteado (datos en matches.json)`);

  const spain = matches.find(
    (m) =>
      (m.homeTeamId === "spain" && m.awayTeamId === "cape-verde") ||
      (m.homeTeamId === "cape-verde" && m.awayTeamId === "spain"),
  );
  if (spain) {
    console.log(`\nEspaña vs Cabo Verde: ${spain.datetime} (${spain.id})`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
