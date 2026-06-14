import type { Match } from "@/lib/schemas";

export function isMatchUpcoming(match: Match, now = Date.now()): boolean {
  if (match.status === "live") return true;
  if (match.status === "finished" || match.status === "postponed") return false;
  return new Date(match.datetime).getTime() >= now;
}

export function getUpcomingFromList(list: Match[], limit = 5): Match[] {
  const now = Date.now();
  return [...list]
    .filter((m) => isMatchUpcoming(m, now))
    .sort(
      (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
    )
    .slice(0, limit);
}

export function getLiveFromList(list: Match[]): Match[] {
  return list.filter((m) => m.status === "live");
}

export function getRecentFinishedFromList(list: Match[], limit = 3): Match[] {
  return [...list]
    .filter((m) => m.status === "finished")
    .sort(
      (a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime(),
    )
    .slice(0, limit);
}

export function getNextMatchForTeamFromList(
  list: Match[],
  teamId: string,
): Match | undefined {
  const now = Date.now();
  return [...list]
    .filter(
      (m) =>
        (m.homeTeamId === teamId || m.awayTeamId === teamId) &&
        isMatchUpcoming(m, now),
    )
    .sort(
      (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
    )[0];
}

export function countFinishedMatches(list: Match[]): number {
  return list.filter((m) => m.status === "finished").length;
}

export function getTournamentStatusLabel(
  startDate: string,
  endDate: string,
  now = new Date(),
): string {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T23:59:59`);

  if (now < start) {
    const days = Math.ceil((start.getTime() - now.getTime()) / 86400000);
    return days === 1 ? "Arranca mañana" : `Faltan ${days} días`;
  }

  if (now > end) {
    return "Torneo finalizado";
  }

  const day = Math.floor((now.getTime() - start.getTime()) / 86400000) + 1;
  return `Día ${day} · Torneo en marcha`;
}
