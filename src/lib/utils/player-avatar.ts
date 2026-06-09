import type { Position } from "@/lib/schemas";

export function getPlayerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

export const POSITION_STYLES: Record<
  Position,
  { avatar: string; badge: string; text: string }
> = {
  GK: {
    avatar: "bg-amber-500/25 text-amber-300 ring-amber-500/40",
    badge: "bg-amber-500/20 text-amber-400",
    text: "text-amber-400",
  },
  DF: {
    avatar: "bg-accent-blue/25 text-blue-300 ring-accent-blue/40",
    badge: "bg-accent-blue/20 text-accent-blue",
    text: "text-accent-blue",
  },
  MF: {
    avatar: "bg-accent-green/25 text-emerald-300 ring-accent-green/40",
    badge: "bg-accent-green/20 text-accent-green",
    text: "text-accent-green",
  },
  FW: {
    avatar: "bg-rose-500/25 text-rose-300 ring-rose-500/40",
    badge: "bg-rose-500/20 text-rose-400",
    text: "text-rose-400",
  },
};

export function getTeamAccentColor(primaryColor?: string): string {
  return primaryColor ?? "#22c55e";
}
