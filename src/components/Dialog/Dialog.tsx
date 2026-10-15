import React, { useRef } from 'react';
import { AccessibilityInfo, Modal, Platform, StyleSheet, Text, View, type ModalProps } from 'react-native';
import { colors, fontSize, spacing } from '../../theme/tokens';

export interface DialogProps {
  visible: boolean;
  title: string;
  /** Called by Escape (web), the Android back button and a tap outside the dialog. */
  onRequestClose: () => void;
  children?: React.ReactNode;
  /** The buttons that close the dialog. A dialog must always offer a visible way out. */
  actions: React.ReactNode;
}

/**
 * A modal dialog that keeps assistive tech inside it while it is open.
 *
 * On web, react-native-web's Modal gives it `role="dialog"` and `aria-modal`, closes it with Escape, keeps Tab
 * inside it, moves focus to its first control and returns focus to the opener on close; this component adds
 * the accessible name. On iOS and Android the Modal is its own window, so the page behind is out of reach;
 * this component marks the panel modal for VoiceOver and moves screen reader focus to the title on open.
 */
export function Dialog({ visible, title, onRequestClose, children, actions }: DialogProps) {
  const titleRef = useRef<React.ComponentRef<typeof Text>>(null);

  function focusTitle() {
    // On web, the Modal's focus trap moves keyboard focus in; screen readers follow it.
    if (Platform.OS !== 'web' && titleRef.current) {
      AccessibilityInfo.sendAccessibilityEvent(titleRef.current, 'focus');
    }
  }

  // Passed through to the element with role="dialog" on web; native platforms ignore it.
  const webName = { 'aria-label': title } as Partial<ModalProps>;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose}
      onShow={focusTitle}
      {...webName}
    >
      <View style={styles.backdrop}>
        {/* A mouse and touch convenience only: keyboard and screen reader users have Escape, back and the actions.
            A plain View, not a Pressable, so the browser cannot focus it: the web focus trap would otherwise
            move focus onto it when the dialog opens. */}
        <View
          testID="dialog-backdrop"
          onStartShouldSetResponder={() => true}
          onResponderRelease={onRequestClose}
          aria-hidden
          importantForAccessibility="no-hide-descendants"
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.panel} accessibilityViewIsModal>
          <Text ref={titleRef} role="heading" style={styles.title}>
            {title}
          </Text>
          {children}
          <View style={styles.actions}>{actions}</View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: 'rgba(17, 24, 39, 0.6)',
  },
  panel: {
    width: '100%',
    maxWidth: 420,
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  title: { fontSize: fontSize.title, fontWeight: '700', color: colors.text },
  actions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: spacing.sm },
});
