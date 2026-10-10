// Same default as the original next-themes provider: follow the operating system.
(() => {
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const apply = () => {
    let preference = 'system';
    try { preference = localStorage.getItem('theme') || 'system'; } catch { /* Storage can be disabled. */ }
    const theme = preference === 'system' ? (system.matches ? 'dark' : 'light') : preference;
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme === 'dark' ? 'dark' : 'light');
    document.documentElement.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
  };
  apply();
  system.addEventListener('change', apply);
  window.addEventListener('storage', apply);
})();
