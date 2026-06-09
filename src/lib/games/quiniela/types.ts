import { z } from "zod";

export const QuinielaResultsSchema = z.object({
  topScorers: z.array(
    z.object({
      playerId: z.string().min(1),
      goals: z.number().int().min(0),
    }),
  ),
  tournamentMvp: z.string().nullable(),
  matchMvps: z.record(z.string(), z.string()),
});

export type QuinielaResults = z.infer<typeof QuinielaResultsSchema>;

export const MatchPredictionSchema = z.object({
  homeScore: z.number().int().min(0).max(20),
  awayScore: z.number().int().min(0).max(20),
});

export type MatchPrediction = z.infer<typeof MatchPredictionSchema>;

export const QUINIELA_POINTS = {
  matchOutcome: 3,
  exactScore: 5,
  matchMvp: 4,
  topScorerExactRank: [10, 8, 6, 4, 2] as const,
  topScorerInTop5: 3,
  tournamentMvp: 15,
} as const;
