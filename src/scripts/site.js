// Public-facing interactions, independent from the original Next.js server.
const copy = JSON.parse(document.getElementById('site-copy').textContent);
const locale = document.body.dataset.locale;

// The editor's original 32px site toolbar hides after three seconds so it
// doesn't cover the canvas application's File/Edit menu.
if (document.body.dataset.page === 'editor' && !document.getElementById('photocraft-frame')) {
  const toolbar = document.querySelector('header');
  let timer;
  const scheduleHide = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      toolbar.classList.remove('translate-y-0');
      toolbar.classList.add('-translate-y-full');
    }, 3000);
  };
  const show = () => {
    toolbar.classList.remove('-translate-y-full');
    toolbar.classList.add('translate-y-0');
    scheduleHide();
  };
  toolbar.addEventListener('mouseenter', show);
  toolbar.addEventListener('focusin', show);
  window.addEventListener('mousemove', event => { if (event.clientY <= 12) show(); });
  scheduleHide();
}

function setAccordion(trigger, open) {
  const panel = document.getElementById(trigger.getAttribute('aria-controls'));
  trigger.setAttribute('aria-expanded', String(open));
  const item = trigger.closest('[data-slot="accordion-item"]');
  for (const element of [item, trigger.parentElement, trigger, panel]) {
    element.toggleAttribute('data-open', open);
    element.toggleAttribute('data-closed', !open);
  }
  panel.hidden = !open;
}

document.querySelectorAll('[data-slot="accordion-trigger"]').forEach(trigger => {
  trigger.addEventListener('click', () => {
    const open = trigger.getAttribute('aria-expanded') !== 'true';
    const accordion = trigger.closest('[data-slot="accordion"]');
    if (open) accordion.querySelectorAll('[data-slot="accordion-trigger"]').forEach(other => {
      if (other !== trigger) setAccordion(other, false);
    });
    setAccordion(trigger, open);
  });
  trigger.addEventListener('keydown', event => {
    const buttons = [...trigger.closest('[data-slot="accordion"]').querySelectorAll('[data-slot="accordion-trigger"]')];
    const index = buttons.indexOf(trigger);
    const next = { ArrowDown: (index + 1) % buttons.length, ArrowUp: (index - 1 + buttons.length) % buttons.length, Home: 0, End: buttons.length - 1 }[event.key];
    if (next !== undefined) { event.preventDefault(); buttons[next].focus(); }
  });
});

const mobileButton = document.querySelector('header button[aria-label]');
if (mobileButton) {
  const header = mobileButton.closest('header');
  const menu = document.createElement('div');
  menu.id = 'mobile-navigation';
  menu.className = 'site-mobile-menu border-border border-t px-4 pt-2 pb-4';
  menu.hidden = true;
  const nav = header.querySelector('nav').cloneNode(true);
  nav.className = 'flex flex-col gap-2';
  const action = header.querySelector('.site-desktop-action a').cloneNode(true);
  action.querySelector('svg')?.remove();
  action.className = header.querySelector('.site-desktop-action a').className;
  const bottom = document.createElement('div');
  bottom.className = 'border-border mt-3 flex items-center gap-2 border-t pt-3';
  const spacer = document.createElement('div');
  spacer.className = 'flex-1';
  const languageLink = header.querySelector('[data-language-switch]').cloneNode(true);
  bottom.append(languageLink, spacer, action);
  menu.append(nav, bottom);
  header.append(menu);
  mobileButton.setAttribute('aria-controls', menu.id);
  const originalIcon = mobileButton.innerHTML;
  const closeIcon = '<svg aria-hidden="true" class="lucide lucide-x size-5" fill="none" height="24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>';
  const close = () => {
    menu.querySelectorAll('details[open]').forEach(group => { group.open = false; });
    menu.hidden = true;
    mobileButton.setAttribute('aria-expanded', 'false');
    mobileButton.setAttribute('aria-label', copy.openMenu);
    mobileButton.innerHTML = originalIcon;
  };
  mobileButton.setAttribute('aria-label', copy.openMenu);
  mobileButton.addEventListener('click', () => {
    if (!menu.hidden) return close();
    menu.hidden = false;
    mobileButton.setAttribute('aria-expanded', 'true');
    mobileButton.setAttribute('aria-label', copy.closeMenu);
    mobileButton.innerHTML = closeIcon;
  });
  menu.addEventListener('click', event => { if (event.target.closest('a')) close(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden && !menu.querySelector('details[open]')) {
      close();
      mobileButton.focus();
    }
  });
  window.matchMedia('(min-width: 1100px)').addEventListener('change', event => { if (event.matches) close(); });
}

// Native details keep navigation usable without JavaScript. Enhance closing,
// one-open-group behavior and current-page indication for desktop and its clone.
const navigationGroups = [...document.querySelectorAll('.site-header details.site-nav-group')];
for (const group of navigationGroups) {
  group.addEventListener('toggle', () => {
    if (!group.open) return;
    for (const other of group.closest('nav').querySelectorAll('details[open]')) {
      if (other !== group) other.open = false;
    }
  });
  const summary = group.querySelector('summary');
  summary.addEventListener('keydown', event => {
    if (event.key !== 'ArrowDown') return;
    event.preventDefault();
    group.open = true;
    group.querySelector('a').focus();
  });
  group.addEventListener('click', event => {
    if (event.target.closest('a')) group.open = false;
  });
}
function updateNavigationCurrent() {
  for (const nav of document.querySelectorAll('.site-header nav')) {
    const links = [...nav.querySelectorAll('a')];
    const exactHashLink = links.some(link => {
      const target = new URL(link.href);
      return target.pathname === location.pathname && target.hash && target.hash === location.hash;
    });
    for (const group of nav.querySelectorAll('.site-nav-group')) delete group.dataset.current;
    for (const link of links) {
      link.removeAttribute('aria-current');
      const target = new URL(link.href);
      const exactPage = target.pathname === location.pathname;
      const childPage = link.dataset.navSection && location.pathname.startsWith(target.pathname + '/');
      if ((exactPage && (exactHashLink ? target.hash === location.hash : !target.hash)) || childPage) {
        link.setAttribute('aria-current', target.hash ? 'location' : childPage ? 'true' : 'page');
        const group = link.closest('.site-nav-group');
        if (group) group.dataset.current = 'true';
      }
    }
  }
}
updateNavigationCurrent();
window.addEventListener('hashchange', updateNavigationCurrent);

// Server-rendered links work without JS; add the current query and anchor for
// desktop and cloned mobile language links after enhancement.
function updateLanguageLinks() {
  const current = location.pathname.replace(/^\/zh(?=\/|$)/, '').replace(/\/$/, '') || '/';
  for (const link of document.querySelectorAll('[data-language-switch]')) {
    const target = link.dataset.languageSwitch === 'zh' ? '/zh' + (current === '/' ? '' : current) : current;
    link.href = target + location.search + location.hash;
  }
}
updateLanguageLinks();
window.addEventListener('hashchange', updateLanguageLinks);
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  const activeGroup = document.activeElement?.closest('.site-nav-group');
  const groups = activeGroup?.open ? [activeGroup] : navigationGroups.filter(group => group.open);
  for (const group of groups) group.open = false;
  if (groups.length) groups[0].querySelector('summary').focus();
});
document.addEventListener('click', event => {
  for (const group of navigationGroups) {
    if (group.open && !group.contains(event.target)) group.open = false;
  }
});

const languageButton = document.querySelector('[data-slot="dropdown-menu-trigger"]');
if (languageButton) {
  const menu = document.createElement('div');
  menu.id = 'language-menu';
  menu.className = 'local-language-menu rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10';
  menu.setAttribute('role', 'menu');
  menu.setAttribute('aria-labelledby', languageButton.id);
  menu.hidden = true;
  for (const [language, label] of [['en', 'English'], ['zh', '中文']]) {
    const link = document.createElement('a');
    link.dataset.language = language;
    link.setAttribute('role', 'menuitem');
    link.className = 'relative flex items-center justify-between gap-2 rounded-md px-2 py-2 text-sm font-normal outline-none';
    link.textContent = label;
    const current = location.pathname.replace(/^\/zh(?=\/|$)/, '').replace(/\/$/, '') || '/';
    link.href = (language === 'zh' ? '/zh' + (current === '/' ? '' : current) : current) + location.search + location.hash;
    if (language === locale) {
      link.insertAdjacentHTML('beforeend', '<svg aria-hidden="true" class="lucide lucide-check size-3.5" fill="none" height="24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M20 6 9 17l-5-5"></path></svg>');
    }
    menu.append(link);
  }
  document.body.append(menu);
  languageButton.setAttribute('aria-controls', menu.id);
  languageButton.setAttribute('aria-expanded', 'false');
  function positionMenu() {
    const rect = languageButton.getBoundingClientRect();
    const width = Math.max(rect.width, 128);
    menu.style.width = `${width}px`;
    menu.style.left = `${Math.min(window.innerWidth - width - 8, Math.max(8, rect.right - width))}px`;
    const fitsBelow = rect.bottom + menu.offsetHeight + 8 < window.innerHeight;
    menu.style.top = `${fitsBelow ? rect.bottom + 4 : rect.top - menu.offsetHeight - 4}px`;
  }
  function closeLanguage(returnFocus = false) {
    menu.hidden = true;
    languageButton.setAttribute('aria-expanded', 'false');
    if (returnFocus) languageButton.focus();
  }
  function openLanguage() {
    const current = location.pathname.replace(/^\/zh(?=\/|$)/, '').replace(/\/$/, '') || '/';
    menu.querySelectorAll('[data-language]').forEach(link => {
      link.href = (link.dataset.language === 'zh' ? '/zh' + (current === '/' ? '' : current) : current) + location.search + location.hash;
    });
    menu.hidden = false;
    languageButton.setAttribute('aria-expanded', 'true');
    positionMenu();
    menu.querySelector('[role="menuitem"]').focus();
  }
  languageButton.addEventListener('click', () => menu.hidden ? openLanguage() : closeLanguage());
  languageButton.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); openLanguage(); }
  });
  document.addEventListener('click', event => {
    if (!menu.contains(event.target) && !languageButton.contains(event.target)) closeLanguage();
  });
  menu.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); closeLanguage(true); return; }
    if (event.key === 'Tab') { closeLanguage(); return; }
    const items = [...menu.querySelectorAll('[role="menuitem"]')];
    const index = items.indexOf(document.activeElement);
    const next = { ArrowDown: (index + 1) % items.length, ArrowUp: (index - 1 + items.length) % items.length, Home: 0, End: items.length - 1 }[event.key];
    if (next !== undefined) { event.preventDefault(); items[next].focus(); }
  });
  window.addEventListener('resize', () => { if (!menu.hidden) positionMenu(); });
  window.addEventListener('scroll', () => { if (!menu.hidden) positionMenu(); }, { passive: true });
}

function detectDownloadSystem() {
  const ua = navigator.userAgent;
  // iPad desktop mode reports MacIntel; Android often reports Linux.
  const mobile = navigator.userAgentData?.mobile || /android|iphone|ipad|ipod/i.test(ua)
    || (/mac/i.test(navigator.platform) && navigator.maxTouchPoints > 1);
  const platform = navigator.userAgentData?.platform || navigator.platform || ua;
  const system = mobile || /cros|chrome\s?os/i.test(platform + ' ' + ua) ? null
    : /win/i.test(platform) ? 'windows' : /mac/i.test(platform) ? 'macos' : /linux/i.test(platform) ? 'linux' : null;
  return { mobile, system };
}

// Keep all systems in the HTML; enhance to keyboard-accessible tabs only when
// JavaScript runs. System detection recommends a platform, never a CPU or file.
for (const widget of document.querySelectorAll('[data-platform-switcher]')) {
  const controls = widget.querySelector('[data-platform-controls]');
  const buttons = [...controls.querySelectorAll('[data-platform-choice]')];
  const panels = [...widget.querySelectorAll('[data-platform-panel]')];
  const hint = widget.querySelector('[data-platform-hint]');
  const detected = detectDownloadSystem();
  const panelForHash = () => {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return null; }
    const target = id && document.getElementById(id);
    return target ? panels.find(panel => panel === target || panel.contains(target)) : null;
  };
  const labelFor = system => buttons.find(button => button.dataset.platformChoice === system).dataset.platformLabel;
  function selectPlatform(system, manual = false) {
    for (const button of buttons) {
      const selected = button.dataset.platformChoice === system;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
    }
    for (const panel of panels) panel.hidden = panel.dataset.platformPanel !== system;
    const label = labelFor(system);
    if (manual) {
      hint.textContent = locale === 'zh' ? `已选择 ${label}。下载前请核对目标电脑的处理器架构。`
        : `${label} selected. Check the target computer's processor architecture before downloading.`;
    } else if (detected.mobile) {
      hint.textContent = locale === 'zh' ? `当前为移动设备，桌面安装包需在电脑上运行。当前展示 ${label}，可切换到目标电脑的系统。`
        : `You are on a mobile device; desktop packages run on a computer. Showing ${label}; choose the target computer's system.`;
    } else if (detected.system) {
      const recommended = labelFor(detected.system);
      hint.textContent = locale === 'zh' ? `按浏览器信息推荐 ${recommended}；当前查看 ${label}，可随时手动切换系统。`
        : `Browser information suggests ${recommended}. Showing ${label}; you can switch systems at any time.`;
    } else {
      hint.textContent = locale === 'zh' ? `无法可靠识别桌面系统，当前展示 ${label}。请手动选择目标电脑系统。`
        : `The desktop system could not be identified reliably. Showing ${label}; choose the target computer's system.`;
    }
  }
  controls.setAttribute('role', 'tablist');
  for (const [index, button] of buttons.entries()) {
    const panel = panels.find(panel => panel.dataset.platformPanel === button.dataset.platformChoice);
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', panel.id);
    button.setAttribute('aria-label', button.dataset.platformLabel);
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', button.id);
    panel.tabIndex = 0;
    if (button.dataset.platformChoice === detected.system) {
      const badge = document.createElement('span');
      badge.className = 'platform-recommendation';
      badge.setAttribute('aria-hidden', 'true');
      badge.textContent = locale === 'zh' ? '推荐' : 'Suggested';
      button.append(badge);
    }
    button.addEventListener('click', () => selectPlatform(button.dataset.platformChoice, true));
    button.addEventListener('keydown', event => {
      const next = { ArrowRight: (index + 1) % buttons.length, ArrowLeft: (index - 1 + buttons.length) % buttons.length, Home: 0, End: buttons.length - 1 }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      buttons[next].focus();
      selectPlatform(buttons[next].dataset.platformChoice, true);
    });
  }
  const initial = panelForHash()?.dataset.platformPanel || detected.system || buttons[0].dataset.platformChoice;
  selectPlatform(initial);
  controls.hidden = false;
  window.addEventListener('hashchange', () => {
    const panel = panelForHash();
    if (!panel) return;
    selectPlatform(panel.dataset.platformPanel, true);
    document.getElementById(decodeURIComponent(location.hash.slice(1))).scrollIntoView({ block: 'start' });
  });
}

if (['download', 'download/windows'].includes(document.body.dataset.page)) {
  const { mobile, system } = detectDownloadSystem();
  const card = system ? document.querySelector(`[data-download-platform="${system}"]`) : null;
  if (card) {
    card.classList.add('download-recommended');
    const badge = document.createElement('span');
    badge.className = 'download-system-badge';
    badge.textContent = copy.yourSystem;
    card.prepend(badge);
  }
  const hint = document.getElementById('download-system-hint');
  if (hint && mobile) {
    hint.textContent = locale === 'zh'
      ? '你正在使用移动设备。桌面安装包需在电脑上运行，请按目标电脑选择 Windows、Mac 或 Linux。'
      : 'You are on a mobile device. Desktop packages run on a computer; choose Windows, Mac or Linux for your target computer.';
  }

  document.querySelectorAll('[data-download-chooser]').forEach(chooser => {
    const select = chooser.querySelector('select');
    const groups = chooser.querySelectorAll('[data-download-arch]');
    const update = () => groups.forEach(group => {
      group.hidden = group.dataset.downloadArch !== select.value;
    });
    update();
    select.addEventListener('change', update);
    chooser.querySelector('[data-download-controls]').hidden = false;
  });
}
