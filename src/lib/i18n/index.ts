import { writable, derived } from "svelte/store";
import {
  translations,
  type Language,
  type TranslationKeys,
} from "$lib/i18n/translations";
import { browser } from "$app/environment";

function createLanguageStore() {
  const defaultLang: Language = "en";
  const storageKey = "peal-language";

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
    },
  };
}

export const language = createLanguageStore();

export const t = derived(
  language,
  ($language) => translations[$language] as TranslationKeys,
);

export const isRTL = derived(language, ($language) => $language === "ar");

export function getTranslation(lang: Language): TranslationKeys {
  return translations[lang];
}

export const availableLanguages: {
  code: Language;
  name: string;
  flag: string;
}[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
];
