const FLAG_OVERRIDES: Record<string, string> = {
  sc: "gb-sct",
  gb: "gb-eng",
};

export function getFlagCode(flagCode: string): string {
  return FLAG_OVERRIDES[flagCode] ?? flagCode;
}

export function getFlagUrl(flagCode: string, width = 40): string {
  const code = getFlagCode(flagCode);
  const w = Math.min(Math.max(width, 20), 80);
  const h = Math.round(w * 0.75);
  return `https://flagcdn.com/${w}x${h}/${code}.png`;
}
