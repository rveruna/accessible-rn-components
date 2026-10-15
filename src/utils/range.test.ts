import { snap, valueAfterKey, valueAtPosition } from './range';

const percent = { min: 0, max: 100, step: 1 };
const money = { min: 0, max: 500, step: 25 };

describe('snap', () => {
  it('rounds to the nearest step counted from the minimum', () => {
    expect(snap(37, money)).toBe(25);
    expect(snap(38, money)).toBe(50);
    expect(snap(13, { min: 3, max: 30, step: 5 })).toBe(13);
    expect(snap(14, { min: 3, max: 30, step: 5 })).toBe(13);
  });

  it('keeps the value inside the range', () => {
    expect(snap(-20, money)).toBe(0);
    expect(snap(9000, money)).toBe(500);
  });

  it('avoids floating-point noise with decimal steps', () => {
    expect(snap(0.1 + 0.2, { min: 0, max: 1, step: 0.1 })).toBe(0.3);
  });
});

describe('valueAtPosition', () => {
  it('maps a point on the track to a value', () => {
    expect(valueAtPosition(0, 200, percent)).toBe(0);
    expect(valueAtPosition(100, 200, percent)).toBe(50);
    expect(valueAtPosition(200, 200, percent)).toBe(100);
  });

  it('clamps points beyond either end, and snaps to the step', () => {
    expect(valueAtPosition(-50, 200, percent)).toBe(0);
    expect(valueAtPosition(260, 200, percent)).toBe(100);
    expect(valueAtPosition(61, 200, money)).toBe(150);
  });

  it('gives the minimum before the track has been measured', () => {
    expect(valueAtPosition(80, 0, money)).toBe(0);
  });
});

describe('valueAfterKey', () => {
  it('moves one step with the arrow keys', () => {
    expect(valueAfterKey('ArrowRight', 50, money)).toBe(75);
    expect(valueAfterKey('ArrowUp', 50, money)).toBe(75);
    expect(valueAfterKey('ArrowLeft', 50, money)).toBe(25);
    expect(valueAfterKey('ArrowDown', 50, money)).toBe(25);
  });

  it('moves a tenth of the range with Page Up and Page Down', () => {
    expect(valueAfterKey('PageUp', 20, percent)).toBe(30);
    expect(valueAfterKey('PageDown', 20, percent)).toBe(10);
    expect(valueAfterKey('PageUp', 0, money)).toBe(50);
  });

  it('moves at least one step with the Page keys on a small range', () => {
    expect(valueAfterKey('PageUp', 1, { min: 0, max: 5, step: 1 })).toBe(2);
  });

  it('jumps to the ends with Home and End', () => {
    expect(valueAfterKey('Home', 250, money)).toBe(0);
    expect(valueAfterKey('End', 250, money)).toBe(500);
  });

  it('stops at the ends', () => {
    expect(valueAfterKey('ArrowRight', 500, money)).toBe(500);
    expect(valueAfterKey('ArrowLeft', 0, money)).toBe(0);
  });

  it('ignores other keys', () => {
    expect(valueAfterKey('Enter', 50, money)).toBeNull();
  });
});
