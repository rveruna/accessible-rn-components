import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  type AccessibilityActionEvent,
  type GestureResponderEvent,
} from 'react-native';
import { colors, fontSize, MIN_TOUCH_TARGET, spacing } from '../../theme/tokens';
import type { WebKeyEvent } from '../../utils/keyboard';
import { snap, valueAfterKey, valueAtPosition } from '../../utils/range';

export interface SliderProps {
  label: string;
  value: number;
  onValueChange: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** What a screen reader says for a value, such as "£40" rather than "40". */
  formatValue?: (value: number) => string;
  disabled?: boolean;
}

const THUMB = 28;

/**
 * A slider that works by drag, keyboard and screen reader. VoiceOver and TalkBack change it with a swipe up or
 * down (increment and decrement actions); on web the arrow, Page and Home/End keys work. The value is spoken
 * through `formatValue`.
 */
export function Slider({
  label,
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  formatValue = String,
  disabled = false,
}: SliderProps) {
  const range = { min, max, step };
  const [trackWidth, setTrackWidth] = useState(0);
  const [focused, setFocused] = useState(false);

  function change(next: number) {
    if (!disabled && next !== value) onValueChange(next);
  }

  function dragTo(event: GestureResponderEvent) {
    change(valueAtPosition(event.nativeEvent.locationX - THUMB / 2, trackWidth, range));
  }

  function handleAction(event: AccessibilityActionEvent) {
    if (event.nativeEvent.actionName === 'increment') change(snap(value + step, range));
    if (event.nativeEvent.actionName === 'decrement') change(snap(value - step, range));
  }

  function handleKeyDown(event: WebKeyEvent) {
    const next = valueAfterKey(event.key, value, range);
    if (next === null) return;
    event.preventDefault(); // arrows and Page keys would otherwise scroll the page
    change(next);
  }

  const fraction = max > min ? (value - min) / (max - min) : 0;
  const spoken = formatValue(value);

  return (
    <View style={styles.container}>
      <View style={styles.header} aria-hidden importantForAccessibility="no-hide-descendants">
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{spoken}</Text>
      </View>
      <View
        role="slider"
        accessible
        focusable={!disabled}
        accessibilityLabel={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={spoken}
        aria-disabled={disabled}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={handleAction}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        // onKeyDown comes from react-native-web and is not in React Native's types; native platforms ignore it
        {...({ onKeyDown: handleKeyDown } as object)}
        onStartShouldSetResponder={() => !disabled}
        onMoveShouldSetResponder={() => !disabled}
        onResponderGrant={dragTo}
        onResponderMove={dragTo}
        onLayout={(event) => setTrackWidth(Math.max(0, event.nativeEvent.layout.width - THUMB))}
        style={[styles.touchArea, disabled && styles.disabled, focused && styles.focused]}
      >
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${fraction * 100}%` }]} />
        </View>
        <View style={[styles.thumb, { left: fraction * trackWidth }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  // Only the track and thumb fade when disabled: fading the label and value would fail text contrast
  disabled: { opacity: 0.6 },
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  label: { fontSize: fontSize.body, color: colors.text },
  value: { fontSize: fontSize.body, fontWeight: '600', color: colors.text },
  // The whole 44pt-high strip is the touch target, not just the thin track
  touchArea: { height: MIN_TOUCH_TARGET, justifyContent: 'center', borderRadius: 8 },
  focused: { outlineColor: colors.text, outlineStyle: 'solid', outlineWidth: 3, outlineOffset: 2 },
  // The track and thumb ignore touches, so a drag's position is always measured from the touch strip
  track: {
    pointerEvents: 'none',
    height: 6,
    marginHorizontal: THUMB / 2,
    borderRadius: 3,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: colors.primary },
  thumb: {
    pointerEvents: 'none',
    position: 'absolute',
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    borderWidth: 3,
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
});
