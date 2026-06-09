import { POSITION_LABELS } from "@/lib/constants/labels";
import { POSITION_STYLES } from "@/lib/utils/player-avatar";
import type { Position } from "@/lib/schemas";

interface PositionBadgeProps {
  position: Position;
  showLabel?: boolean;
}

export function PositionBadge({ position, showLabel = false }: PositionBadgeProps) {
  const styles = POSITION_STYLES[position];

  return (
    <span
      className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-semibold ${styles.badge}`}
      title={POSITION_LABELS[position]}
    >
      {showLabel ? POSITION_LABELS[position] : position}
    </span>
  );
}
