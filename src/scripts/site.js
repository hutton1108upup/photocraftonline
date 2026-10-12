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
  menu.className = 'border-border border-t px-4 pt-2 pb-4 md:hidden';
  menu.hidden = true;
  const nav = header.querySelector('nav').cloneNode(true);
  nav.className = 'flex flex-col gap-2';
  nav.querySelectorAll('a').forEach(link => { link.className = 'text-muted-foreground hover:bg-accent hover:text-foreground rounded-md px-3 py-2 text-sm transition-colors'; });
  const action = header.querySelector('div.md\\:flex a').cloneNode(true);
  action.querySelector('svg')?.remove();
  action.className = header.querySelector('div.md\\:flex a').className;
  const bottom = document.createElement('div');
  bottom.className = 'border-border mt-3 flex items-center gap-2 border-t pt-3';
  const spacer = document.createElement('div');
  spacer.className = 'flex-1';
  bottom.append(spacer, action);
  menu.append(nav, bottom);
  header.append(menu);
  mobileButton.setAttribute('aria-controls', menu.id);
  const originalIcon = mobileButton.innerHTML;
  const closeIcon = '<svg aria-hidden="true" class="lucide lucide-x size-5" fill="none" height="24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>';
  const close = () => {
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
  document.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });
  window.matchMedia('(min-width: 768px)').addEventListener('change', event => { if (event.matches) close(); });
}

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

if (['download', 'download/windows'].includes(document.body.dataset.page)) {
  const ua = navigator.userAgent;
  // iPad desktop mode reports MacIntel; Android often reports Linux.
  const mobile = navigator.userAgentData?.mobile || /android|iphone|ipad|ipod/i.test(ua)
    || (/mac/i.test(navigator.platform) && navigator.maxTouchPoints > 1);
  const platform = navigator.userAgentData?.platform || navigator.platform || ua;
  const system = mobile ? null : /win/i.test(platform) ? 'windows' : /mac/i.test(platform) ? 'macos' : /linux/i.test(platform) ? 'linux' : null;
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
