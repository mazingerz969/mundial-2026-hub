/**
 * Genera plantillas completas (26 jugadores/equipo) y calendario de 104 partidos.
 * Preserva jugadores existentes en players.json.
 *
 * Uso: npm run generate-data
 */
import { writeFileSync, readFileSync } from "fs";
import { join } from "path";

import type { Team } from "../src/lib/schemas";

const DATA_DIR = join(process.cwd(), "data");
const TARGET_SQUAD = 26;

type Position = "GK" | "DF" | "MF" | "FW";

interface PlayerSeed {
  id: string;
  name: string;
  teamId: string;
  position: Position;
  detailedPosition?: string;
  number?: number;
  club?: string;
  age?: number;
  birthDate?: string;
  heightCm?: number;
  weightKg?: number;
  preferredFoot?: "left" | "right" | "both";
  nationality?: string;
  rating: number;
  isKeyPlayer?: boolean;
}

interface VenueSeed {
  id: string;
  timezone: string;
}

interface MatchSeed {
  id: string;
  phase: string;
  group?: string;
  matchday?: number;
  homeTeamId: string;
  awayTeamId: string;
  datetime: string;
  venueId: string;
  status: string;
  score: null;
}

const FIRST_NAMES = [
  "Carlos", "Diego", "Marco", "Luis", "André", "Pierre", "Kwame", "Yuki",
  "Omar", "Ivan", "Felipe", "Hassan", "Jon", "Mateo", "Serge", "Antoine",
  "Pedro", "Lucas", "Thomas", "James", "Giorgio", "Nikola", "Victor", "Emir",
];

const LAST_NAMES = [
  "García", "Silva", "Santos", "Lopez", "Müller", "Diallo", "Tanaka", "Al-Farsi",
  "Petrov", "Costa", "Nielsen", "Okonkwo", "Smith", "Rossi", "Kim", "Hernández",
  "Martínez", "Fernández", "Schmidt", "Brown", "Wilson", "Popov", "Sato", "Ali",
];

/** Jugadores reales adicionales por selección (complemento al seed manual) */
const EXTRA_STARS: Record<string, Omit<PlayerSeed, "id" | "teamId">[]> = {
  "south-korea": [
    { name: "Son Heung-min", position: "FW", number: 7, club: "Tottenham", age: 34, rating: 87, isKeyPlayer: true },
    { name: "Kim Min-jae", position: "DF", number: 4, club: "Bayern Munich", age: 29, rating: 85 },
    { name: "Lee Kang-in", position: "MF", number: 18, club: "PSG", age: 24, rating: 82 },
  ],
  denmark: [
    { name: "Christian Eriksen", position: "MF", number: 10, club: "Man United", age: 34, rating: 84, isKeyPlayer: true },
    { name: "Rasmus Højlund", position: "FW", number: 9, club: "Man United", age: 23, rating: 82 },
  ],
  canada: [
    { name: "Alphonso Davies", position: "DF", number: 2, club: "Bayern Munich", age: 25, rating: 84, isKeyPlayer: true },
    { name: "Jonathan David", position: "FW", number: 10, club: "Lille", age: 26, rating: 82 },
  ],
  morocco: [
    { name: "Achraf Hakimi", position: "DF", number: 2, club: "PSG", age: 27, rating: 86, isKeyPlayer: true },
    { name: "Youssef En-Nesyri", position: "FW", number: 19, club: "Sevilla", age: 28, rating: 81 },
  ],
  belgium: [
    { name: "Kevin De Bruyne", position: "MF", number: 7, club: "Man City", age: 35, rating: 90, isKeyPlayer: true },
    { name: "Romelu Lukaku", position: "FW", number: 9, club: "Roma", age: 32, rating: 84 },
  ],
  japan: [
    { name: "Kaoru Mitoma", position: "FW", number: 7, club: "Brighton", age: 29, rating: 83, isKeyPlayer: true },
    { name: "Takefusa Kubo", position: "MF", number: 20, club: "Real Sociedad", age: 24, rating: 81 },
  ],
  portugal: [
    { name: "Bernardo Silva", position: "MF", number: 10, club: "Man City", age: 31, rating: 88 },
    { name: "Bruno Fernandes", position: "MF", number: 8, club: "Man United", age: 31, rating: 87 },
    { name: "Diogo Costa", position: "GK", number: 1, club: "Porto", age: 26, rating: 84 },
    { name: "Rúben Dias", position: "DF", number: 4, club: "Man City", age: 28, rating: 87 },
    { name: "Rafael Leão", position: "FW", number: 17, club: "Milan", age: 26, rating: 86 },
  ],
  colombia: [
    { name: "Luis Díaz", position: "FW", number: 7, club: "Liverpool", age: 28, rating: 86, isKeyPlayer: true },
    { name: "James Rodríguez", position: "MF", number: 10, club: "León", age: 34, rating: 82 },
  ],
  senegal: [
    { name: "Sadio Mané", position: "FW", number: 10, club: "Al-Nassr", age: 34, rating: 85, isKeyPlayer: true },
    { name: "Kalidou Koulibaly", position: "DF", number: 3, club: "Al-Hilal", age: 34, rating: 83 },
  ],
  iran: [
    { name: "Mehdi Taremi", position: "FW", number: 9, club: "Inter", age: 33, rating: 82, isKeyPlayer: true },
    { name: "Sardar Azmoun", position: "FW", number: 20, club: "Leverkusen", age: 30, rating: 80 },
  ],
  australia: [
    { name: "Mathew Ryan", position: "GK", number: 1, club: "Roma", age: 33, rating: 78, isKeyPlayer: true },
    { name: "Harry Souttar", position: "DF", number: 4, club: "Leicester", age: 27, rating: 76 },
  ],
  switzerland: [
    { name: "Granit Xhaka", position: "MF", number: 10, club: "Leverkusen", age: 33, rating: 84, isKeyPlayer: true },
    { name: "Manuel Akanji", position: "DF", number: 5, club: "Man City", age: 30, rating: 83 },
  ],
  "ivory-coast": [
    { name: "Nicolas Pépé", position: "FW", number: 19, club: "Villarreal", age: 30, rating: 80, isKeyPlayer: true },
    { name: "Franck Kessié", position: "MF", number: 8, club: "Al-Ahli", age: 29, rating: 81 },
  ],
  egypt: [
    { name: "Mohamed Salah", position: "FW", number: 10, club: "Liverpool", age: 34, rating: 91, isKeyPlayer: true },
    { name: "Mohamed Elneny", position: "MF", number: 17, club: "Arsenal", age: 33, rating: 76 },
  ],
  "saudi-arabia": [
    { name: "Salem Al-Dawsari", position: "MF", number: 10, club: "Al-Hilal", age: 33, rating: 78, isKeyPlayer: true },
  ],
  norway: [
    { name: "Erling Haaland", position: "FW", number: 9, club: "Man City", age: 26, rating: 91, isKeyPlayer: true },
    { name: "Martin Ødegaard", position: "MF", number: 10, club: "Arsenal", age: 27, rating: 88 },
  ],
  panama: [
    { name: "Aníbal Godoy", position: "MF", number: 5, club: "Nashville", age: 35, rating: 74, isKeyPlayer: true },
  ],
};

const SQUAD_TEMPLATE: { position: Position; count: number }[] = [
  { position: "GK", count: 3 },
  { position: "DF", count: 9 },
  { position: "MF", count: 9 },
  { position: "FW", count: 5 },
];

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

const DETAILED_BY_POSITION: Record<Position, string[]> = {
  GK: ["Portero"],
  DF: [
    "Defensa central",
    "Lateral derecho",
    "Lateral izquierdo",
    "Carrilero",
    "Libero",
  ],
  MF: [
    "Mediocentro",
    "Pivote",
    "Mediapunta",
    "Interior derecho",
    "Interior izquierdo",
    "Volante mixto",
  ],
  FW: [
    "Delantero centro",
    "Extremo derecho",
    "Extremo izquierdo",
    "Segundo delantero",
  ],
};

function enrichPlayerProfile(player: PlayerSeed, team: Team): PlayerSeed {
  const hash = hashString(player.id);
  const age = player.age ?? 22 + (hash % 12);

  const heightRanges: Record<Position, [number, number]> = {
    GK: [188, 198],
    DF: [178, 192],
    MF: [170, 185],
    FW: [172, 188],
  };
  const [heightMin, heightMax] = heightRanges[player.position];
  const heightCm =
    player.heightCm ??
    heightMin + (hash % (heightMax - heightMin + 1));
  const weightKg =
    player.weightKg ??
    Math.round(62 + (heightCm - 170) * 0.75 + (hash % 9));

  const footOptions = ["right", "left", "both"] as const;
  const preferredFoot =
    player.preferredFoot ?? footOptions[hash % footOptions.length];

  const birthYear = 2026 - age;
  const birthMonth = (hash % 12) + 1;
  const birthDay = (hash % 28) + 1;
  const birthDate =
    player.birthDate ??
    `${birthYear}-${String(birthMonth).padStart(2, "0")}-${String(birthDay).padStart(2, "0")}`;

  const detailedOptions = DETAILED_BY_POSITION[player.position];
  const detailedPosition =
    player.detailedPosition ??
    detailedOptions[hash % detailedOptions.length];

  return {
    ...player,
    age,
    birthDate,
    heightCm,
    weightKg,
    preferredFoot,
    detailedPosition,
    nationality: player.nationality ?? team.name,
  };
}

function enrichAllPlayers(players: PlayerSeed[], teams: Team[]): PlayerSeed[] {
  const teamById = new Map(teams.map((team) => [team.id, team]));
  return players.map((player) =>
    enrichPlayerProfile(player, teamById.get(player.teamId)!),
  );
}

function loadJson<T>(file: string): T {
  return JSON.parse(readFileSync(join(DATA_DIR, file), "utf-8")) as T;
}

function baseRating(team: Team): number {
  return Math.min(88, Math.max(58, Math.round(92 - team.fifaRanking * 0.35)));
}

function generateName(teamId: string, index: number): string {
  const fi = index % FIRST_NAMES.length;
  const li = (index + teamId.length) % LAST_NAMES.length;
  return `${FIRST_NAMES[fi]} ${LAST_NAMES[li]}`;
}

function expandSquads(teams: Team[], existing: PlayerSeed[]): PlayerSeed[] {
  const byTeam = new Map<string, PlayerSeed[]>();
  for (const p of existing) {
    if (!byTeam.has(p.teamId)) byTeam.set(p.teamId, []);
    byTeam.get(p.teamId)!.push(p);
  }

  const all: PlayerSeed[] = [...existing];
  const existingIds = new Set(existing.map((p) => p.id));

  for (const team of teams) {
    const squad = byTeam.get(team.id) ?? [];
    const base = baseRating(team);

    for (const extra of EXTRA_STARS[team.id] ?? []) {
      if (squad.length >= TARGET_SQUAD) break;
      const id = slugify(`${team.id}-${extra.name}`);
      if (existingIds.has(id)) continue;
      const player: PlayerSeed = {
        id,
        teamId: team.id,
        ...extra,
      };
      squad.push(player);
      all.push(player);
      existingIds.add(id);
    }

    const posCounts: Record<Position, number> = { GK: 0, DF: 0, MF: 0, FW: 0 };
    for (const p of squad) posCounts[p.position]++;

    let fillerIndex = 0;
    for (const { position, count } of SQUAD_TEMPLATE) {
      while (posCounts[position] < count && squad.length < TARGET_SQUAD) {
        fillerIndex++;
        const name = generateName(team.id, fillerIndex);
        const id = `${team.id}-squad-${String(fillerIndex).padStart(2, "0")}`;
        if (existingIds.has(id)) continue;

        const rating = Math.max(
          55,
          Math.min(85, base - Math.floor(Math.random() * 12) + (position === "FW" ? 2 : 0)),
        );

        const player: PlayerSeed = {
          id,
          name,
          teamId: team.id,
          position,
          number: squad.length + 1,
          rating,
          club: `Club ${team.shortName}`,
          age: 22 + (fillerIndex % 12),
        };
        squad.push(player);
        all.push(player);
        existingIds.add(id);
        posCounts[position]++;
      }
    }
  }

  return all;
}

function groupStandings(teamIds: string[], teams: Team[]) {
  const ranked = teamIds
    .map((id) => teams.find((t) => t.id === id)!)
    .sort((a, b) => a.fifaRanking - b.fifaRanking);
  return {
    first: ranked[0]!.id,
    second: ranked[1]!.id,
    third: ranked[2]!.id,
    fourth: ranked[3]!.id,
  };
}

function roundRobin(group: string, teamIds: string[]): MatchSeed[] {
  const [t0, t1, t2, t3] = teamIds;
  const fixtures = [
    { home: t0, away: t1, md: 1 },
    { home: t2, away: t3, md: 1 },
    { home: t0, away: t2, md: 2 },
    { home: t1, away: t3, md: 2 },
    { home: t0, away: t3, md: 3 },
    { home: t1, away: t2, md: 3 },
  ];

  return fixtures.map((f, i) => ({
    id: `match-group-${group.toLowerCase()}-${String(i + 1).padStart(2, "0")}`,
    phase: "group",
    group,
    matchday: f.md,
    homeTeamId: f.home!,
    awayTeamId: f.away!,
    datetime: "", // filled later
    venueId: "",
    status: "scheduled",
    score: null,
  }));
}

function assignGroupDates(matches: MatchSeed[], venues: VenueSeed[]): void {
  const mdWindows: Record<number, string[]> = {
    1: ["2026-06-11", "2026-06-12", "2026-06-13", "2026-06-14", "2026-06-15", "2026-06-16"],
    2: ["2026-06-16", "2026-06-17", "2026-06-18", "2026-06-19", "2026-06-20", "2026-06-21"],
    3: ["2026-06-22", "2026-06-23", "2026-06-24", "2026-06-25", "2026-06-26", "2026-06-27"],
  };
  const kickoffUtc = ["17:00:00Z", "20:00:00Z", "23:00:00Z", "02:00:00Z"];

  const byMatchday: Record<number, MatchSeed[]> = { 1: [], 2: [], 3: [] };
  for (const m of matches) {
    if (m.matchday) byMatchday[m.matchday]!.push(m);
  }

  for (const md of [1, 2, 3] as const) {
    const window = mdWindows[md]!;
    const list = byMatchday[md]!.sort((a, b) => a.id.localeCompare(b.id));

    list.forEach((m, idx) => {
      const venue = venues[idx % venues.length]!;
      const day = window[idx % window.length]!;
      const time = kickoffUtc[idx % kickoffUtc.length]!;
      m.venueId = venue.id;
      m.datetime = `${day}T${time}`;
    });
  }
}

function isoDatetime(date: string, hour: number, offset = "-04:00"): string {
  return `${date}T${String(hour).padStart(2, "0")}:00:00${offset}`;
}

function buildKnockout(teams: Team[]): MatchSeed[] {
  const groups = "ABCDEFGHIJKL".split("");
  const teamsByGroup = new Map<string, string[]>();
  for (const g of groups) {
    teamsByGroup.set(
      g,
      teams.filter((t) => t.group === g).map((t) => t.id),
    );
  }

  const standings = groups.map((g) => ({
    group: g,
    ...groupStandings(teamsByGroup.get(g)!, teams),
  }));

  const thirds = [...standings]
    .sort((a, b) => {
      const ta = teams.find((t) => t.id === a.third)!;
      const tb = teams.find((t) => t.id === b.third)!;
      return ta.fifaRanking - tb.fifaRanking;
    })
    .slice(0, 8)
    .map((s) => s.third);

  const r32Teams: string[] = [];
  for (const s of standings) {
    r32Teams.push(s.first, s.second);
  }
  r32Teams.push(...thirds);

  const r32Dates = [
    "2026-06-28", "2026-06-29", "2026-06-30",
    "2026-07-01", "2026-07-02", "2026-07-03",
  ];
  const r32Matches: MatchSeed[] = [];
  for (let i = 0; i < 16; i++) {
    r32Matches.push({
      id: `match-r32-${String(i + 1).padStart(2, "0")}`,
      phase: "round_of_32",
      homeTeamId: r32Teams[i * 2]!,
      awayTeamId: r32Teams[i * 2 + 1]!,
      datetime: isoDatetime(r32Dates[i % r32Dates.length]!, 14 + (i % 3) * 2),
      venueId: "metlife-stadium",
      status: "scheduled",
      score: null,
    });
  }

  const phases: { phase: string; count: number; dates: string[] }[] = [
    { phase: "round_of_16", count: 8, dates: ["2026-07-04", "2026-07-05", "2026-07-06", "2026-07-07"] },
    { phase: "quarter", count: 4, dates: ["2026-07-09", "2026-07-10", "2026-07-11"] },
    { phase: "semi", count: 2, dates: ["2026-07-14", "2026-07-15"] },
  ];

  const knockout: MatchSeed[] = [...r32Matches];
  let prev = r32Matches;

  for (const { phase, count, dates } of phases) {
    const round: MatchSeed[] = [];
    for (let i = 0; i < count; i++) {
      round.push({
        id: `match-${phase.replace("round_of_", "r")}-${String(i + 1).padStart(2, "0")}`,
        phase,
        homeTeamId: prev[i * 2]!.homeTeamId,
        awayTeamId: prev[i * 2 + 1]!.homeTeamId,
        datetime: isoDatetime(dates[i % dates.length]!, 16 + (i % 3) * 2),
        venueId: i % 2 === 0 ? "sofi-stadium" : "att-stadium",
        status: "scheduled",
        score: null,
      });
    }
    knockout.push(...round);
    prev = round;
  }

  knockout.push({
    id: "match-third-place-001",
    phase: "third_place",
    homeTeamId: prev[0]!.homeTeamId,
    awayTeamId: prev[1]!.awayTeamId,
    datetime: isoDatetime("2026-07-18", 17),
    venueId: "hard-rock-miami",
    status: "scheduled",
    score: null,
  });

  knockout.push({
    id: "match-final-001",
    phase: "final",
    homeTeamId: prev[0]!.awayTeamId,
    awayTeamId: prev[1]!.awayTeamId,
    datetime: isoDatetime("2026-07-19", 19),
    venueId: "metlife-stadium",
    status: "scheduled",
    score: null,
  });

  return knockout;
}

function main() {
  console.log("Generando datos del Mundial 2026...\n");

  const teams = loadJson<Team[]>("teams.json");
  const venues = loadJson<VenueSeed[]>("venues.json");
  const existingPlayers = loadJson<PlayerSeed[]>("players.json");

  const players = enrichAllPlayers(expandSquads(teams, existingPlayers), teams);

  const groupMatches: MatchSeed[] = [];
  for (const g of "ABCDEFGHIJKL".split("")) {
    const groupTeams = teams.filter((t) => t.group === g).map((t) => t.id);
    groupMatches.push(...roundRobin(g, groupTeams));
  }
  assignGroupDates(groupMatches, venues);

  const knockout = buildKnockout(teams);
  const matches = [...groupMatches, ...knockout];

  const tournament = {
    ...loadJson<Record<string, unknown>>("tournament.json"),
    lastUpdated: new Date().toISOString().slice(0, 10),
    dataVersion: 2,
  };

  writeFileSync(join(DATA_DIR, "players.json"), JSON.stringify(players, null, 2) + "\n");
  writeFileSync(join(DATA_DIR, "matches.json"), JSON.stringify(matches, null, 2) + "\n");
  writeFileSync(join(DATA_DIR, "tournament.json"), JSON.stringify(tournament, null, 2) + "\n");

  console.log(`✓ Jugadores: ${players.length} (${teams.length} equipos)`);
  console.log(`✓ Partidos:  ${matches.length}`);
  console.log(`  - Grupos:  ${groupMatches.length}`);
  console.log(`  - Eliminatoria: ${knockout.length}`);
  console.log("\nEjecuta npm run validate-data para verificar.");
}

main();
