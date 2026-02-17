import { writable, derived } from 'svelte/store';
import { translations, type Language, type TranslationKeys } from '$lib/i18n/translations';
import { browser } from '$app/environment';

function createLanguageStore() {
	const defaultLang: Language = 'en';
	const storageKey = 'peal-language';

	const initialLang = browser
		? (localStorage.getItem(storageKey) as Language) || defaultLang
		: defaultLang;

	const { subscribe, set } = writable<Language>(initialLang);

	return {
		subscribe,
		set: (lang: Language) => {
			if (browser) {
				localStorage.setItem(storageKey, lang);
			}
			set(lang);
		}
	};
}

export const language = createLanguageStore();

export const t = derived(language, ($language) => translations[$language]);

export function getTranslation(lang: Language): TranslationKeys {
	return translations[lang];
}
