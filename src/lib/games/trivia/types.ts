export type TriviaQuestionType =
  | "player_country"
  | "team_group"
  | "player_position"
  | "venue_city"
  | "match_teams";

export interface TriviaQuestion {
  id: string;
  type: TriviaQuestionType;
  text: string;
  options: string[];
  correctIndex: number;
}

export interface TriviaAnswer {
  questionId: string;
  selectedIndex: number | null;
  correct: boolean;
  points: number;
  secondsRemaining: number;
}

export interface TriviaSessionResult {
  score: number;
  correctCount: number;
  totalQuestions: number;
  answers: TriviaAnswer[];
  timedOut: boolean;
}

export const TRIVIA_QUESTION_COUNT = 10;
export const TRIVIA_TIME_SECONDS = 60;
export const TRIVIA_BASE_POINTS = 100;
export const TRIVIA_TIME_BONUS_MULTIPLIER = 2;
