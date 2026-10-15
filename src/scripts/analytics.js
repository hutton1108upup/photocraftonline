// Only the configured production origin sends events. No editor contents,
// arbitrary URLs, query strings, fragments or input values become parameters.
(() => {
  if (window.PhotoCraftAnalytics) return;
  const node = document.getElementById('site-analytics');
  if (!node) return;
  const config = JSON.parse(node.textContent);
  const enabled = config.enabled === true && /^G-[A-Z0-9]+$/.test(config.measurementId)
    && location.origin === config.origin && location.protocol === 'https:'
    && location.pathname.replace(/\/$/, '') === config.pagePath.replace(/\/$/, '')
    && !/^\/(?:zh\/)?(?:editor|cadcraft\/editor)(?:\/|$)/.test(location.pathname);
  const placements = new Set(['hero', 'header', 'mobile_nav', 'footer', 'final', 'home', 'tutorial', 'download', 'comparison', 'content']);
  const systems = new Set(['windows', 'macos', 'linux']);
  const architectures = new Set(['x64', 'arm64', 'x86', 'x86_64', 'aarch64', 'universal']);
  const formats = new Set(['msi', 'zip', 'dmg', 'appimage', 'deb', 'rpm', 'flatpak']);
  const topics = new Set(['overview', 'open', 'layers', 'export', 'save-layers', 'resize', 'crop', 'text', 'transparent', 'mask']);
  const screenshots = new Set(['tutorial-save-and-reopen-psd', 'tutorial-start-editor', 'tutorial-open-image', 'tutorial-edit-with-layers', 'tutorial-export-png', 'clone-layers-reopened', 'clone-resize-result', 'clone-crop-result', 'clone-text-edit', 'clone-transparent-canvas', 'clone-mask-edited']);
  const events = new Set(['editor_open', 'download_section_click', 'desktop_download_click', 'tutorial_click', 'platform_select', 'practice_download_click', 'screenshot_open']);
  const pageLocation = config.origin + config.pagePath;
  let referrer = '';
  try {
    const url = new URL(document.referrer);
    if (/^https?:$/.test(url.protocol)) referrer = url.origin;
  } catch { /* Empty or invalid referrer has no attribution value. */ }
  function track(name, input = {}) {
    if (!enabled || !events.has(name) || !placements.has(input.placement)) return false;
    const params = { placement: input.placement, ui_language: config.locale, page_type: config.pageType,
      page_location: pageLocation, page_referrer: referrer, send_to: config.measurementId };
    if (name === 'platform_select' || name === 'desktop_download_click') {
      if (!systems.has(input.system)) return false;
      params.system = input.system;
    }
    if (name === 'desktop_download_click') {
      if (!architectures.has(input.architecture) || !formats.has(input.file_type) || !/^\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(input.version)) return false;
      Object.assign(params, { architecture: input.architecture, file_type: input.file_type, version: input.version });
    }
    if (name === 'tutorial_click') {
      if (!topics.has(input.topic)) return false;
      params.topic = input.topic;
    }
    if (name === 'screenshot_open') {
      if (!screenshots.has(input.screenshot_id)) return false;
      params.screenshot_id = input.screenshot_id;
    }
    window.gtag('event', name, params);
    return true;
  }
  window.PhotoCraftAnalytics = Object.freeze({ track });
  if (!enabled) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', config.measurementId, {
    send_page_view: false, page_location: pageLocation, page_referrer: referrer,
    allow_google_signals: false, allow_ad_personalization_signals: false,
  });
  window.gtag('event', 'page_view', { page_location: pageLocation, page_referrer: referrer,
    page_title: document.title, send_to: config.measurementId });
  const tag = document.createElement('script');
  tag.async = true;
  tag.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.measurementId)}`;
  document.head.append(tag);

  function placement(element) {
    if (element.closest('#mobile-navigation')) return 'mobile_nav';
    if (element.closest('.site-header')) return 'header';
    if (element.closest('footer')) return 'footer';
    if (element.closest('.home-hero')) return 'hero';
    if (element.closest('.home-final')) return 'final';
    if (element.closest('#desktop-downloads, #platforms, #packages')) return 'download';
    if (element.closest('#feature-comparison')) return 'comparison';
    if (element.closest('#features')) return 'tutorial';
    return 'content';
  }
  function download(url) {
    if (url.origin !== 'https://github.com' || url.search || url.hash) return null;
    const release = url.pathname.match(/^\/storytold\/photocraft\/releases\/download\/v(\d{1,3}\.\d{1,3}\.\d{1,3})\/(photocraft-[a-zA-Z0-9._\-]+)$/);
    if (!release) return null;
    const file = release[2].slice(('photocraft-' + release[1] + '-').length);
    if (!release[2].startsWith('photocraft-' + release[1] + '-')) return null;
    let match = file.match(/^windows-(x64|arm64|x86)(-portable)?\.(msi|zip)$/);
    if (match && (match[3] === 'zip') === Boolean(match[2])) return { system: 'windows', architecture: match[1], file_type: match[3], version: release[1] };
    if (file === 'macos-universal.dmg') return { system: 'macos', architecture: 'universal', file_type: 'dmg', version: release[1] };
    match = file.match(/^linux-(x86_64|aarch64)\.(AppImage|deb|rpm|flatpak)$/);
    return match ? { system: 'linux', architecture: match[1], file_type: match[2].toLowerCase(), version: release[1] } : null;
  }
  document.addEventListener('click', event => {
    if (event.button !== 0) return;
    const button = event.target.closest?.('[data-platform-choice]');
    if (button) return void track('platform_select', { placement: placement(button), system: button.dataset.platformChoice });
    const link = event.target.closest?.('a[href]');
    if (!link || link.hasAttribute('data-image-viewer')) return;
    const url = new URL(link.href);
    const place = placement(link);
    const pkg = download(url);
    if (pkg) return void track('desktop_download_click', { placement: place, ...pkg });
    if (url.origin !== location.origin) return;
    if (/^\/(?:zh\/)?editor$/.test(url.pathname)) track('editor_open', { placement: place });
    else if (url.hash === '#desktop-downloads' && url.pathname === location.pathname) track('download_section_click', { placement: place });
    else if (/^\/(?:zh\/)?tutorial$/.test(url.pathname)) {
      const topic = topics.has(url.hash.slice(1)) ? url.hash.slice(1) : 'overview';
      track('tutorial_click', { placement: place, topic });
    } else if (url.pathname === '/assets/tutorial/practice-image.png' && link.hasAttribute('download')) track('practice_download_click', { placement: place });
  });
  document.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    const widget = event.target.closest?.('[data-platform-controls]');
    const selected = widget?.querySelector('[aria-selected="true"]');
    if (selected) track('platform_select', { placement: placement(selected), system: selected.dataset.platformChoice });
  });
})();
