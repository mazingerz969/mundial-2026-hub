import { matches, players, teams, venues } from "@/lib/data";
import { getTeamById } from "@/lib/data";
import { POSITION_LABELS } from "@/lib/constants/labels";
import type { TriviaQuestion, TriviaQuestionType } from "./types";
import {
  TRIVIA_BASE_POINTS,
  TRIVIA_QUESTION_COUNT,
  TRIVIA_TIME_BONUS_MULTIPLIER,
} from "./types";

function shuffle<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

function pickDistractors<T>(
  pool: T[],
  correct: T,
  count: number,
  key: (item: T) => string,
): T[] {
  const unique = pool.filter((item) => key(item) !== key(correct));
  return shuffle(unique).slice(0, count);
}

function buildOptions(correct: string, distractors: string[]): string[] {
  return shuffle([correct, ...distractors.slice(0, 3)]);
}

function makeQuestion(
  partial: Omit<TriviaQuestion, "correctIndex"> & { correctAnswer: string },
): TriviaQuestion {
  const options = buildOptions(
    partial.correctAnswer,
    partial.options.filter((o) => o !== partial.correctAnswer),
  );
  return {
    id: partial.id,
    type: partial.type,
    text: partial.text,
    options,
    correctIndex: options.indexOf(partial.correctAnswer),
  };
}

function generatePlayerCountry(usedPlayers: Set<string>): TriviaQuestion | null {
  const pool = players.filter((p) => !usedPlayers.has(p.id));
  if (pool.length === 0) return null;
  const player = shuffle(pool)[0]!;
  const team = getTeamById(player.teamId);
  if (!team) return null;
  usedPlayers.add(player.id);

  const distractors = pickDistractors(
    teams.map((t) => t.name),
    team.name,
    3,
    (n) => n,
  );

  return makeQuestion({
    id: `pc-${player.id}`,
    type: "player_country",
    text: `¿De qué selección es ${player.name}?`,
    correctAnswer: team.name,
    options: [team.name, ...distractors],
  });
}

function generateTeamGroup(usedTeams: Set<string>): TriviaQuestion | null {
  const pool = teams.filter((t) => !usedTeams.has(t.id));
  if (pool.length === 0) return null;
  const team = shuffle(pool)[0]!;
  usedTeams.add(team.id);

  const groups = "ABCDEFGHIJKL".split("");
  const distractors = pickDistractors(groups, team.group, 3, (g) => g);

  return makeQuestion({
    id: `tg-${team.id}`,
    type: "team_group",
    text: `¿En qué grupo está ${team.name}?`,
    correctAnswer: `Grupo ${team.group}`,
    options: [`Grupo ${team.group}`, ...distractors.map((g) => `Grupo ${g}`)],
  });
}

function generatePlayerPosition(usedPlayers: Set<string>): TriviaQuestion | null {
  const pool = players.filter((p) => !usedPlayers.has(p.id));
  if (pool.length === 0) return null;
  const player = shuffle(pool)[0]!;
  usedPlayers.add(player.id);

  const correct = POSITION_LABELS[player.position] ?? player.position;
  const all = ["Portero", "Defensa", "Medio", "Delantero"];
  const distractors = pickDistractors(all, correct, 3, (p) => p);

  return makeQuestion({
    id: `pp-${player.id}`,
    type: "player_position",
    text: `¿Qué posición juega ${player.name}?`,
    correctAnswer: correct,
    options: [correct, ...distractors],
  });
}

function generateVenueCity(usedVenues: Set<string>): TriviaQuestion | null {
  const pool = venues.filter((v) => !usedVenues.has(v.id));
  if (pool.length === 0) return null;
  const venue = shuffle(pool)[0]!;
  usedVenues.add(venue.id);

  const distractors = pickDistractors(
    venues.map((v) => v.city),
    venue.city,
    3,
    (c) => c,
  );

  return makeQuestion({
    id: `vc-${venue.id}`,
    type: "venue_city",
    text: `¿En qué ciudad está ${venue.name}?`,
    correctAnswer: venue.city,
    options: [venue.city, ...distractors],
  });
}

function generateMatchTeams(usedMatches: Set<string>): TriviaQuestion | null {
  const pool = matches.filter((m) => !usedMatches.has(m.id));
  if (pool.length === 0) return null;
  const match = shuffle(pool)[0]!;
  usedMatches.add(match.id);

  const home = getTeamById(match.homeTeamId);
  const away = getTeamById(match.awayTeamId);
  if (!home || !away) return null;

  const date = new Date(match.datetime).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
  const correct = `${home.name} vs ${away.name}`;

  const others = shuffle(
    matches.filter((m) => m.id !== match.id).slice(0, 12),
  )
    .map((m) => {
      const h = getTeamById(m.homeTeamId);
      const a = getTeamById(m.awayTeamId);
      return h && a ? `${h.name} vs ${a.name}` : null;
    })
    .filter((s): s is string => s != null && s !== correct);

  const distractors = pickDistractors(others, correct, 3, (s) => s);

  return makeQuestion({
    id: `mt-${match.id}`,
    type: "match_teams",
    text: `¿Qué partido es el ${date}?`,
    correctAnswer: correct,
    options: [correct, ...distractors],
  });
}

const GENERATORS: Record<
  TriviaQuestionType,
  (used: {
    players: Set<string>;
    teams: Set<string>;
    venues: Set<string>;
    matches: Set<string>;
  }) => TriviaQuestion | null
> = {
  player_country: (u) => generatePlayerCountry(u.players),
  team_group: (u) => generateTeamGroup(u.teams),
  player_position: (u) => generatePlayerPosition(u.players),
  venue_city: (u) => generateVenueCity(u.venues),
  match_teams: (u) => generateMatchTeams(u.matches),
};

export function generateTriviaQuestions(
  count = TRIVIA_QUESTION_COUNT,
): TriviaQuestion[] {
  const used = {
    players: new Set<string>(),
    teams: new Set<string>(),
    venues: new Set<string>(),
    matches: new Set<string>(),
  };

  const types = shuffle(Object.keys(GENERATORS) as TriviaQuestionType[]);
  const questions: TriviaQuestion[] = [];
  let attempts = 0;
  const maxAttempts = count * 20;

  while (questions.length < count && attempts < maxAttempts) {
    const type = types[attempts % types.length]!;
    const q = GENERATORS[type](used);
    if (q && !questions.some((existing) => existing.id === q.id)) {
      questions.push(q);
    }
    attempts++;
  }

  return questions;
}

export function scoreAnswer(
  correct: boolean,
  secondsRemaining: number,
): number {
  if (!correct) return 0;
  return (
    TRIVIA_BASE_POINTS +
    Math.max(0, Math.floor(secondsRemaining)) * TRIVIA_TIME_BONUS_MULTIPLIER
  );
}
