export function formatMatchDateTime(
  iso: string,
  timezone: string,
  options?: { dateStyle?: "short" | "medium"; timeOnly?: boolean },
): string {
  const date = new Date(iso);

  if (options?.timeOnly) {
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: timezone,
    });
  }

  return date.toLocaleString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
  });
}

export function formatMatchDate(iso: string, timezone: string): string {
  return new Date(iso).toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: timezone,
  });
}

export function getDateKeyInTimezone(iso: string, timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

export function getTodayKeyInTimezone(timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function getTomorrowKeyInTimezone(timezone: string): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(tomorrow);
}

export function isWithinWeek(iso: string, timezone: string): boolean {
  const matchDate = new Date(iso);
  const now = new Date();
  const weekLater = new Date(now);
  weekLater.setDate(weekLater.getDate() + 7);
  return matchDate >= now && matchDate <= weekLater;
}

export function formatDateLabel(iso: string, timezone: string): string {
  const today = getTodayKeyInTimezone(timezone);
  const tomorrow = getTomorrowKeyInTimezone(timezone);
  const key = getDateKeyInTimezone(iso, timezone);

  if (key === today) return "Hoy";
  if (key === tomorrow) return "Mañana";

  return new Date(iso).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: timezone,
  });
}
