import { mkdir, writeFile, cp, rm } from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { root, manifest, render, site } from './render.mjs';

const output = path.join(root, 'dist');
const production = process.argv.includes('--production');
if (path.dirname(output) !== path.resolve(root) || path.basename(output) !== 'dist') throw new Error('Unsafe build directory');
// This directory contains only this project's generated artifacts, never source.
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(path.join(root, 'public'), output, { recursive: true });
await cp(path.join(root, 'src/styles'), path.join(output, 'styles'), { recursive: true });
await mkdir(path.join(output, 'scripts'), { recursive: true });
for (const script of ['theme.js', 'site.js']) await cp(path.join(root, 'src/scripts', script), path.join(output, 'scripts', script));
for (const page of manifest.routes) {
  const directory = path.join(output, page.route.slice(1));
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, 'index.html'), await render(page.route, { production }), 'utf8');
}
let revision = 'uncommitted';
try { revision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { /* New local checkout. */ }
await writeFile(path.join(output, 'release.json'), JSON.stringify({ app: 'freephotocraft-online', revision, origin: site.origin, pages: manifest.routes.length, production }) + '\n');
await writeFile(path.join(output, '404.html'), '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="robots" content="noindex"><title>404 | PhotoCraft Online</title><body style="background:#0a0a0a;color:#fafafa;font:16px system-ui;padding:48px"><h1>Page not found</h1><a href="/" style="color:inherit">Back to home</a></body></html>');
if (production) {
  const entries = manifest.routes.filter(page => site.indexablePages.includes(page.page));
  const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + entries.map(page => `<url><loc>${site.origin}${page.route === '/' ? '/' : page.route}</loc></url>`).join('\n') + '\n</urlset>\n';
  await writeFile(path.join(output, 'sitemap.xml'), sitemap);
  await writeFile(path.join(output, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /editor-app/\nDisallow: /release.json\nSitemap: ${site.origin}/sitemap.xml\n`);
  await writeFile(path.join(output, '_headers'), `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n\n/assets/fonts/*\n  Cache-Control: public, max-age=31536000, immutable\n\n/editor-app/*\n  X-Robots-Tag: noindex, nofollow\n\n/editor-app/*.wasm\n  Cache-Control: public, max-age=31536000, immutable\n\n/release.json\n  Cache-Control: no-store\n  X-Robots-Tag: noindex\n\nhttps://:worker.:account.workers.dev/*\n  X-Robots-Tag: noindex, nofollow\n`);
} else {
  await writeFile(path.join(output, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
}
console.log(`Built ${manifest.routes.length} ${production ? 'production' : 'local'} pages and the local WebAssembly editor into ${output}`);
