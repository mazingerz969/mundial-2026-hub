import tournamentData from "@/data/tournament.json";
import teamsData from "@/data/teams.json";
import playersData from "@/data/players.json";
import matchesData from "@/data/matches.json";
import venuesData from "@/data/venues.json";
import challengesData from "@/data/challenges.json";
import quinielaResultsData from "@/data/quiniela-results.json";

import {
  ChallengesArraySchema,
  MatchesArraySchema,
  PlayersArraySchema,
  TeamsArraySchema,
  TournamentSchema,
  VenuesArraySchema,
} from "@/lib/schemas";
import type { Player } from "@/lib/schemas";
import { QuinielaResultsSchema } from "@/lib/games/quiniela/types";

export const tournament = TournamentSchema.parse(tournamentData);
export const teams = TeamsArraySchema.parse(teamsData);
export const realTeams = teams.filter((t) => !t.id.startsWith("tbd-"));
export const players = PlayersArraySchema.parse(playersData);
export const matches = MatchesArraySchema.parse(matchesData);
export const venues = VenuesArraySchema.parse(venuesData);
export const challenges = ChallengesArraySchema.parse(challengesData);
export const quinielaResults = QuinielaResultsSchema.parse(quinielaResultsData);

export function getTeamById(id: string) {
  return teams.find((team) => team.id === id);
}

export function sortPlayersBySquad(list: Player[]): Player[] {
  return [...list].sort((a, b) => {
    const posOrder = { GK: 0, DF: 1, MF: 2, FW: 3 };
    const posDiff = posOrder[a.position] - posOrder[b.position];
    if (posDiff !== 0) return posDiff;

    if (a.number != null && b.number != null) return a.number - b.number;
    if (a.number != null) return -1;
    if (b.number != null) return 1;

    return a.name.localeCompare(b.name, "es");
  });
}

export function getPlayersByTeamId(teamId: string): Player[] {
  return sortPlayersBySquad(
    players.filter((player) => player.teamId === teamId),
  );
}

export function getPlayersForMatch(homeTeamId: string, awayTeamId: string): Player[] {
  return sortPlayersBySquad(
    players.filter(
      (player) =>
        player.teamId === homeTeamId || player.teamId === awayTeamId,
    ),
  );
}

export function getVenueById(id: string) {
  return venues.find((venue) => venue.id === id);
}

export function getMatchesByTeamId(teamId: string) {
  return matches.filter(
    (match) => match.homeTeamId === teamId || match.awayTeamId === teamId,
  );
}

export function getMatchesToday() {
  const today = new Date().toISOString().slice(0, 10);
  return matches.filter((match) => match.datetime.startsWith(today));
}

export function getStats() {
  return {
    teamCount: realTeams.length,
    playerCount: players.length,
    matchCount: matches.length,
    venueCount: venues.length,
    challengeCount: challenges.length,
  };
}

export function getPlayerById(id: string) {
  return players.find((player) => player.id === id);
}

export function getMatchById(id: string) {
  return matches.find((match) => match.id === id);
}

export function getUpcomingMatches(limit = 5) {
  const now = Date.now();
  return [...matches]
    .filter(
      (m) =>
        m.status === "scheduled" ||
        m.status === "live" ||
        new Date(m.datetime).getTime() >= now,
    )
    .sort(
      (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
    )
    .slice(0, limit);
}

export function getNextMatchForTeam(teamId: string) {
  const now = Date.now();
  return [...matches]
    .filter(
      (m) =>
        (m.homeTeamId === teamId || m.awayTeamId === teamId) &&
        (m.status === "scheduled" ||
          m.status === "live" ||
          new Date(m.datetime).getTime() >= now),
    )
    .sort(
      (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
    )[0];
}

export function getRecentFinishedMatches(limit = 3) {
  return [...matches]
    .filter((m) => m.status === "finished")
    .sort(
      (a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime(),
    )
    .slice(0, limit);
}
