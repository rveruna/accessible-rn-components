// Uses the built Storybook with a real keyboard and mouse in Chromium, for the behaviour that unit tests can
// only simulate and axe does not check: where focus goes, how many tab stops a group has, what the keys do.
// It caught a bug both missed: react-native-web's Pressable ignores focusable={false}, so every tab and radio
// button was its own tab stop.
// Usage: npm run keyboard-check   (builds Storybook first; in CI it reuses the build from the a11y audit)
import { chromium } from 'playwright';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..', 'storybook-static');
const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
};
const server = http.createServer((req, res) => {
  const file = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, { 'content-type': types[path.extname(file)] ?? 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}/iframe.html?viewMode=story&id=`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 600, height: 500 } });
let failures = 0;
const check = (label, passed) => {
  failures += passed ? 0 : 1;
  console.log(`${passed ? 'PASS' : 'FAIL'}  ${label}`);
};
const open = async (id) => {
  await page.goto(base + id);
  await page.waitForSelector('#storybook-root *');
  await page.waitForTimeout(300);
};
/** The focused element as `role "name"`, for example `button "Cancel"`. */
const focused = () =>
  page.evaluate(() => {
    const el = document.activeElement;
    return `${el?.getAttribute('role') ?? el?.tagName.toLowerCase()} "${el?.getAttribute('aria-label') ?? ''}"`;
  });
const press = async (...keys) => {
  for (const key of keys) await page.keyboard.press(key);
  await page.waitForTimeout(150);
};

// Dialog: focus moves in, stays in, and comes back
await open('components-dialog--closed');
await press('Tab', 'Enter');
await page.waitForTimeout(400);
check('Dialog: opening moves focus to its first action', (await focused()) === 'button "Cancel"');
check(
  'Dialog: named by its title',
  (await page.getAttribute('[role="dialog"]', 'aria-label')) === 'Delete your account?',
);
const stops = new Set();
let inside = true;
for (let i = 0; i < 5; i++) {
  await press(i % 2 ? 'Shift+Tab' : 'Tab');
  inside &&= await page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]')));
  stops.add(await focused());
}
check(
  `Dialog: Tab and Shift+Tab stay on its buttons (${[...stops].join(', ')})`,
  inside && [...stops].every((s) => s.startsWith('button')),
);
await press('Escape');
await page.waitForTimeout(400);
check('Dialog: Escape closes it', (await page.locator('[role="dialog"]').count()) === 0);
check('Dialog: focus returns to the button that opened it', (await focused()) === 'button "Delete account"');

// Slider: keys and pointer
await open('components-slider--money');
await press('Tab');
const slider = page.locator('[role="slider"]');
const value = async () =>
  `${await slider.getAttribute('aria-valuenow')} ${await slider.getAttribute('aria-valuetext')}`;
check('Slider: reached with Tab', (await focused()) === 'slider "Monthly savings"');
await press('ArrowRight');
check('Slider: ArrowRight adds a step', (await value()) === '175 £175');
await press('PageUp');
check('Slider: Page Up adds a tenth of the range', (await value()) === '225 £225');
await press('End');
check('Slider: End goes to the maximum', (await value()) === '500 £500');
await press('Home');
check('Slider: Home goes to the minimum', (await value()) === '0 £0');
const box = await slider.boundingBox();
const at = (fraction) => [box.x + 14 + (box.width - 28) * fraction, box.y + box.height / 2];
await page.mouse.click(...at(0.75));
check('Slider: a click sets the value under the pointer', (await value()) === '375 £375');
await page.mouse.move(...at(0.2));
await page.mouse.down();
await page.mouse.move(...at(0.9), { steps: 8 });
await page.mouse.up();
check('Slider: a drag follows the pointer', (await value()) === '450 £450');

// Tabs and radio group: one tab stop, arrows inside, Tab out and back
for (const [id, role, start] of [
  ['components-tabs--first-selected', 'tab', 'Profile'],
  ['components-radiogroup--chosen', 'radio', 'Text message'],
]) {
  await open(id);
  const tabIndexes = await page.$$eval(`[role="${role}"]`, (els) =>
    els.map((el) => el.getAttribute('tabindex')),
  );
  check(
    `${role}: exactly one tab stop (${tabIndexes.join(',')})`,
    tabIndexes.filter((t) => t === '0').length === 1,
  );
  await press('Tab');
  check(`${role}: Tab lands on ${start}`, (await focused()) === `${role} "${start}"`);
  await press('ArrowRight', 'ArrowRight');
  const current = await focused();
  check(
    `${role}: the arrow keys move focus within the group (now ${current})`,
    current.startsWith(`${role} `) && current !== `${role} "${start}"`,
  );
  check(
    `${role}: and select what they move to`,
    (await page.getAttribute(
      `[role="${role}"][aria-${role === 'tab' ? 'selected' : 'checked'}="true"]`,
      'aria-label',
    )) === current.split('"')[1],
  );
  await press('Tab');
  check(`${role}: Tab leaves the group`, !(await focused()).startsWith(`${role} `));
  await press('Shift+Tab');
  check(`${role}: Shift+Tab comes back to the current one`, (await focused()) === current);
}

await browser.close();
server.close();
console.log(failures === 0 ? '\nAll keyboard checks passed' : `\n${failures} keyboard check(s) failed`);
process.exit(failures === 0 ? 0 : 1);
