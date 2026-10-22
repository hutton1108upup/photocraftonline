// Content dates are editorial metadata, never the build time or filesystem mtime.
export function sitemapLastmod(page, today) {
  if (page.lastmod === undefined) return '';
  const value = page.lastmod;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`Invalid lastmod format for ${page.route}: ${value}`);
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error(`Invalid lastmod date for ${page.route}: ${value}`);
  }
  if (value > today) throw new Error(`Future lastmod for ${page.route}: ${value}`);
  return `<lastmod>${value}</lastmod>`;
}
