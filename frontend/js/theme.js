const THEME_STORAGE_KEY = 'devtoolshub_theme';
const LIGHT_THEME = 'light';
const DARK_THEME = 'dark';
const LIGHT_THEME_COLOR = '#7c3aed';
const DARK_THEME_COLOR = '#0f172a';

function readStoredTheme() {
    try {
        const value = localStorage.getItem(THEME_STORAGE_KEY);
        return value === DARK_THEME || value === LIGHT_THEME ? value : null;
    } catch {
        return null;
    }
}

function getPreferredTheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? DARK_THEME
        : LIGHT_THEME;
}

function getResolvedTheme() {
    return readStoredTheme() || getPreferredTheme();
}

function getThemeLabel(theme) {
    return theme === DARK_THEME ? 'Tema claro' : 'Tema oscuro';
}

function getThemeIconClass(theme) {
    return theme === DARK_THEME ? 'bi-sun-fill' : 'bi-moon-stars';
}

function syncToggleButtons(theme) {
    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
        const label = button.querySelector('[data-theme-label]');
        const icon = button.querySelector('[data-theme-icon]');
        const nextLabel = getThemeLabel(theme);

        button.setAttribute('aria-label', `Cambiar a ${nextLabel.toLowerCase()}`);
        button.title = nextLabel;

        if (label) {
            label.textContent = nextLabel;
        }

        if (icon) {
            icon.className = `bi ${getThemeIconClass(theme)}`;
        }
    });
}

function persistTheme(theme) {
    try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
        // Ignore storage errors and keep the applied theme.
    }
}

export function applyTheme(theme) {
    const resolvedTheme = theme === DARK_THEME ? DARK_THEME : LIGHT_THEME;
    const html = document.documentElement;

    html.setAttribute('data-bs-theme', resolvedTheme);
    html.style.colorScheme = resolvedTheme;

    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
        themeColorMeta.setAttribute('content', resolvedTheme === DARK_THEME ? DARK_THEME_COLOR : LIGHT_THEME_COLOR);
    }

    syncToggleButtons(resolvedTheme);
    return resolvedTheme;
}

export function setTheme(theme) {
    const resolvedTheme = applyTheme(theme);
    persistTheme(resolvedTheme);
    return resolvedTheme;
}

export function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-bs-theme') === DARK_THEME ? DARK_THEME : LIGHT_THEME;
    return setTheme(currentTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME);
}

export function initThemeToggle() {
    applyTheme(getResolvedTheme());

    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
        if (button.dataset.themeBound === 'true') {
            return;
        }

        button.addEventListener('click', toggleTheme);
        button.dataset.themeBound = 'true';
    });
}
