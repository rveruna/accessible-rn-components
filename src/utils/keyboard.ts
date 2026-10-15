/** A web keyboard event as react-native-web passes it to `onKeyDown`. */
export interface WebKeyEvent {
  key: string;
  preventDefault: () => void;
}

/**
 * Where an arrow, Home or End key moves to in a group with one tab stop (tabs, radio buttons), wrapping at
 * the ends as the WAI-ARIA patterns describe. Returns null for any other key, so the caller leaves it alone.
 */
export function nextIndex(key: string, current: number, count: number): number | null {
  if (count === 0) return null;
  switch (key) {
    case 'ArrowRight':
    case 'ArrowDown':
      return (current + 1) % count;
    case 'ArrowLeft':
    case 'ArrowUp':
      return (current - 1 + count) % count;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return null;
  }
}
