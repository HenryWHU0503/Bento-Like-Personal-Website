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
        const picker = document.querySelector('.theme-picker');
        for (const option of picker.querySelectorAll('input[name="appearance"]')) {
            option.checked = option.value === preference;
            option.addEventListener('change', () => {
                if (!option.checked) return;
                preference = option.value;
                applyTheme();
                try {
                    if (preference === 'system') localStorage.removeItem('theme');
                    else localStorage.setItem('theme', preference);
                } catch {
                    // Keep the selection for this page when storage is unavailable.
                }
            });
        }
        picker.hidden = false;
    });
})();
