# 0005: Let react-native-web's Modal handle dialog focus on web

Status: accepted

## Context

A modal dialog has to move focus in when it opens, keep Tab inside it, close with Escape, return focus to
the control that opened it, and hide the page behind from screen readers. react-native-web's `Modal`
already does all of this on web (`role="dialog"`, `aria-modal`, a focus trap, Escape, focus restored on close).
It does not name the dialog.

On iOS and Android the `Modal` is a separate window, so the page behind is already out of reach, but
VoiceOver also needs `accessibilityViewIsModal`, and nothing moves screen reader focus into the dialog.

## Decision

- Wrap `Modal` rather than build a focus trap. Pass `aria-label` (the title), which react-native-web puts on
  the element with `role="dialog"`.
- On iOS and Android, move screen reader focus to the title when the dialog opens, and mark the panel with
  `accessibilityViewIsModal`.
- Make the tap-outside backdrop a plain `View` with touch handlers, not a `Pressable`. The keyboard check found
  that the web focus trap moved focus onto the backdrop when the dialog opened, because a `Pressable` can be
  focused even with `focusable={false}`. Focus now lands on the first action.

## Consequences

- Less code to maintain, and the web behaviour comes from a library that many apps exercise.
- The dialog's first action receives focus on web. Put the safe action (Cancel) first.
- If react-native-web changes its `Modal`, the keyboard check in CI will show it.
