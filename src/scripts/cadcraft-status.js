const frame = document.getElementById('cadcraft-frame');
const status = document.getElementById('cadcraft-status');
if (frame && status) {
  const zh = document.body.dataset.locale === 'zh';
  const ready = zh ? 'CADCraft 已加载。先用练习 DXF 验证编辑和保存。' : 'CADCraft loaded. Start with the practice DXF and check editing and saving.';
  const timeout = zh ? '加载尚未完成。可用上方 CPU 兼容模式或完整窗口重试，先保存已有工作。' : 'Loading has not completed. Try CPU mode or the full window above after saving existing work.';
  const started = Date.now();
  const timer = setInterval(() => {
    const doc = frame.contentDocument;
    if (doc?.getElementById('cadcraft_canvas') && !doc.getElementById('cadcraft_loading')) {
      status.textContent = ready;
      clearInterval(timer);
    } else if (Date.now() - started > 45000) {
      status.textContent = timeout;
      clearInterval(timer);
    }
  }, 500);
  window.addEventListener('pagehide', () => clearInterval(timer), { once: true });
}
