import type { Player } from "@/lib/schemas";

interface ApiPersonTeam {
  name?: string;
  shortName?: string;
  tla?: string;
}

interface ApiPerson {
  position?: string;
  shirtNumber?: number | null;
  nationality?: string;
  currentTeam?: ApiPersonTeam;
}

export interface PlayerEnrichment {
  number?: number;
  detailedPosition?: string;
  club?: string;
}

const NATIONAL_TEAM_NAMES = new Set([
  "Spain",
  "France",
  "Germany",
  "England",
  "Portugal",
  "Brazil",
  "Argentina",
  "Italy",
  "Netherlands",
  "Belgium",
  "Uruguay",
  "Mexico",
  "USA",
  "Canada",
  "Japan",
  "South Korea",
  "Morocco",
  "Senegal",
  "Australia",
  "Switzerland",
  "Croatia",
  "Colombia",
  "Ecuador",
  "Paraguay",
  "Chile",
  "Peru",
  "Norway",
  "Sweden",
  "Denmark",
  "Poland",
  "Turkey",
  "Ukraine",
  "Scotland",
  "Austria",
  "Czechia",
  "Serbia",
  "Wales",
  "Ireland",
  "Romania",
  "Hungary",
  "Greece",
  "Iran",
  "Saudi Arabia",
  "Qatar",
  "Iraq",
  "Jordan",
  "Uzbekistan",
  "Egypt",
  "Tunisia",
  "Algeria",
  "Ghana",
  "Nigeria",
  "Cameroon",
  "Ivory Coast",
  "South Africa",
  "Cape Verde",
  "DR Congo",
  "Haiti",
  "Panama",
  "Costa Rica",
  "Jamaica",
  "New Zealand",
  "Curacao",
  "Bosnia-Herzegovina",
]);

function resolveClub(person: ApiPerson): string | undefined {
  const team = person.currentTeam;
  if (!team?.name) return undefined;
  if (NATIONAL_TEAM_NAMES.has(team.name)) return undefined;
  if (
    person.nationality &&
    team.name.toLowerCase().includes(person.nationality.toLowerCase().split(" ")[0]!)
  ) {
    return undefined;
  }
  return team.shortName ?? team.name;
}

function coarsePosition(apiPos: string): Player["position"] {
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

export async function fetchPlayerEnrichment(
  playerId: string,
): Promise<PlayerEnrichment | null> {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey || !playerId.startsWith("fd-")) return null;

  const numericId = playerId.slice(3);
  const response = await fetch(
    `https://api.football-data.org/v4/persons/${numericId}`,
    {
      headers: { "X-Auth-Token": apiKey },
      next: { revalidate: 60 * 60 * 24 * 7 },
    },
  );

  if (!response.ok) return null;

  const person = (await response.json()) as ApiPerson;
  const detailedPosition =
    person.position &&
    coarsePosition(person.position) !== person.position &&
    !["Goalkeeper", "Defence", "Midfield", "Offence"].includes(person.position)
      ? person.position
      : person.position &&
          !["Goalkeeper", "Defence", "Midfield", "Offence"].includes(
            person.position,
          )
        ? person.position
        : undefined;

  return {
    number: person.shirtNumber ?? undefined,
    detailedPosition,
    club: resolveClub(person),
  };
}

export function mergePlayerWithEnrichment(
  player: Player,
  enrichment: PlayerEnrichment | null,
): Player {
  if (!enrichment) return player;

  return {
    ...player,
    number: enrichment.number ?? player.number,
    detailedPosition: enrichment.detailedPosition ?? player.detailedPosition,
    club: enrichment.club ?? player.club,
  };
}
