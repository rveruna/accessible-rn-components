# accessible-rn-components

[![CI](https://github.com/rveruna/accessible-rn-components/actions/workflows/ci.yml/badge.svg)](https://github.com/rveruna/accessible-rn-components/actions/workflows/ci.yml)
[![CodeQL](https://github.com/rveruna/accessible-rn-components/actions/workflows/codeql.yml/badge.svg)](https://github.com/rveruna/accessible-rn-components/actions/workflows/codeql.yml)

**[Try the components in Storybook](https://rveruna.github.io/accessible-rn-components/)**, with the accessibility panel open.

[![Keyboard-only walkthrough of the example form: Tab moves a visible focus ring through the email field, toggle and buttons, Space switches the toggle on, an invalid email shows an inline error, and once it is fixed, saving shows a spinner and then a success banner](docs/demo.gif)](https://rveruna.github.io/accessible-rn-components/)

A small React Native component library (Button, TextField, Toggle, Banner) built to show how I approach
accessibility, testing and design systems: accessibility is checked at four levels, and the checks are
themselves tested.

| | | |
|---|---|---|
| ![Primary button](docs/screenshots/button-primary.png) | ![Secondary button](docs/screenshots/button-secondary.png) | ![Loading button](docs/screenshots/button-loading.png) |
| ![Text field with error](docs/screenshots/textfield-error.png) | ![Text field with helper text](docs/screenshots/textfield-helper.png) | ![Toggle on](docs/screenshots/toggle-on.png) |
| ![Error banner](docs/screenshots/banner-error.png) | ![Success banner](docs/screenshots/banner-success.png) | |

## What is in it

| Component | Accessibility decisions |
|---|---|
| `Button` | Role `button`, label as accessible name, `busy` state while loading, ignores presses when disabled or loading, 44pt minimum touch target, spinner hidden from assistive tech |
| `TextField` | Visible label doubles as the accessible name, helper text or error used as the hint, error announced as an alert and the field marked invalid, read-only state keeps full text contrast |
| `Toggle` | Role `switch` with checked state, the whole row is the touch target, disabled state announced |
| `Banner` | Errors are announced assertively as alerts, other messages politely as status, meaning is carried by text as well as colour |
| Design tokens | Every text and background colour pair is checked against WCAG AA in the tests |

## How it is tested

1. **Unit tests** with React Native Testing Library, written against roles and accessible names, not implementation details (41 tests, 100% statement and line coverage, enforced by a coverage threshold).
2. **Contrast tests** that compute WCAG contrast ratios for every colour pair in the design tokens.
3. **Browser audit**: `npm run a11y-audit` builds Storybook and runs axe-core (WCAG 2.0 to 2.2, A and AA rules) in Chromium against all 15 stories. Currently 0 violations.
4. **Mutation check**: `npm run mutation-check` deliberately breaks 11 accessibility rules one at a time and confirms the test suite fails each time (11 of 11 caught).

All four run in CI.

## What the checks found

- **The browser audit caught three real bugs that the unit tests did not.** The loading spinner exposed an unnamed `progressbar` on web (the native-only hiding props are ignored there), the read-only field used opacity and dropped below AA contrast, and the `switch` role on web needs `aria-checked`, which `accessibilityState` alone did not provide. I fixed all three and the audit now guards them: reintroducing the spinner bug makes it fail.
- **The mutation check found redundant code.** One mutation (removing `disabled` from the button's accessibility state) survived because `Pressable` already derives that state from its `disabled` prop. The line was redundant, not under-tested, so I deleted it.
- **A `View` with a role is not an accessibility element unless it is marked `accessible`.** The Banner tests failed until I added it, which is exactly the kind of bug a screen reader user would hit.

## Practices

- **CI on every push:** lint, a Prettier check, an audit of production dependencies (high severity and above), the type-check, the tests with coverage, the mutation check and the browser accessibility audit.
- **Before every commit:** a Husky hook formats and lints the staged files.
- **Kept current and watched:** Dependabot groups weekly updates, and CodeQL scans every push.
- **Decisions are written down:** [docs/decisions](docs/decisions) records the choices that were not obvious, with their evidence, including [what each level of accessibility checking catches and misses](docs/decisions/0001-check-accessibility-in-a-real-browser.md).
- **A clean dependency split:** the library needs only `react` and `react-native`, declared as peer dependencies; everything else is development tooling, so `npm audit --omit=dev` is meaningful.

## Run it

```bash
npm install
npm test                # unit and contrast tests
npm run test:coverage   # with coverage thresholds
npm run lint
npm run format       # Prettier
npm run typecheck
npm run storybook       # http://localhost:6006, with the accessibility panel
npm run mutation-check
npm run a11y-audit      # builds Storybook, audits every story in Chromium
```

`App.tsx` is a small demo screen that uses all four components (`npm run web`).

## Limits and next steps

- The browser audit runs against the web build (react-native-web). Automated checks find only part of the
  real problems, so VoiceOver and TalkBack behaviour still needs manual testing on devices, which I
  have not automated here.
- The palette is a demo, not a brand system. Dark mode and dynamic type scaling are not covered yet.
- Next: a `Select` and a modal with focus management, which is where accessibility usually gets hard.

## Stack

Expo SDK 57, React Native 0.86, React 19, TypeScript (strict), Jest with jest-expo, React Native Testing Library 14,
Storybook 10 with react-native-web-vite and the accessibility add-on, Playwright and axe-core.

## Licence

MIT
