import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing } from '../../theme/tokens';

export type BannerKind = 'error' | 'success' | 'info';

export interface BannerProps {
  kind: BannerKind;
  message: string;
}

const palette: Record<BannerKind, { text: string; background: string }> = {
  error: { text: colors.error, background: colors.errorBackground },
  success: { text: colors.success, background: colors.successBackground },
  info: { text: colors.info, background: colors.infoBackground },
};

/** Status message that is announced when it appears; errors interrupt, others wait politely. */
export function Banner({ kind, message }: BannerProps) {
  const { text, background } = palette[kind];

  return (
    <View
      accessible
      role={kind === 'error' ? 'alert' : 'status'}
      accessibilityLiveRegion={kind === 'error' ? 'assertive' : 'polite'}
      style={[styles.container, { backgroundColor: background, borderColor: text }]}
    >
      <Text style={[styles.message, { color: text }]}>
        <Text style={styles.prefix}>{prefixFor(kind)} </Text>
        {message}
      </Text>
    </View>
  );
}

// Meaning is carried by text as well as colour, so it survives colour blindness.
function prefixFor(kind: BannerKind): string {
  if (kind === 'error') return 'Error:';
  if (kind === 'success') return 'Success:';
  return 'Note:';
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, borderWidth: 2, borderRadius: 8 },
  message: { fontSize: fontSize.body },
  prefix: { fontWeight: '700' },
});
