# 0003: Test the tests with a mutation check

Status: accepted

## Context

A suite can pass without proving anything. 100% line coverage does not show that a test would fail if an
accessibility rule were removed.

## Decision

`scripts/mutation-check.py` breaks 11 rules on purpose, one at a time (for example, removing the busy state
from a button, or making a banner's alert polite), runs the suite, and fails if any run stays green. A pattern
that no longer matches the code also fails the script, so it cannot quietly stop covering a rule.

## Consequences

- It found a redundant line: removing `disabled` from the button's accessibility state changed no test result,
  because `Pressable` derives it. The line was deleted instead of tested.
- It also caught its own staleness: after a refactor one pattern no longer matched, the script reported 10 of
  11 instead of 11 of 11, and it now fails in that case.
- The patterns are tied to the code's text, so they need updating when a rule is refactored.
