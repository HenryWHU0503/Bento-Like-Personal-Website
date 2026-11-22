(() => {
    const root = document.documentElement;
    const system = matchMedia('(prefers-color-scheme: dark)');
    let preference = 'system';

    try {
        const saved = localStorage.getItem('theme');
        if (saved === 'light' || saved === 'dark') preference = saved;
    } catch {
        // The in-page theme still works when storage is unavailable.
    }

    function applyTheme() {
        root.dataset.theme = preference === 'system' ? (system.matches ? 'dark' : 'light') : preference;
    }

    applyTheme();
    system.addEventListener('change', applyTheme);
    document.addEventListener('DOMContentLoaded', () => {
        const select = document.getElementById('theme-select');
        select.value = preference;
        select.addEventListener('change', () => {
            preference = select.value;
            applyTheme();
            try {
                if (preference === 'system') localStorage.removeItem('theme');
                else localStorage.setItem('theme', preference);
            } catch {
                // Keep the selection for this page when storage is unavailable.
            }
        });
    });
})();
