import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, MIN_TOUCH_TARGET, spacing } from '../../theme/tokens';
import { nextIndex, type WebKeyEvent } from '../../utils/keyboard';

export interface Tab {
  key: string;
  label: string;
  content: React.ReactNode;
}

export interface TabsProps {
  /** Names the tab list, such as "Account sections". */
  label: string;
  tabs: Tab[];
  selectedKey: string;
  onSelectedChange: (key: string) => void;
}

type Focusable = { focus?: () => void } | null;

/**
 * Tabs following the WAI-ARIA tabs pattern. The list is one tab stop: Tab moves into the selected tab, arrow
 * keys move between tabs and select them, Home and End jump to the ends. Each panel is labelled by its tab.
 */
export function Tabs({ label, tabs, selectedKey, onSelectedChange }: TabsProps) {
  const refs = useRef<Focusable[]>([]);
  const [focusedKey, setFocusedKey] = useState<string | null>(null);
  const selectedIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.key === selectedKey),
  );
  const selected = tabs[selectedIndex];
  const idFor = (key: string) => `tab-${key}`;

  function handleKeyDown(event: WebKeyEvent) {
    const next = nextIndex(event.key, selectedIndex, tabs.length);
    if (next === null) return;
    event.preventDefault();
    onSelectedChange(tabs[next].key);
    refs.current[next]?.focus?.();
  }

  return (
    <View style={styles.container}>
      <View role="tablist" accessibilityLabel={label} style={styles.list}>
        {tabs.map((tab, i) => {
          const isSelected = i === selectedIndex;
          return (
            <Pressable
              key={tab.key}
              ref={(node) => {
                refs.current[i] = node as Focusable;
              }}
              id={idFor(tab.key)}
              role="tab"
              accessibilityLabel={tab.label}
              aria-selected={isSelected}
              // Only the selected tab is in the Tab order; the arrow keys reach the others. tabIndex, not
              // focusable: react-native-web's Pressable ignores focusable={false} and stays in the Tab order.
              tabIndex={isSelected ? 0 : -1}
              onPress={() => onSelectedChange(tab.key)}
              onFocus={() => setFocusedKey(tab.key)}
              onBlur={() => setFocusedKey(null)}
              // onKeyDown comes from react-native-web and is not in React Native's types; native platforms ignore it
              {...({ onKeyDown: handleKeyDown } as object)}
              style={[styles.tab, isSelected && styles.tabSelected, focusedKey === tab.key && styles.focused]}
            >
              <Text style={[styles.tabLabel, isSelected && styles.tabLabelSelected]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <View role="tabpanel" aria-labelledby={idFor(selected.key)} style={styles.panel}>
        {selected.content}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  list: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: {
    minHeight: MIN_TOUCH_TARGET,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  // Selection is shown by weight and an underline, not colour alone
  tabSelected: { borderBottomColor: colors.primary },
  focused: { outlineColor: colors.text, outlineStyle: 'solid', outlineWidth: 3, outlineOffset: -3 },
  tabLabel: { fontSize: fontSize.body, color: colors.textMuted },
  tabLabelSelected: { color: colors.text, fontWeight: '700' },
  panel: { gap: spacing.sm },
});
