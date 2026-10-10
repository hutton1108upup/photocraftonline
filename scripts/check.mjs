import assert from 'node:assert/strict';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { root, manifest, render, routes } from './render.mjs';

const base = process.env.CHECK_BASE_URL || 'http://127.0.0.1:5173';
const checkedAssets = new Set();
const report = { base, pages: [], assets: 0, localLinks: 0, engineBytes: 0 };

async function checkLocalAsset(url) {
  const key = url.split('?')[0];
  if (checkedAssets.has(key)) return;
  checkedAssets.add(key);
  const response = await fetch(base + url, { method: 'HEAD' });
  assert.equal(response.status, 200, `Missing asset ${url}`);
  if (key.endsWith('.wasm')) assert.match(response.headers.get('content-type'), /application\/wasm/);
  if (key.endsWith('.js')) assert.match(response.headers.get('content-type'), /javascript/);
  if (key.endsWith('.css')) assert.match(response.headers.get('content-type'), /text\/css/);
}

for (const page of manifest.routes) {
  const response = await fetch(base + page.route);
  assert.equal(response.status, 200, `Route ${page.route}`);
  assert.equal(response.headers.get('x-photocraft-local'), '1', 'Wrong app on preview port');
  assert.match(response.headers.get('content-type'), /text\/html/);
  const html = await response.text();
  assert.ok(html.includes(`<title>${page.title.replaceAll('&', '&amp;')}</title>`), `Title ${page.route}`);
  assert.ok(html.includes('noindex, nofollow'), 'Local pages must not be indexed');
  assert.doesNotMatch(html, /__next_f|googletagmanager\.com|gtag\('config'|https:\/\/editor\.photocraftonline\.com\/index\.html/, `Upstream runtime dependency: ${page.route}`);
  assert.ok(!html.includes('<!-- @include'), `Unresolved partial ${page.route}`);
  const source = await render(page.route);
  assert.ok(source.includes('id="site-copy"'), `Missing runtime labels ${page.route}`);
  for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    const url = match[1].replaceAll('&amp;', '&');
    if (!url.startsWith('/')) continue;
    const pathname = new URL(url, base).pathname.replace(/\/$/, '') || '/';
    if (routes.has(pathname)) { report.localLinks++; continue; }
    await checkLocalAsset(url);
  }
  for (const match of html.matchAll(/(?:srcset|imagesrcset)="([^"]+)"/g)) {
    for (const value of match[1].split(',')) await checkLocalAsset(value.trim().split(' ')[0]);
  }
  report.pages.push({ route: page.route, title: page.title, status: 200 });
}

for (const asset of manifest.assets) {
  assert.ok(!asset.upstream_status, `Unresolved upstream asset ${asset.source}`);
  const file = path.join(root, 'public', asset.local.slice(1));
  const info = await stat(file);
  assert.ok(info.size > 0, `Empty ${asset.local}`);
  // Original CSS has its font URLs rewritten; binary assets stay byte-for-byte.
  if (!asset.local.endsWith('.css')) {
    const digest = createHash('sha256').update(await readFile(file)).digest('hex');
    assert.equal(digest, asset.sha256, `Modified baseline binary ${asset.local}`);
  } else {
    const css = await readFile(file, 'utf8');
    for (const match of css.matchAll(/url\((\/[^)]+)\)/g)) await checkLocalAsset(match[1]);
  }
  await checkLocalAsset(asset.local);
  if (asset.local.endsWith('.wasm')) report.engineBytes = info.size;
}
const editor = await (await fetch(base + '/editor-app/index.html')).text();
assert.ok(editor.includes('photocraft_canvas'));
assert.ok(editor.includes('TrunkApplicationStarted'));
assert.equal((await fetch(base + '/not-a-real-page')).status, 404);
assert.equal((await fetch(base + '/__health', { method: 'POST' })).status, 405);
report.assets = checkedAssets.size;
await mkdir(path.join(root, 'evidence'), { recursive: true });
await writeFile(path.join(root, 'evidence', 'checks.json'), JSON.stringify(report, null, 2) + '\n');
console.log(`PASS: ${report.pages.length} routes, ${report.assets} local assets, ${report.localLinks} internal links, ${report.engineBytes} editor bytes; no production scripts.`);
