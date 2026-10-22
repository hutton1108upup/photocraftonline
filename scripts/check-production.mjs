import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { manifest, site, root } from './render.mjs';

const output = path.join(root, 'dist');
let bytes = 0, count = 0;
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(file);
    else {
      const info = await stat(file);
      assert.ok(info.size <= 25 * 1024 * 1024, `Asset too big for Cloudflare: ${file}`);
      assert.ok(!/\.env|\.pem|\.key$|credentials/i.test(entry.name), `Private file in public build: ${file}`);
      bytes += info.size; count++;
    }
  }
}
await walk(output);
assert.ok(count < 20000);
for (const page of manifest.routes) {
  const html = await readFile(path.join(output, page.route.slice(1), 'index.html'), 'utf8');
  assert.doesNotMatch(html, /https:\/\/www\.photocraftonline\.com|\/scripts\/reload\.js|__next_f|googletagmanager\.com/);
  assert.ok(html.includes(`href="${site.origin}${page.route === '/' ? '' : page.route}"`), `Wrong canonical: ${page.route}`);
  assert.ok(html.includes('id="site-copy"'));
  assert.ok(html.includes(`<title>${page.title.replaceAll('&', '&amp;')}</title>`), `Title does not match route manifest: ${page.route}`);
  for (const block of html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(block[1]); } catch (error) { assert.fail(`Invalid structured data on ${page.route}: ${error.message}`); }
  }
  if (site.indexablePages.includes(page.page)) {
    assert.ok(html.includes('content="index, follow"'), `Noindex on acquisition page: ${page.route}`);
  } else assert.ok(html.includes('noindex, nofollow'), `Thin/private page indexable: ${page.route}`);
  for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    const url = match[1].replaceAll('&amp;', '&');
    if (!url.startsWith('/')) continue;
    const pathname = new URL(url, site.origin).pathname;
    const relative = pathname.replace(/^\//, '');
    let candidate = path.join(output, relative);
    let info;
    try { info = await stat(candidate); } catch { throw new Error(`Missing build link: ${page.route} → ${url}`); }
    if (info.isDirectory()) await stat(path.join(candidate, 'index.html'));
  }
}
const robots = await readFile(path.join(output, 'robots.txt'), 'utf8');
assert.ok(robots.includes(`Sitemap: ${site.origin}/sitemap.xml`));
assert.ok(!robots.includes('Disallow: /\n'));
const sitemap = await readFile(path.join(output, 'sitemap.xml'), 'utf8');
assert.equal((sitemap.match(/<loc>/g) || []).length, manifest.routes.filter(page => site.indexablePages.includes(page.page)).length);
assert.ok(!sitemap.includes('/blog') && !sitemap.includes('/editor'));
const indexable = manifest.routes.filter(page => site.indexablePages.includes(page.page));
for (const page of indexable) {
  const entry = sitemap.match(/<url>.*?<\/url>/g).find(value => value.includes(`<loc>${site.origin}${page.route}</loc>`));
  assert.ok(entry, `Missing sitemap entry: ${page.route}`);
  assert.equal(entry.match(/<lastmod>(.*?)<\/lastmod>/)?.[1], page.lastmod, `Incorrect editorial date: ${page.route}`);
}
const headers = await readFile(path.join(output, '_headers'), 'utf8');
for (const route of ['/editor-app', '/cadcraft-engine']) {
  assert.ok(headers.split('\n\n').some(block => block.startsWith(`${route}\n`) && /X-Robots-Tag: noindex\b/.test(block)), `Engine entry missing noindex: ${route}`);
  assert.ok(!robots.split('\n').includes(`Disallow: ${route}`), `Engine entry must be crawlable to read noindex: ${route}`);
}
const llms = await readFile(path.join(output, 'llms.txt'), 'utf8');
const llmsLinks = [...llms.matchAll(/\]\((https:\/\/[^)]+)\)/g)].map(match => match[1]);
assert.deepEqual([...llmsLinks].sort(), indexable.map(page => site.origin + page.route).sort(), 'LLM directory must link each indexable route once and exclude other routes');
assert.ok(llms.includes('## English guides') && llms.includes('## 中文指南'), 'LLM directory must include both languages');
const release = JSON.parse(await readFile(path.join(output, 'release.json'), 'utf8'));
assert.equal(release.production, true);
assert.equal(release.origin, site.origin);
const engine = manifest.assets.find(asset => asset.local.endsWith('.wasm'));
assert.equal((await stat(path.join(output, engine.local.slice(1)))).size, 24710609);
console.log(`PASS production: ${manifest.routes.length} pages, ${count} files, ${bytes} bytes, correct domain/indexing/local editor.`);
