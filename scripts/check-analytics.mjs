import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const code = await readFile(new URL('../src/scripts/analytics.js', import.meta.url), 'utf8');
const site = JSON.parse(await readFile(new URL('../site.config.json', import.meta.url), 'utf8'));
function harness(url, overrides = {}) {
  const callbacks = {}, scripts = [];
  const config = { enabled: true, measurementId: site.analytics.measurementId, origin: site.origin,
    pagePath: '/zh', pageType: 'index', locale: 'zh', ...overrides };
  const document = {
    title: 'PhotoCraft', referrer: 'https://example.com/private?private_secret=1#private_secret',
    getElementById: () => ({ textContent: JSON.stringify(config) }),
    createElement: () => ({}), head: { append: script => scripts.push(script) },
    addEventListener: (type, callback) => { callbacks[type] = callback; },
  };
  const window = {};
  const context = vm.createContext({ window, document, location: new URL(url), URL, Date });
  vm.runInContext(code, context);
  return { window, context, callbacks, scripts,
    events: name => (window.dataLayer || []).map(args => Array.from(args)).filter(args => args[0] === 'event' && (!name || args[1] === name)) };
}

for (const [url, overrides] of [
  ['http://localhost:5207/zh', {}], ['http://127.0.0.1:5207/zh', {}],
  ['https://freephotocraft-online.duckweed1014.workers.dev/zh', {}],
  ['https://preview.example.com/zh', {}], ['https://freephotocraft.online:8443/zh', {}],
  ['https://freephotocraft.online/zh/editor', { pagePath: '/zh/editor' }],
  ['https://freephotocraft.online/cadcraft/editor', { pagePath: '/cadcraft/editor' }],
  ['https://freephotocraft.online/zh', { enabled: false }],
  ['https://freephotocraft.online/zh', { measurementId: '' }],
]) {
  const h = harness(url, overrides);
  assert.equal(h.scripts.length, 0, url);
  assert.equal(h.events().length, 0, url);
  assert.equal(h.window.PhotoCraftAnalytics.track('editor_open', { placement: 'hero' }), false);
}

const h = harness('https://freephotocraft.online/zh?private_secret=1#private_secret');
assert.equal(h.scripts.length, 1);
assert.equal(h.scripts[0].src, 'https://www.googletagmanager.com/gtag/js?id=G-4M2NQH5S01');
assert.equal(h.events('page_view').length, 1);
const configCall = h.window.dataLayer.map(args => Array.from(args)).find(args => args[0] === 'config');
assert.equal(configCall[2].send_page_view, false);
assert.equal(configCall[2].allow_google_signals, false);
assert.equal(configCall[2].allow_ad_personalization_signals, false);
const track = h.window.PhotoCraftAnalytics.track;
assert.equal(track('editor_open', { placement: 'hero', filename: 'private_secret' }), true);
assert.equal(track('private_secret', { placement: 'hero' }), false);
assert.equal(track('editor_open', { placement: 'private_secret' }), false);
assert.equal(track('screenshot_open', { placement: 'home', screenshot_id: 'private_secret' }), false);
assert.equal(track('desktop_download_click', { placement: 'download', system: 'linux', architecture: 'private_secret', file_type: 'deb', version: '0.9.0' }), false);
assert.equal(track('tutorial_click', { placement: 'hero', topic: 'private_secret' }), false);

function click(href, options = {}) {
  const link = { href, hasAttribute: name => Boolean(options[name]),
    closest: selector => selector === '.home-hero' ? {} : null };
  const event = { button: 0, defaultPrevented: false,
    preventDefault() { this.defaultPrevented = true; },
    target: { closest: selector => selector === 'a[href]' ? link : null } };
  h.callbacks.click(event);
  assert.equal(event.defaultPrevented, false, 'Analytics must not delay or cancel navigation');
}
click('https://github.com/storytold/photocraft/releases/download/v0.9.0/photocraft-0.9.0-linux-x86_64.AppImage');
assert.equal(h.events('desktop_download_click').length, 1);
assert.equal(h.events('desktop_download_click')[0][2].architecture, 'x86_64');
click('https://github.com/storytold/photocraft/releases/download/v0.9.0/photocraft-0.9.0-windows-arm64-portable.zip');
assert.equal(h.events('desktop_download_click').length, 2);
click('https://github.com/storytold/photocraft/releases/download/v0.9.0/photocraft-0.9.0-macos-universal.dmg');
assert.equal(h.events('desktop_download_click').length, 3);
click('https://evil.example/photocraft-0.9.0-windows-x64.msi');
click('https://github.com/storytold/photocraft/releases/download/v0.9.0/photocraft-0.9.0-windows-x64.msi?private_secret=1');
assert.equal(h.events('desktop_download_click').length, 3);
click('https://freephotocraft.online/zh#desktop-downloads');
assert.equal(h.events('download_section_click').length, 1);
click('https://freephotocraft.online/zh/tutorial#layers');
assert.equal(h.events('tutorial_click').length, 1);
assert.equal(h.events('tutorial_click')[0][2].topic, 'layers');
click('https://freephotocraft.online/assets/tutorial/practice-image.png', { download: true });
assert.equal(h.events('practice_download_click').length, 1);
assert.ok(!JSON.stringify(h.window.dataLayer).includes('private_secret'), 'Untrusted query/referrer/filename must not enter the queue');
vm.runInContext(code, h.context);
assert.equal(h.scripts.length, 1, 'Repeated initialization must not add a tag');
assert.equal(h.events('page_view').length, 1, 'Repeated initialization must not duplicate page views');
console.log('PASS analytics: production-only origin, 9 disabled contexts, safe parameters, link classification, one initialization and native navigation.');
