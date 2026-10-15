"""Tiny mutation check: break each rule on purpose and confirm the test suite fails.

A surviving mutation means either a missing test or redundant code. Usage:
    python3 scripts/mutation-check.py
"""
import subprocess, shutil, sys, os, re
root = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
muts = [
 ("Button no longer announces busy", "src/components/Button/Button.tsx", "accessibilityState={{ busy: loading }}", "accessibilityState={{}}"),
 ("Button ignores loading presses", "src/components/Button/Button.tsx", "disabled={inactive}", "disabled={disabled}"),
 ("Button touch target too small", "src/components/Button/Button.tsx", "minHeight: MIN_TOUCH_TARGET,", "minHeight: 30,"),
 ("Toggle sends the same value", "src/components/Toggle/Toggle.tsx", "onValueChange(!value)", "onValueChange(value)"),
 ("Toggle stops announcing checked", "src/components/Toggle/Toggle.tsx", "aria-checked={value}\n", ""),
 ("Banner not an accessibility element", "src/components/Banner/Banner.tsx", "      accessible\n", ""),
 ("Banner error becomes polite", "src/components/Banner/Banner.tsx", "kind === 'error' ? 'assertive' : 'polite'", "'polite'"),
 ("TextField error no longer an alert", "src/components/TextField/TextField.tsx", 'role="alert" ', ""),
 ("TextField hint ignores error", "src/components/TextField/TextField.tsx", "const description = error ?? helperText;", "const description = helperText;"),
 ('Dialog not modal for VoiceOver', 'src/components/Dialog/Dialog.tsx', '<View style={styles.panel} accessibilityViewIsModal>', '<View style={styles.panel}>'),
 ('Dialog stops moving focus to its title', 'src/components/Dialog/Dialog.tsx', "AccessibilityInfo.sendAccessibilityEvent(titleRef.current, 'focus');", ''),
 ('Dialog loses its name on web', 'src/components/Dialog/Dialog.tsx', "{ 'aria-label': title }", '{}'),
 ('Dialog backdrop becomes focusable', 'src/components/Dialog/Dialog.tsx', 'testID="dialog-backdrop"', 'testID="dialog-backdrop"\n          tabIndex={-1}'),
 ('Slider value no longer spoken in words', 'src/components/Slider/Slider.tsx', 'aria-valuetext={spoken}\n', ''),
 ('Slider swipe up does nothing', 'src/components/Slider/Slider.tsx', "if (event.nativeEvent.actionName === 'increment') change(snap(value + step, range));", ''),
 ('Slider works while disabled', 'src/components/Slider/Slider.tsx', 'if (!disabled && next !== value)', 'if (next !== value)'),
 ('Slider goes past its ends', 'src/utils/range.ts', 'return Math.min(max, Math.max(min, Number(stepped.toFixed(decimals))));', 'return Number(stepped.toFixed(decimals));'),
 ('Tabs stop announcing selection', 'src/components/Tabs/Tabs.tsx', 'aria-selected={isSelected}', ''),
 ('Every tab becomes a tab stop', 'src/components/Tabs/Tabs.tsx', 'tabIndex={isSelected ? 0 : -1}', 'tabIndex={0}'),
 ('Tab panel loses its label', 'src/components/Tabs/Tabs.tsx', 'aria-labelledby={idFor(selected.key)}', ''),
 ('Arrow keys stop wrapping', 'src/utils/keyboard.ts', 'return (current + 1) % count;', 'return Math.min(current + 1, count - 1);'),
 ('Radio stops announcing checked', 'src/components/RadioGroup/RadioGroup.tsx', 'aria-checked={checked}', ''),
 ('Every radio becomes a tab stop', 'src/components/RadioGroup/RadioGroup.tsx', 'tabIndex={!disabled && i === tabStop ? 0 : -1}', 'tabIndex={0}'),
 ('Space no longer chooses a radio', 'src/components/RadioGroup/RadioGroup.tsx', 'choose(options[index].value);\n      return;', 'return;'),
 ('Radio error no longer an alert', 'src/components/RadioGroup/RadioGroup.tsx', 'role="alert" style={styles.error}', 'style={styles.error}'),
 ("Muted text fails contrast", "src/theme/tokens.ts", "textMuted: '#4B5563'", "textMuted: '#9CA3AF'"),
 ("Contrast maths broken", "src/utils/contrast.ts", "(lighter + 0.05) / (darker + 0.05)", "(lighter + 0.05) / (darker + 0.06)"),
]
caught = 0
stale = 0
for name, rel, old, new in muts:
    path = os.path.join(root, rel)
    original = open(path).read()
    if old not in original:
        print(f"STALE (pattern not found): {name}"); stale += 1; continue
    open(path, "w").write(original.replace(old, new, 1))
    try:
        r = subprocess.run(["npx", "jest", "--silent"], cwd=root, capture_output=True, text=True)
    finally:
        open(path, "w").write(original)
    failed = re.search(r"Tests:\s+(\d+) failed", r.stdout + r.stderr)
    status = f"CAUGHT ({failed.group(1)} failing)" if r.returncode != 0 else "SURVIVED  <-- test gap"
    caught += r.returncode != 0
    print(f"{status:28s} {name}")
print(f"\n{caught}/{len(muts)} mutations caught")
sys.exit(0 if caught == len(muts) and stale == 0 else 1)
