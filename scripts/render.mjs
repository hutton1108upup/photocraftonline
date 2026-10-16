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
  const unlocalizedRoute = route.replace(/^\/zh(?=\/|$)/, '') || '/';
  const otherLanguageRoute = page.locale === 'zh' ? unlocalizedRoute : '/zh' + (route === '/' ? '' : route);
  html = html.replaceAll('{{otherLanguageRoute}}', otherLanguageRoute);
  if (site.indexablePages.includes(page.page)) {
    const analytics = { enabled: production && site.analytics?.enabled === true,
      measurementId: site.analytics?.measurementId || '', origin: site.origin,
      pagePath: route, pageType: page.page, locale: page.locale };
    html = html.replace('</body>', `<script type="application/json" id="site-analytics">${JSON.stringify(analytics).replace(/</g, '\\u003c')}</script><script src="/scripts/analytics.js" defer></script></body>`);
  }
  if (html.includes('data-image-viewer')) {
    html = html.replace('</body>', '<script src="/scripts/image-viewer.js" defer></script></body>');
  }
  if (page.page !== 'index' && site.indexablePages.includes(page.page)) {
    const zh = page.locale === 'zh';
    const prefix = zh ? '/zh' : '';
    const labels = {
      download: zh ? '下载与安装' : 'Downloads and installation',
      'download/windows': 'Windows',
      'artcraft-photocraft': zh ? 'Craft 工具导航' : 'Craft app directory',
      'vectorcraft-app': zh ? 'VectorCraft 指南' : 'VectorCraft guide',
      'wordcraft-app': zh ? 'WordCraft 文档指南' : 'WordCraft document guide',
      'gridcraft-app': zh ? 'GridCraft 表格指南' : 'GridCraft spreadsheet guide',
      'cadcraft-app': zh ? 'CADCraft 下载指南' : 'CADCraft download guide',
      'cadcraft/tutorial': zh ? 'CADCraft 图文教程' : 'CADCraft tutorial',
      'cadcraft-vs-autocad': zh ? '与 AutoCAD 对比' : 'Compare AutoCAD',
      'solidcraft-app': zh ? 'SolidCraft 指南' : 'SolidCraft guide',
      'solidcraft/download': zh ? '下载与安装' : 'Download and install',
      'solidcraft/tutorial': zh ? '安装板教程' : 'Mounting plate tutorial',
      'solidcraft-vs-fusion-360': zh ? '与 Fusion 360 对比' : 'Compare Fusion 360',
      'solidcraft/mcp': zh ? 'AI / MCP 教程' : 'AI / MCP tutorial',
      'ai-photoshop-clone': zh ? 'AI Photoshop Clone 说明' : 'AI Photoshop Clone explained',
      'effectcraft-app': zh ? 'EffectCraft 指南' : 'EffectCraft guide',
      'effectcraft/tutorial': zh ? 'EffectCraft CLI 教程' : 'EffectCraft CLI tutorial',
      'effectcraft/desktop-tutorial': zh ? 'EffectCraft 桌面教程' : 'EffectCraft desktop tutorial',
      'getartcraft-review': zh ? '有限样例评测' : 'Limited sample review',
      github: zh ? 'GitHub 与开源' : 'GitHub and open source',
      tutorial: zh ? '入门教程' : 'Beginner tutorial',
      'help/photocraft-not-loading': zh ? '加载帮助' : 'Loading help',
      'is-photocraft-safe': zh ? '安全与文件隐私' : 'Safety and file privacy',
      'photocraft-app': zh ? '软件与版本' : 'App and versions',
      'photocraft-vs-photoshop': zh ? '与 Photoshop 对比' : 'Compare Photoshop',
      'photocraft-alternatives': zh ? '替代工具' : 'Alternatives',
      about: zh ? '关于本站' : 'About this site',
    };
    const items = [{ name: zh ? '首页' : 'Home', route: prefix || '/' }];
    if (page.page === 'download/windows') items.push({ name: labels.download, route: `${prefix}/download` });
    if (['vectorcraft-app', 'wordcraft-app', 'gridcraft-app', 'getartcraft-review', 'effectcraft-app', 'effectcraft/tutorial', 'effectcraft/desktop-tutorial', 'cadcraft-app', 'cadcraft/tutorial', 'cadcraft-vs-autocad'].includes(page.page)) {
      items.push({ name: labels['artcraft-photocraft'], route: `${prefix}/artcraft-photocraft` });
    }
    if (['effectcraft/tutorial', 'effectcraft/desktop-tutorial'].includes(page.page)) {
      items.push({ name: labels['effectcraft-app'], route: `${prefix}/effectcraft-app` });
    }
    if (['cadcraft/tutorial', 'cadcraft-vs-autocad'].includes(page.page)) {
      items.push({ name: labels['cadcraft-app'], route: `${prefix}/cadcraft-app` });
    }
    if (['solidcraft/download', 'solidcraft/tutorial', 'solidcraft-vs-fusion-360', 'solidcraft/mcp'].includes(page.page)) {
      items.push({ name: labels['solidcraft-app'], route: `${prefix}/solidcraft-app` });
    }
    items.push({ name: labels[page.page] || page.title, route });
    const breadcrumbs = `<nav class="site-breadcrumbs" aria-label="${zh ? '面包屑导航' : 'Breadcrumb'}">${items.map((item, index) => `${index ? '<span aria-hidden="true">/</span>' : ''}${index === items.length - 1 ? `<span aria-current="page">${item.name}</span>` : `<a href="${item.route}">${item.name}</a>`}`).join('')}</nav>`;
    html = html.replace(/(<main\b[^>]*>)/, `$1${breadcrumbs}`);
    const schema = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, item: site.origin + (item.route === '/' ? '/' : item.route) })) };
    html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script></head>`);
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
