import { writable } from 'svelte/store';
import { browser } from '$app/environment';

type Theme = 'light' | 'dark' | 'system';

function createThemeStore() {
	const defaultTheme: Theme = 'light';
	const storageKey = 'peal-ui-theme';

	const initialTheme = browser
		? (localStorage.getItem(storageKey) as Theme) || defaultTheme
		: defaultTheme;

	const { subscribe, set, update } = writable<Theme>(initialTheme);

	return {
		subscribe,
		set: (theme: Theme) => {
			if (browser) {
				localStorage.setItem(storageKey, theme);
				applyTheme(theme);
			}
			set(theme);
		},
		toggle: () => {
			update((current) => {
				const newTheme = current === 'light' ? 'dark' : 'light';
				if (browser) {
					localStorage.setItem(storageKey, newTheme);
					applyTheme(newTheme);
				}
				return newTheme;
			});
		}
	};
}

function applyTheme(theme: Theme) {
	if (!browser) return;

	const root = document.documentElement;

	if (theme === 'system') {
		const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		root.classList.toggle('dark', systemDark);
	} else {
		root.classList.toggle('dark', theme === 'dark');
	}
}

export const theme = createThemeStore();
