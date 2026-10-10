// This wrapper observes the same-origin editor; the upstream engine is unchanged.
const frame = document.getElementById('photocraft-frame');
const status = document.getElementById('editor-status');
const heading = document.getElementById('editor-status-heading');
const message = document.getElementById('editor-status-message');
const retry = document.getElementById('editor-retry');
const zh = document.body.dataset.locale === 'zh';
const labels = {
  loading: zh ? '正在加载 PhotoCraft' : 'Loading PhotoCraft',
  download: zh ? '首次加载包含约 25 MB 文件，请保持页面打开。' : 'The first load includes about 25 MB of files. Keep this tab open.',
  slow: zh ? '加载时间较长' : 'This is taking longer than usual',
  slowHelp: zh ? '编辑器尚未完成启动。可检查浏览器与网络，或重试。重试会丢失未保存的修改。' : 'The editor has not finished starting. Check your browser and connection, or retry. Retrying discards unsaved work.',
  failed: zh ? '编辑器无法启动' : 'The editor could not start',
  failHelp: zh ? '编辑器文件或图形初始化发生错误，请查看加载帮助。' : 'An editor file or graphics initialization failed. See loading help for checks.',
  gpu: zh ? '此浏览器未提供 WebGPU' : 'WebGPU is unavailable in this browser',
  gpuHelp: zh ? '请使用支持图形加速的桌面 Chrome 或 Edge，或查看桌面下载。' : 'Try a desktop Chrome or Edge with working graphics support, or use the desktop download.',
};
let stopped = false;
let started = Date.now();
let observedWindow;
let interval;

function show(title, detail, allowRetry) {
  heading.textContent = title;
  message.textContent = detail;
  status.hidden = false;
  retry.hidden = !allowRetry;
}
function fail() {
  if (stopped) return;
  stopped = true;
  clearInterval(interval);
  show(labels.failed, labels.failHelp, true);
}
function inspect() {
  if (stopped) return;
  try {
    const win = frame.contentWindow;
    const doc = frame.contentDocument;
    if (win && win !== observedWindow) {
      observedWindow = win;
      win.addEventListener('error', fail);
      win.addEventListener('unhandledrejection', fail);
    }
    const canvas = doc?.getElementById('photocraft_canvas');
    if (canvas && !doc.getElementById('photocraft_loading') && canvas.width > 0) {
      stopped = true;
      status.hidden = true;
      clearInterval(interval);
      return;
    }
    if (doc?.readyState === 'complete' && doc.body && !canvas && doc.URL !== 'about:blank') {
      fail();
      return;
    }
  } catch {
    // Same-origin access failure cannot establish editor readiness.
    fail();
    return;
  }
  if (Date.now() - started >= 60000) show(labels.slow, labels.slowHelp, true);
}
retry.addEventListener('click', () => {
  clearInterval(interval);
  stopped = false;
  started = Date.now();
  observedWindow = undefined;
  show(labels.loading, labels.download, false);
  frame.src = frame.dataset.src;
  interval = setInterval(inspect, 300);
});
frame.addEventListener('error', fail);
frame.addEventListener('load', inspect);
if (!navigator.gpu) {
  stopped = true;
  show(labels.gpu, labels.gpuHelp, false);
} else {
  frame.src = frame.dataset.src;
  interval = setInterval(inspect, 300);
}
window.addEventListener('pagehide', () => clearInterval(interval), { once: true });
