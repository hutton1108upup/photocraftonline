import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const manifest = JSON.parse(await readFile(path.join(root, 'src/site-manifest.json'), 'utf8'));
export const site = JSON.parse(await readFile(path.join(root, 'site.config.json'), 'utf8'));
export const routes = new Map(manifest.routes.map(page => [page.route, page]));

export async function render(route, { liveReload = false, production = false } = {}) {
  const page = routes.get(route);
  if (!page) return null;
  let html = await readFile(path.join(root, 'src/pages', page.locale, `${page.page}.html`), 'utf8');
  const includes = [...html.matchAll(/<!-- @include ([a-z]+\/[a-z]+) -->/g)];
  for (const include of includes) {
    const partial = await readFile(path.join(root, 'src/partials', `${include[1]}.html`), 'utf8');
    html = html.replace(include[0], partial);
  }
  const copy = JSON.parse(await readFile(path.join(root, 'src/content', `${page.locale}.json`), 'utf8'));
  const options = {
    yourSystem: copy.download.platforms.your_system,
    openMenu: page.locale === 'zh' ? '打开菜单' : 'Open menu',
    closeMenu: page.locale === 'zh' ? '关闭菜单' : 'Close menu',
  };
  html = html.replace('</body>', `<script type="application/json" id="site-copy">${JSON.stringify(options).replace(/</g, '\\u003c')}</script>${liveReload ? '<script src="/scripts/reload.js" defer></script>' : ''}</body>`);
  if (production) {
    const hostname = new URL(site.origin).hostname;
    html = html.replaceAll('https://www.photocraftonline.com', site.origin)
      .replaceAll('editor.photocraftonline.com', `${hostname}/editor-app/`)
      .replaceAll('photocraftonline.com', hostname);
    const canonical = site.origin + (route === '/' ? '' : route);
    html = html.replace(/<link\b[^>]*rel="canonical"[^>]*>/g, '');
    html = html.replace('</head>', `<link rel="canonical" href="${canonical}"/></head>`);
    if (site.indexablePages.includes(page.page)) {
      html = html.replace(/<meta\s+content="noindex, nofollow"\s+name="robots"\s*\/?\s*>/, '<meta name="robots" content="index, follow"/>');
    }
  }
  return html;
}
