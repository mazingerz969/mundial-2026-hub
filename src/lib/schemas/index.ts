import { z } from "zod";

export const PositionSchema = z.enum(["GK", "DF", "MF", "FW"]);

export const PreferredFootSchema = z.enum(["left", "right", "both"]);

export const ConfederacionSchema = z.enum([
  "UEFA",
  "CONMEBOL",
  "CONCACAF",
  "CAF",
  "AFC",
  "OFC",
]);

export const PhaseSchema = z.enum([
  "group",
  "round_of_32",
  "round_of_16",
  "quarter",
  "semi",
  "third_place",
  "final",
]);

export const MatchStatusSchema = z.enum([
  "scheduled",
  "live",
  "finished",
  "postponed",
]);

export const TournamentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  shortName: z.string().min(1),
  hostCountries: z.array(z.string().min(1)),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  teamCount: z.number().int().positive(),
  timezoneDefault: z.string().min(1),
  currentPhase: PhaseSchema,
  dataVersion: z.number().int().positive(),
  lastUpdated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const TeamSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  shortName: z.string().length(3),
  group: z.string().regex(/^[A-L]$/),
  fifaRanking: z.number().int().positive(),
  coach: z.string().min(1),
  confederation: ConfederacionSchema,
  flagCode: z.string().length(2),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  secondaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
});

export const PlayerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  teamId: z.string().min(1),
  position: PositionSchema,
  detailedPosition: z.string().optional(),
  number: z.number().int().min(1).max(99).optional(),
  club: z.string().optional(),
  age: z.number().int().min(16).max(45).optional(),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  heightCm: z.number().int().min(150).max(210).optional(),
  weightKg: z.number().int().min(55).max(110).optional(),
  preferredFoot: PreferredFootSchema.optional(),
  rating: z.number().int().min(1).max(99),
  nationality: z.string().optional(),
  isKeyPlayer: z.boolean().optional(),
});

export const VenueSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1),
  capacity: z.number().int().positive(),
  timezone: z.string().min(1),
});

export const ScoreSchema = z.object({
  home: z.number().int().min(0),
  away: z.number().int().min(0),
});

export const MatchSchema = z.object({
  id: z.string().min(1),
  phase: PhaseSchema,
  group: z.string().regex(/^[A-L]$/).optional(),
  matchday: z.number().int().min(1).max(3).optional(),
  homeTeamId: z.string().min(1),
  awayTeamId: z.string().min(1),
  datetime: z.string().datetime({ offset: true }),
  venueId: z.string().min(1),
  status: MatchStatusSchema,
  score: ScoreSchema.nullable().optional(),
  penaltyScore: ScoreSchema.nullable().optional(),
});

export const RequiredPositionsSchema = z.object({
  GK: z.number().int().min(0),
  DF: z.number().int().min(0),
  MF: z.number().int().min(0),
  FW: z.number().int().min(0),
});

export const ChallengeRulesSchema = z.object({
  maxPlayers: z.number().int().positive(),
  budget: z.number().positive().optional(),
  maxPerTeam: z.number().int().positive().optional(),
  minPerTeam: z.number().int().positive().optional(),
  allowedGroups: z.array(z.string().regex(/^[A-L]$/)).optional(),
  allowedTeams: z.array(z.string().min(1)).optional(),
  requiredPositions: RequiredPositionsSchema.optional(),
  excludedPlayers: z.array(z.string().min(1)).optional(),
  formation: z.string().optional(),
});

export const ChallengeBonusSchema = z.object({
  type: z.string().min(1),
  points: z.number(),
  minPairs: z.number().int().positive().optional(),
});

export const ChallengeSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["daily", "standard"]),
  title: z.string().min(1),
  description: z.string().min(1),
  rules: ChallengeRulesSchema,
  scoring: z.object({
    base: z.literal("sum_rating"),
    bonuses: z.array(ChallengeBonusSchema),
  }),
});

export const TeamsArraySchema = z.array(TeamSchema);
export const PlayersArraySchema = z.array(PlayerSchema);
export const VenuesArraySchema = z.array(VenueSchema);
export const MatchesArraySchema = z.array(MatchSchema);
export const ChallengesArraySchema = z.array(ChallengeSchema);

export type Tournament = z.infer<typeof TournamentSchema>;
export type Team = z.infer<typeof TeamSchema>;
export type Player = z.infer<typeof PlayerSchema>;
export type Venue = z.infer<typeof VenueSchema>;
export type Match = z.infer<typeof MatchSchema>;
export type Challenge = z.infer<typeof ChallengeSchema>;
export type Position = z.infer<typeof PositionSchema>;
export type PreferredFoot = z.infer<typeof PreferredFootSchema>;
export type Phase = z.infer<typeof PhaseSchema>;
