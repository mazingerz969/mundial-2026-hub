import type { Challenge } from "@/lib/schemas";

export function describeChallengeRules(challenge: Challenge): string[] {
  const lines: string[] = [];
  const { rules } = challenge;

  lines.push(`Once titular de ${rules.maxPlayers} jugadores.`);

  if (rules.budget != null) {
    lines.push(
      `Presupuesto máximo: ${rules.budget} puntos (coste de mercado por jugador, no el rating).`,
    );
  }

  if (rules.maxPerTeam != null) {
    lines.push(`Máximo ${rules.maxPerTeam} jugador(es) por selección.`);
  }

  if (rules.allowedGroups?.length) {
    lines.push(`Solo jugadores de los grupos ${rules.allowedGroups.join(", ")}.`);
  }

  if (rules.allowedTeams?.length) {
    lines.push(`Solo selecciones permitidas en este reto.`);
  }

  if (rules.requiredPositions) {
    const parts = Object.entries(rules.requiredPositions)
      .filter(([, n]) => n > 0)
      .map(([pos, n]) => `${n} ${pos}`);
    lines.push(`Posiciones mínimas: ${parts.join(", ")}.`);
  }

  if (rules.formation) {
    lines.push(`Formación: ${rules.formation}.`);
  }

  if (challenge.scoring.bonuses.length > 0) {
    lines.push("Bonificaciones disponibles por cumplir objetivos extra.");
  }

  return lines;
}
