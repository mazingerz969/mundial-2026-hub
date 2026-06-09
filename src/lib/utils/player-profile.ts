import type { Player } from "@/lib/schemas";

export function getPlayerPath(player: Pick<Player, "id" | "teamId">): string {
  return `/equipos/${player.teamId}/jugadores/${player.id}`;
}

export function formatBirthDate(
  birthDate: string | undefined,
  locale = "es-ES",
): string | null {
  if (!birthDate) return null;

  const date = new Date(`${birthDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatHeight(heightCm: number | undefined): string | null {
  if (heightCm == null) return null;
  return `${(heightCm / 100).toFixed(2).replace(".", ",")} m`;
}

export function formatWeight(weightKg: number | undefined): string | null {
  if (weightKg == null) return null;
  return `${weightKg} kg`;
}

export function getBirthYear(
  player: Pick<Player, "birthDate" | "age">,
): number | null {
  if (player.birthDate) {
    const year = Number.parseInt(player.birthDate.slice(0, 4), 10);
    return Number.isNaN(year) ? null : year;
  }

  if (player.age != null) {
    return 2026 - player.age;
  }

  return null;
}
