import type { Match, Player, Position, Team, Venue } from "@/lib/schemas";
import { matches, players, teams, venues } from "@/lib/data";
import { PHASE_LABELS } from "@/lib/constants/labels";

export type SearchResultType = "team" | "player" | "match" | "venue";

export interface SearchResult {
  type: SearchResultType;
  id: string;
  title: string;
  subtitle: string;
  href: string;
  playerPosition?: Position;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export function searchAll(query: string, limit = 20): SearchResult[] {
  const q = normalize(query.trim());
  if (q.length < 2) return [];

  const results: SearchResult[] = [];

  for (const team of teams) {
    const haystack = normalize(
      `${team.name} ${team.shortName} ${team.group} ${team.coach}`,
    );
    if (haystack.includes(q) || normalize(`grupo ${team.group}`).includes(q)) {
      results.push({
        type: "team",
        id: team.id,
        title: team.name,
        subtitle: `Grupo ${team.group} · #${team.fifaRanking} FIFA`,
        href: `/equipos/${team.id}`,
      });
    }
  }

  for (const player of players) {
    const team = teams.find((t) => t.id === player.teamId);
    const haystack = normalize(`${player.name} ${player.club ?? ""} ${team?.name ?? ""}`);
    if (haystack.includes(q)) {
      results.push({
        type: "player",
        id: player.id,
        title: player.name,
        subtitle: `${team?.name ?? player.teamId} · ${player.position}`,
        href: `/equipos/${player.teamId}/jugadores/${player.id}`,
        playerPosition: player.position,
      });
    }
  }

  for (const match of matches) {
    const home = teams.find((t) => t.id === match.homeTeamId);
    const away = teams.find((t) => t.id === match.awayTeamId);
    const haystack = normalize(
      `${home?.name ?? ""} ${away?.name ?? ""} ${match.group ?? ""} ${PHASE_LABELS[match.phase] ?? ""}`,
    );
    if (haystack.includes(q)) {
      results.push({
        type: "match",
        id: match.id,
        title: `${home?.name ?? match.homeTeamId} vs ${away?.name ?? match.awayTeamId}`,
        subtitle: PHASE_LABELS[match.phase] ?? match.phase,
        href: `/calendario?match=${match.id}`,
      });
    }
  }

  for (const venue of venues) {
    const haystack = normalize(`${venue.name} ${venue.city} ${venue.country}`);
    if (haystack.includes(q)) {
      results.push({
        type: "venue",
        id: venue.id,
        title: venue.name,
        subtitle: `${venue.city}, ${venue.country}`,
        href: `/calendario?venue=${venue.id}`,
      });
    }
  }

  return results.slice(0, limit);
}

export function groupSearchResults(results: SearchResult[]) {
  const groups: Record<SearchResultType, SearchResult[]> = {
    team: [],
    player: [],
    match: [],
    venue: [],
  };

  for (const result of results) {
    groups[result.type].push(result);
  }

  return groups;
}

export const SEARCH_TYPE_LABELS: Record<SearchResultType, string> = {
  team: "Equipos",
  player: "Jugadores",
  match: "Partidos",
  venue: "Sedes",
};

export type { Team, Player, Match, Venue };
