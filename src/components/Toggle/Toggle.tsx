import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, MIN_TOUCH_TARGET, spacing } from '../../theme/tokens';

export interface ToggleProps {
  label: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
  disabled?: boolean;
}

/** A labelled switch whose whole row is the touch target and announces checked state. */
export function Toggle({ label, value, onValueChange, disabled = false }: ToggleProps) {
  return (
    <Pressable
      role="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      style={[styles.row, disabled && styles.disabled]}
    >
      <Text style={styles.label}>{label}</Text>
      <View
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        style={[styles.track, value ? styles.trackOn : styles.trackOff]}
      >
        <View style={[styles.thumb, value ? styles.thumbOn : styles.thumbOff]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: MIN_TOUCH_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  disabled: { opacity: 0.6 },
  label: { flex: 1, fontSize: fontSize.body, color: colors.text },
  track: { width: 52, height: 32, borderRadius: 16, justifyContent: 'center', padding: 2 },
  trackOn: { backgroundColor: colors.primary },
  trackOff: { backgroundColor: colors.background, borderWidth: 2, borderColor: colors.border },
  thumb: { width: 24, height: 24, borderRadius: 12 },
  thumbOn: { backgroundColor: colors.onPrimary, alignSelf: 'flex-end' },
  thumbOff: { backgroundColor: colors.border, alignSelf: 'flex-start' },
});
