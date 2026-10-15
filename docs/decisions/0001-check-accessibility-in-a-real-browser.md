# 0001: Check accessibility in a real browser, not only in unit tests

Status: accepted

## Context

The components were first checked only with Jest and React Testing Library, and all 40 tests passed. The first
run of axe-core in Chromium against the Storybook stories then reported five violations across four stories:
a loading spinner that exposed an unnamed progressbar on web, a read-only field whose text fell below AA
contrast, and a switch missing `aria-checked`. None of the unit tests could see them, because they run on the
native test renderer and not in a browser.

## Decision

Run axe-core (WCAG 2.0 to 2.2, levels A and AA) in Chromium against every Storybook story, in CI, and fail the
build on any violation. Reintroducing a fixed bug makes it fail, which was checked.

| Level | Tool | Catches | Misses |
|---|---|---|---|
| Lint | none for React Native | | `eslint-plugin-react-native-a11y` supports ESLint 8 only, and this Expo SDK needs ESLint 9 |
| Unit tests | Testing Library by role and name | wrong roles, missing names, state announcements | anything that depends on the web accessibility tree |
| Unit tests | contrast maths on the design tokens | a palette change that breaks AA | contrast of text over images or gradients |
| Browser, in CI | axe-core in Chromium over every story | the three bugs above | real screen reader behaviour (VoiceOver, TalkBack) |

Screen reader testing on real devices is still manual and has not been done here.

## Consequences

- The audit runs against the web build (react-native-web), so it says nothing about the native renderers.
- Every new component needs a story, or it is not audited.
