import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fontSize, MIN_TOUCH_TARGET, spacing } from '../../theme/tokens';

export interface TextFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  helperText?: string;
  /** When set, the field is marked invalid and the message is announced as an alert. */
  error?: string;
  secureTextEntry?: boolean;
  editable?: boolean;
}

export function TextField({
  label,
  value,
  onChangeText,
  helperText,
  error,
  secureTextEntry = false,
  editable = true,
}: TextFieldProps) {
  const description = error ?? helperText;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        accessibilityHint={description}
        accessibilityState={{ disabled: !editable }}
        aria-invalid={error ? true : undefined}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        editable={editable}
        style={[styles.input, error ? styles.inputError : undefined, !editable && styles.inputDisabled]}
      />
      {error ? (
        <Text role="alert" accessibilityLiveRegion="polite" style={styles.error}>
          {error}
        </Text>
      ) : helperText ? (
        <Text style={styles.helper}>{helperText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  label: { fontSize: fontSize.label, fontWeight: '600', color: colors.text },
  input: {
    minHeight: MIN_TOUCH_TARGET,
    paddingHorizontal: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
    fontSize: fontSize.body,
    color: colors.text,
    backgroundColor: colors.background,
  },
  inputError: { borderColor: colors.error },
  inputDisabled: { opacity: 0.6 },
  helper: { fontSize: fontSize.label, color: colors.textMuted },
  error: { fontSize: fontSize.label, color: colors.error },
});
