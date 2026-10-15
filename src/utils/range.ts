export interface Range {
  min: number;
  max: number;
  step: number;
}

/** The nearest allowed value: inside the range and on a step, counted from `min`. */
export function snap(value: number, { min, max, step }: Range): number {
  const stepped = min + Math.round((value - min) / step) * step;
  // Rounding to the step's decimals avoids values like 0.30000000000000004
  const decimals = (String(step).split('.')[1] ?? '').length;
  return Math.min(max, Math.max(min, Number(stepped.toFixed(decimals))));
}

/** The value at a point along a track, where 0 is the left end and `width` the right. */
export function valueAtPosition(x: number, width: number, range: Range): number {
  if (width <= 0) return range.min;
  const fraction = Math.min(1, Math.max(0, x / width));
  return snap(range.min + fraction * (range.max - range.min), range);
}

/**
 * The value a key moves a slider to, following the WAI-ARIA slider pattern: arrows move one step, Page Up and
 * Page Down a tenth of the range (at least one step), Home and End to the ends. Null for any other key.
 */
export function valueAfterKey(key: string, value: number, range: Range): number | null {
  const big = Math.max(range.step, snap((range.max - range.min) / 10, { ...range, min: 0 }));
  switch (key) {
    case 'ArrowRight':
    case 'ArrowUp':
      return snap(value + range.step, range);
    case 'ArrowLeft':
    case 'ArrowDown':
      return snap(value - range.step, range);
    case 'PageUp':
      return snap(value + big, range);
    case 'PageDown':
      return snap(value - big, range);
    case 'Home':
      return range.min;
    case 'End':
      return range.max;
    default:
      return null;
  }
}
