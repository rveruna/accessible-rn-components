export const colors = {
  background: '#FFFFFF',
  surfaceMuted: '#F3F4F6',
  text: '#1F2937',
  textMuted: '#4B5563',
  primary: '#1D4ED8',
  onPrimary: '#FFFFFF',
  border: '#6B7280',
  error: '#B42318',
  errorBackground: '#FEF3F2',
  success: '#05603A',
  successBackground: '#ECFDF3',
  info: '#1D4ED8',
  infoBackground: '#EFF4FF',
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24 } as const;

export const fontSize = { body: 16, label: 14, title: 20 } as const;

/** Minimum touch target in points (WCAG 2.5.5 / Apple HIG 44pt). */
export const MIN_TOUCH_TARGET = 44;

export type ColorToken = keyof typeof colors;
