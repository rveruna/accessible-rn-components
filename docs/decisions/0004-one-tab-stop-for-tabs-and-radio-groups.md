# 0004: One tab stop for tabs and radio groups, set with `tabIndex`

Status: accepted

## Context

The WAI-ARIA tabs and radio group patterns give the whole group one tab stop: Tab moves into the selected tab
or chosen option, the arrow keys move within the group, and the next Tab leaves it. Without this a keyboard
user tabs through every tab and option before reaching anything else.

The first version set `focusable={false}` on the other tabs and options. The unit tests passed, because
they read the prop, and axe passed, because it does not check the tab order. Driving the built Storybook with
a real keyboard showed every tab and option had `tabindex="0"`: react-native-web's `Pressable` ignores
`focusable={false}`.

## Decision

- Use React Native's `tabIndex` prop (`0` or `-1`), which react-native-web's `Pressable` passes through.
- Arrow keys both move focus and select, with wrapping, from one tested function (`nextIndex` in
  `src/utils/keyboard.ts`) shared by `Tabs` and `RadioGroup`.
- Add `scripts/keyboard-check.mjs`, which uses the built Storybook in Chromium with a real keyboard and mouse,
  and run it in CI. Putting `focusable={isSelected}` back makes it fail ("exactly one tab stop (0,0,0)").

## Consequences

- The tab order is checked where it actually exists, in a browser. Unit tests still cover the logic.
- On iOS and Android the screen reader moves through tabs and options one by one; the tab stop only
  matters for keyboards, so native behaviour is unchanged.
