# 0002: Use `aria-*` props for state that must work on web

Status: accepted

## Context

React Native has `accessibilityState` and `accessibilityElementsHidden`. On web, the `switch` role needs
`aria-checked`, and `accessibilityState` alone did not produce it, so axe reported a critical violation. The
native-only props that hide the loading spinner are ignored on web, which exposed an unnamed progressbar.

## Decision

Use `aria-checked`, `aria-disabled` and `aria-hidden` where the state has to be valid on both platforms.
React Native maps these props to its native accessibility state, so one prop serves both. Testing Library's
`toBeChecked` and `toBeDisabled` read them too, so the tests did not change.

Where React Native already derives the state, do not repeat it: `Pressable` sets the disabled state from its
`disabled` prop, and an explicit duplicate in `accessibilityState` was removed after the mutation check showed
it changed nothing.

## Consequences

- The components read as web-first. That is deliberate: the browser audit is the strongest check available.
- A reader who knows only the native props may expect `accessibilityState`; the stories and tests show the
  `aria-*` form is equivalent.
