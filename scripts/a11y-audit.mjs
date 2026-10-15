// Runs axe-core (WCAG 2.0-2.2 A/AA rules) in a real browser against every built story.
// Usage: npm run a11y-audit   (builds Storybook first)
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..', 'storybook-static');
const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
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
const base = `http://127.0.0.1:${server.address().port}`;

const index = JSON.parse(fs.readFileSync(path.join(root, 'index.json'), 'utf8'));
const ids = Object.entries(index.entries)
  .filter(([, entry]) => entry.type === 'story')
  .map(([id]) => id);

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 420, height: 300 } });
const page = await context.newPage();
let violations = 0;

for (const id of ids) {
  await page.goto(`${base}/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' });
  await page.waitForSelector('#storybook-root *');
  const results = await new AxeBuilder({ page })
    .include('#storybook-root')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  violations += results.violations.length;
  console.log(`${results.violations.length === 0 ? 'PASS' : 'FAIL'}  ${id}`);
  for (const v of results.violations) console.log(`   - ${v.id}: ${v.help} [${v.impact}]`);
}

await browser.close();
server.close();
console.log(`\n${violations} violations across ${ids.length} stories`);
process.exit(violations === 0 ? 0 : 1);
