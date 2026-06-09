import Image from "next/image";

import { getFlagUrl } from "@/lib/utils/flags";

interface FlagProps {
  flagCode: string;
  alt: string;
  size?: number;
  className?: string;
}

export function Flag({ flagCode, alt, size = 32, className = "" }: FlagProps) {
  const width = size;
  const height = Math.round(size * 0.75);

  return (
    <Image
      src={getFlagUrl(flagCode, size)}
      alt={alt}
      width={width}
      height={height}
      className={`rounded-sm object-cover ${className}`}
      unoptimized
    />
  );
}
