export const PHASE_LABELS: Record<string, string> = {
  group: "Fase de grupos",
  round_of_32: "Dieciseisavos",
  round_of_16: "Octavos",
  quarter: "Cuartos",
  semi: "Semifinales",
  third_place: "Tercer puesto",
  final: "Final",
};

export const STATUS_LABELS: Record<string, string> = {
  scheduled: "Programado",
  live: "En juego",
  finished: "Finalizado",
  postponed: "Aplazado",
};

export const FOOT_LABELS: Record<string, string> = {
  left: "Izquierda",
  right: "Derecha",
  both: "Ambidiestro",
};

export const POSITION_LABELS: Record<string, string> = {
  GK: "Portero",
  DF: "Defensa",
  MF: "Medio",
  FW: "Delantero",
};

export const CONFEDERATION_LABELS: Record<string, string> = {
  UEFA: "Europa",
  CONMEBOL: "Sudamérica",
  CONCACAF: "Concacaf",
  CAF: "África",
  AFC: "Asia",
  OFC: "Oceanía",
};

export const GROUPS = "ABCDEFGHIJKL".split("");

export const TIMEZONE_OPTIONS = [
  { value: "America/Mexico_City", label: "Ciudad de México (CST)" },
  { value: "America/New_York", label: "Nueva York (ET)" },
  { value: "America/Chicago", label: "Chicago (CT)" },
  { value: "America/Denver", label: "Denver (MT)" },
  { value: "America/Los_Angeles", label: "Los Ángeles (PT)" },
  { value: "America/Toronto", label: "Toronto" },
  { value: "America/Vancouver", label: "Vancouver" },
  { value: "America/Bogota", label: "Bogotá" },
  { value: "America/Buenos_Aires", label: "Buenos Aires" },
  { value: "America/Sao_Paulo", label: "São Paulo" },
  { value: "Europe/Madrid", label: "Madrid" },
  { value: "Europe/London", label: "Londres" },
  { value: "Europe/Paris", label: "París" },
  { value: "Europe/Berlin", label: "Berlín" },
  { value: "Asia/Tokyo", label: "Tokio" },
  { value: "Asia/Seoul", label: "Seúl" },
  { value: "UTC", label: "UTC" },
] as const;
