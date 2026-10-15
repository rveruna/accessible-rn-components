import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, MIN_TOUCH_TARGET, spacing } from '../../theme/tokens';
import { nextIndex, type WebKeyEvent } from '../../utils/keyboard';

export interface RadioOption {
  value: string;
  label: string;
}

export interface RadioGroupProps {
  /** The question the options answer. It names the group. */
  label: string;
  options: RadioOption[];
  /** The chosen option, or null before anything is chosen. */
  value: string | null;
  onValueChange: (value: string) => void;
  /** Shown below the options, announced as an alert, and marks the group invalid. */
  error?: string;
  disabled?: boolean;
}

type Focusable = { focus?: () => void } | null;

/**
 * A group of radio buttons following the WAI-ARIA radio group pattern: one tab stop (the chosen option, or the
 * first when none is chosen), arrow keys move and choose, Space chooses the focused option.
 */
export function RadioGroup({
  label,
  options,
  value,
  onValueChange,
  error,
  disabled = false,
}: RadioGroupProps) {
  const refs = useRef<Focusable[]>([]);
  const [focusedValue, setFocusedValue] = useState<string | null>(null);
  const checkedIndex = options.findIndex((option) => option.value === value);
  const tabStop = checkedIndex === -1 ? 0 : checkedIndex;

  function choose(next: string) {
    if (!disabled && next !== value) onValueChange(next);
  }

  function handleKeyDown(index: number, event: WebKeyEvent) {
    if (disabled) return;
    if (event.key === ' ') {
      event.preventDefault(); // Space would otherwise scroll the page
      choose(options[index].value);
      return;
    }
    const next = nextIndex(event.key, index, options.length);
    if (next === null || event.key === 'Home' || event.key === 'End') return;
    event.preventDefault();
    choose(options[next].value);
    refs.current[next]?.focus?.();
  }

  return (
    <View
      role="radiogroup"
      accessibilityLabel={label}
      aria-invalid={Boolean(error)}
      aria-disabled={disabled}
      style={styles.container}
    >
      <Text style={styles.legend} aria-hidden importantForAccessibility="no">
        {label}
      </Text>
      {options.map((option, i) => {
        const checked = i === checkedIndex;
        return (
          <Pressable
            key={option.value}
            ref={(node) => {
              refs.current[i] = node as Focusable;
            }}
            role="radio"
            accessibilityLabel={option.label}
            aria-checked={checked}
            aria-disabled={disabled}
            disabled={disabled}
            // One tab stop for the group. tabIndex, not focusable: react-native-web's Pressable ignores
            // focusable={false} and stays in the Tab order.
            tabIndex={!disabled && i === tabStop ? 0 : -1}
            onPress={() => choose(option.value)}
            onFocus={() => setFocusedValue(option.value)}
            onBlur={() => setFocusedValue(null)}
            // onKeyDown comes from react-native-web and is not in React Native's types; native platforms ignore it
            {...({ onKeyDown: (event: WebKeyEvent) => handleKeyDown(i, event) } as object)}
            style={[styles.option, focusedValue === option.value && styles.focused]}
          >
            <View style={[styles.circle, error ? styles.circleError : null]}>
              {checked && <View style={styles.dot} />}
            </View>
            <Text style={styles.optionLabel}>{option.label}</Text>
          </Pressable>
        );
      })}
      {error && (
        <Text role="alert" style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  legend: { fontSize: fontSize.body, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  // The whole row is the touch target
  option: {
    minHeight: MIN_TOUCH_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: 8,
  },
  focused: { outlineColor: colors.text, outlineStyle: 'solid', outlineWidth: 3, outlineOffset: 2 },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleError: { borderColor: colors.error },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary },
  optionLabel: { flex: 1, fontSize: fontSize.body, color: colors.text },
  error: { fontSize: fontSize.label, color: colors.error },
});
