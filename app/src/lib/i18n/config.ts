// src/lib/i18n/config.ts
import enTranslations from './locales/en';
import idTranslations from './locales/id';
import esTranslations from './locales/es';
import frTranslations from './locales/fr';
import zhTranslations from './locales/zh';
import arTranslations from './locales/ar';
import hiTranslations from './locales/hi';
import ruTranslations from './locales/ru';
import ptTranslations from './locales/pt';
import deTranslations from './locales/de';
import jaTranslations from './locales/ja';
import koTranslations from './locales/ko';
import itTranslations from './locales/it';
import trTranslations from './locales/tr';

// Define all available translations
export const translations = {
    en: enTranslations,
    id: idTranslations,
    es: esTranslations,
    fr: frTranslations,
    zh: zhTranslations,
    ar: arTranslations,
    hi: hiTranslations,
    ru: ruTranslations,
    pt: ptTranslations,
    de: deTranslations,
    ja: jaTranslations,
    ko: koTranslations,
    it: itTranslations,
    tr: trTranslations,
};

// Define supported languages for the application
export const SUPPORTED_LANGUAGES = Object.keys(translations);

// Helper function to get translation
export function getTranslation(lang: string, key: string): string {
    // Get the translation set for the specified language, fallback to English
    const translationSet = translations[lang as keyof typeof translations] || translations.en;

    // Navigate nested objects using dot notation
    const keys = key.split('.');
    let result = keys.reduce((o, k) => (o && o[k] !== undefined) ? o[k] : undefined, translationSet as any);

    if (result !== null && typeof result === 'object') {
        console.warn(`Translation key "${key}" returned an object instead of a string.`);
        return key;
    }

    return result !== undefined ? result : key;
}

// Language metadata for UI display
export const languageMetadata = {
    en: {
        name: 'English',
        nativeName: 'English',
        flag: '🇺🇸',
    },
    id: {
        name: 'Indonesian',
        nativeName: 'Bahasa Indonesia',
        flag: '🇮🇩',
    },
    es: {
        name: 'Spanish',
        nativeName: 'Español',
        flag: '🇪🇸',
    },
    fr: {
        name: 'French',
        nativeName: 'Français',
        flag: '🇫🇷',
    },
    zh: {
        name: 'Chinese',
        nativeName: '中文 (Zhōngwén)',
        flag: '🇨🇳',
    },
    ar: {
        name: 'Arabic',
        nativeName: 'العربية (al-ʿArabiyyah)',
        flag: '🇸🇦',
    },
    hi: {
        name: 'Hindi',
        nativeName: 'हिन्दी (Hindī)',
        flag: '🇮🇳',
    },
    ru: {
        name: 'Russian',
        nativeName: 'Русский (Russkiy)',
        flag: '🇷🇺',
    },
    pt: {
        name: 'Portuguese',
        nativeName: 'Português',
        flag: '🇧🇷',
    },
    de: {
        name: 'German',
        nativeName: 'Deutsch',
        flag: '🇩🇪',
    },
    ja: {
        name: 'Japanese',
        nativeName: '日本語 (Nihongo)',
        flag: '🇯🇵',
    },
    ko: {
        name: 'Korean',
        nativeName: '한국어 (Hangugeo)',
        flag: '🇰🇷',
    },
    it: {
        name: 'Italian',
        nativeName: 'Italiano',
        flag: '🇮🇹',
    },
    tr: {
        name: 'Turkish',
        nativeName: 'Türkçe',
        flag: '🇹🇷',
    },

};