import { colors } from '../theme/tokens';
import { contrastRatio, meetsContrast, relativeLuminance, requiredRatio } from './contrast';

describe('contrastRatio', () => {
  it('returns 21 for black on white and 1 for identical colours', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrastRatio('#336699', '#336699')).toBeCloseTo(1, 5);
  });

  it('is symmetric', () => {
    expect(contrastRatio('#1D4ED8', '#FFFFFF')).toBeCloseTo(contrastRatio('#FFFFFF', '#1D4ED8'), 10);
  });

  it('rejects anything that is not a 6-digit hex colour', () => {
    expect(() => relativeLuminance('red')).toThrow('6-digit hex');
    expect(() => relativeLuminance('#fff')).toThrow('6-digit hex');
  });
});

describe('requiredRatio', () => {
  it('follows the WCAG thresholds', () => {
    expect(requiredRatio('AA')).toBe(4.5);
    expect(requiredRatio('AA', true)).toBe(3);
    expect(requiredRatio('AAA')).toBe(7);
    expect(requiredRatio('AAA', true)).toBe(4.5);
  });
});

describe('design token palette', () => {
  const pairs: [string, string, string][] = [
    ['body text', colors.text, colors.background],
    ['muted text', colors.textMuted, colors.background],
    ['primary button label', colors.onPrimary, colors.primary],
    ['secondary button label', colors.primary, colors.background],
    ['error text', colors.error, colors.background],
    ['error banner text', colors.error, colors.errorBackground],
    ['success banner text', colors.success, colors.successBackground],
    ['info banner text', colors.info, colors.infoBackground],
  ];

  it.each(pairs)('%s meets WCAG AA', (_name, foreground, background) => {
    expect(meetsContrast(foreground, background, 'AA')).toBe(true);
  });

  it('input borders meet the 3:1 non-text contrast requirement', () => {
    expect(contrastRatio(colors.border, colors.background)).toBeGreaterThanOrEqual(3);
  });
});
