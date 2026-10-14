const HEX = /^#([0-9a-f]{6})$/i;

function channel(value: number): number {
  const s = value / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(hex: string): number {
  const match = HEX.exec(hex);
  if (!match) throw new Error(`Expected a 6-digit hex colour, got "${hex}"`);
  const n = parseInt(match[1], 16);
  const r = channel((n >> 16) & 255);
  const g = channel((n >> 8) & 255);
  const b = channel(n & 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.x contrast ratio between two colours, from 1 to 21. */
export function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  const [lighter, darker] = a >= b ? [a, b] : [b, a];
  return (lighter + 0.05) / (darker + 0.05);
}

export type ConformanceLevel = 'AA' | 'AAA';

/** Minimum ratio for normal text (large text uses the relaxed threshold). */
export function requiredRatio(level: ConformanceLevel, largeText = false): number {
  if (level === 'AAA') return largeText ? 4.5 : 7;
  return largeText ? 3 : 4.5;
}

export function meetsContrast(
  foreground: string,
  background: string,
  level: ConformanceLevel = 'AA',
  largeText = false,
): boolean {
  return contrastRatio(foreground, background) >= requiredRatio(level, largeText);
}
