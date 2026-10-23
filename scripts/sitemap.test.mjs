import assert from 'node:assert/strict';
import { test } from 'node:test';
import { sitemapLastmod } from './sitemap.mjs';

const renderDate = lastmod => sitemapLastmod({ route: '/guide', lastmod }, '2026-10-22');
test('only verified editorial dates are emitted; absent dates stay absent', () => {
  assert.equal(renderDate(undefined), '');
  assert.equal(renderDate('2026-10-19'), '<lastmod>2026-10-19</lastmod>');
  assert.equal(renderDate('2026-10-22'), '<lastmod>2026-10-22</lastmod>');
  assert.equal(renderDate('2024-02-29'), '<lastmod>2024-02-29</lastmod>');
});
test('reject invalid, impossible and future dates rather than publishing misleading XML', () => {
  for (const value of ['', null, 20261022, '2026-2-1', '2026-02-30', '2026-13-01', '2026-10-23', '<bad>']) {
    assert.throws(() => renderDate(value), /lastmod/);
  }
});
