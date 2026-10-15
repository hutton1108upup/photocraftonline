// Full screenshots remain real, unchanged PNGs. The viewer is an enhancement:
// each anchor still opens the original when JavaScript/dialog is unavailable.
(() => {
  if (!window.HTMLDialogElement || !HTMLDialogElement.prototype.showModal) return;
  const zh = document.documentElement.lang === 'zh';
  const labels = zh ? {
    title: '实测截图', close: '关闭大图', fit: '适应屏幕', actual: '原始尺寸',
    more: '放大', less: '缩小', original: '新标签打开原图', stage: '可滚动的大图',
    failed: '图片未能加载，请使用原图链接。', hint: '原始尺寸下可滚动查看细节；按 Esc 关闭。',
  } : {
    title: 'Test screenshot', close: 'Close screenshot', fit: 'Fit to screen', actual: 'Actual size',
    more: 'Zoom in', less: 'Zoom out', original: 'Open original in a new tab', stage: 'Scrollable screenshot',
    failed: 'The image could not load. Try the original link.', hint: 'At actual size, scroll to inspect details. Press Esc to close.',
  };
  const dialog = document.createElement('dialog');
  dialog.className = 'screenshot-dialog';
  dialog.setAttribute('aria-labelledby', 'screenshot-dialog-title');
  dialog.setAttribute('aria-describedby', 'screenshot-dialog-caption');
  dialog.innerHTML = `<div class="screenshot-dialog-header"><h2 id="screenshot-dialog-title"></h2><button type="button" data-viewer-close></button></div><p id="screenshot-dialog-caption"></p><div class="screenshot-toolbar"><button type="button" data-viewer-fit></button><button type="button" data-viewer-actual></button><button type="button" data-viewer-less></button><output aria-live="polite" data-viewer-scale></output><button type="button" data-viewer-more></button><a data-viewer-original target="_blank" rel="noopener"></a></div><div class="screenshot-stage" tabindex="0" role="region"><img alt=""/></div><p class="screenshot-dialog-hint"></p>`;
  const title = dialog.querySelector('h2');
  const caption = dialog.querySelector('#screenshot-dialog-caption');
  const stage = dialog.querySelector('.screenshot-stage');
  const img = stage.querySelector('img');
  const original = dialog.querySelector('[data-viewer-original]');
  const scaleOutput = dialog.querySelector('[data-viewer-scale]');
  const less = dialog.querySelector('[data-viewer-less]');
  const more = dialog.querySelector('[data-viewer-more]');
  for (const [key, label] of [['close', labels.close], ['fit', labels.fit], ['actual', labels.actual], ['less', labels.less], ['more', labels.more]]) {
    dialog.querySelector(`[data-viewer-${key}]`).textContent = label;
  }
  title.textContent = labels.title;
  original.textContent = labels.original;
  stage.setAttribute('aria-label', labels.stage);
  dialog.querySelector('.screenshot-dialog-hint').textContent = labels.hint;
  document.body.append(dialog);
  let trigger, previousOverflow = '', scale = 1, fitting = true;
  function setScale(value) {
    if (!img.naturalWidth || !img.naturalHeight) return;
    scale = Math.min(3, Math.max(.1, value));
    img.style.width = `${Math.round(img.naturalWidth * scale)}px`;
    img.style.height = 'auto';
    scaleOutput.value = `${Math.round(scale * 100)}%`;
    less.disabled = scale <= .1;
    more.disabled = scale >= 3;
  }
  function fit() {
    fitting = true;
    setScale(Math.min(1, (stage.clientWidth - 24) / img.naturalWidth, (stage.clientHeight - 24) / img.naturalHeight));
    stage.scrollTo(0, 0);
  }
  img.addEventListener('load', () => {
    if (dialog.open) fit();
  });
  img.addEventListener('error', () => { scaleOutput.value = labels.failed; });
  dialog.querySelector('[data-viewer-close]').addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-viewer-fit]').addEventListener('click', fit);
  dialog.querySelector('[data-viewer-actual]').addEventListener('click', () => { fitting = false; setScale(1); stage.scrollTo(0, 0); });
  less.addEventListener('click', () => { fitting = false; setScale(scale / 1.25); });
  more.addEventListener('click', () => { fitting = false; setScale(scale * 1.25); });
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const controls = [...dialog.querySelectorAll('button:not([disabled]), a[href], [tabindex="0"]')];
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  });
  dialog.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    if (trigger?.isConnected) trigger.focus({ preventScroll: true });
  });
  window.addEventListener('resize', () => { if (dialog.open && fitting) fit(); });
  document.querySelectorAll('[data-image-viewer]').forEach(link => link.setAttribute('aria-haspopup', 'dialog'));
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[data-image-viewer]');
    if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const target = new URL(link.href);
    if (target.origin !== location.origin || !/^\/assets\/(tutorial|clone)\/[a-z0-9-]+\.png$/.test(target.pathname)) return;
    event.preventDefault();
    trigger = link;
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    caption.textContent = link.dataset.caption || labels.title;
    img.alt = caption.textContent;
    img.src = target.pathname;
    original.href = target.pathname;
    scaleOutput.value = '';
    dialog.showModal();
    if (img.complete && img.naturalWidth) fit();
    window.PhotoCraftAnalytics?.track('screenshot_open', {
      placement: document.body.dataset.page === 'index' ? 'home' : 'tutorial',
      screenshot_id: link.dataset.screenshotId,
    });
  });
})();
