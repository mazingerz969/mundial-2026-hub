import { getPlayerInitials, POSITION_STYLES } from "@/lib/utils/player-avatar";
import type { Position } from "@/lib/schemas";

const SIZE_CLASSES = {
  xs: "h-7 w-7 text-[9px] ring-1",
  sm: "h-8 w-8 text-[10px] ring-1",
  md: "h-10 w-10 text-xs ring-1",
  lg: "h-12 w-12 text-sm ring-2",
  xl: "h-16 w-16 text-base ring-2",
} as const;

interface PlayerAvatarProps {
  name: string;
  position: Position;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}

export function PlayerAvatar({
  name,
  position,
  size = "md",
  className = "",
}: PlayerAvatarProps) {
  const initials = getPlayerInitials(name);
  const styles = POSITION_STYLES[position];

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${SIZE_CLASSES[size]} ${styles.avatar} ${className}`}
      aria-hidden
    >
      {initials}
    </span>
  );
}
