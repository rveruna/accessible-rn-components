import { nextIndex } from './keyboard';

describe('nextIndex', () => {
  it('moves forward with Right and Down, wrapping from the last to the first', () => {
    expect(nextIndex('ArrowRight', 0, 3)).toBe(1);
    expect(nextIndex('ArrowDown', 1, 3)).toBe(2);
    expect(nextIndex('ArrowRight', 2, 3)).toBe(0);
  });

  it('moves back with Left and Up, wrapping from the first to the last', () => {
    expect(nextIndex('ArrowLeft', 2, 3)).toBe(1);
    expect(nextIndex('ArrowUp', 0, 3)).toBe(2);
  });

  it('jumps to the ends with Home and End', () => {
    expect(nextIndex('Home', 2, 3)).toBe(0);
    expect(nextIndex('End', 0, 3)).toBe(2);
  });

  it('ignores other keys, and empty groups', () => {
    expect(nextIndex('Enter', 1, 3)).toBeNull();
    expect(nextIndex('a', 1, 3)).toBeNull();
    expect(nextIndex('ArrowRight', 0, 0)).toBeNull();
  });
});
