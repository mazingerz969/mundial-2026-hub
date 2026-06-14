import { z } from "zod";

import { MatchStatusSchema, PhaseSchema, ScoreSchema } from "@/lib/schemas";
import { QuinielaResultsSchema } from "@/lib/games/quiniela/types";

export const MatchOverrideSchema = z
  .object({
    status: MatchStatusSchema.optional(),
    score: ScoreSchema.nullable().optional(),
    penaltyScore: ScoreSchema.nullable().optional(),
    datetime: z.string().datetime({ offset: true }).optional(),
  })
  .strict();

export const LiveOverridesSchema = z.object({
  updatedAt: z.string().datetime().nullable().optional(),
  tournament: z
    .object({
      currentPhase: PhaseSchema.optional(),
      lastUpdated: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional(),
    })
    .optional(),
  matches: z.record(z.string(), MatchOverrideSchema).optional(),
  quinielaResults: QuinielaResultsSchema.partial().optional(),
});

export type LiveOverrides = z.infer<typeof LiveOverridesSchema>;
export type MatchOverride = z.infer<typeof MatchOverrideSchema>;
