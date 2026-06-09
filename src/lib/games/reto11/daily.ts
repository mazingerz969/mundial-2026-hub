import { challenges } from "@/lib/data";
import type { Challenge } from "@/lib/schemas";
import { getTodayKeyInTimezone } from "@/lib/utils/datetime";

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getDailyChallenge(timezone: string): Challenge {
  const dateKey = getTodayKeyInTimezone(timezone);
  const eligible = challenges.filter((c) => c.type === "standard" || c.type === "daily");
  const index = hashString(`reto11-${dateKey}`) % eligible.length;
  return eligible[index]!;
}

export function getDailyDateKey(timezone: string): string {
  return getTodayKeyInTimezone(timezone);
}

export function isDailyCompleted(
  dailyCompleted: Record<string, unknown>,
  timezone: string,
): boolean {
  const key = getDailyDateKey(timezone);
  return key in dailyCompleted;
}
