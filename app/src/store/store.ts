// src/store/store.ts - Updated implementation
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { translations, SUPPORTED_LANGUAGES } from '../lib/i18n/config';

// Type for language identifiers
export type Language = keyof typeof translations;

// Function to get nested translation - improved with better error handling
const getNestedTranslation = (obj: any, path: string): string => {
  try {
    const keys = path.split('.');
    let result = keys.reduce((o, k) => (o && o[k] !== undefined) ? o[k] : undefined, obj);

    if (result !== null && typeof result === 'object') {
      console.warn(`Translation key "${path}" returned an object instead of a string.`);
      return path;
    }

    return result !== undefined ? result : path;
  } catch (error) {
    console.error(`Error getting translation for path: ${path}`, error);
    return path;
  }
};

interface LanguageState {
  language: Language;
  t: (key: string) => string;
  setLanguage: (language: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'en',

      // Translation function with safety checks
      t: (key: string): string => {
        try {
          const { language } = get();
          // Get translations or fallback to English if language doesn't exist
          const translationSet = translations[language] || translations.en;
          return getNestedTranslation(translationSet, key);
        } catch (error) {
          console.error('Translation error:', error);
          return key; // Return the key as fallback
        }
      },

      // Function to change language - modified to be more reliable
      setLanguage: (language: Language) => {
        // Only update state if it's different
        if (get().language !== language) {
          set({ language });

          // Only run in browser environment
          if (typeof window !== 'undefined') {
            try {
              // Extract current path without language prefix
              const path = window.location.pathname;
              // Regular expression to match any of the supported languages at the beginning of the path
              const langRegex = new RegExp(`^/(${SUPPORTED_LANGUAGES.join('|')})`);
              const pathWithoutLang = path.replace(langRegex, '') || '/';

              // Navigate to new language path
              window.location.href = `/${language}${pathWithoutLang}`;
            } catch (error) {
              console.error('Navigation error:', error);
              // If navigation fails, at least the state is updated
            }
          }
        }
      }
    }),
    {
      name: 'language-storage', // Unique name for localStorage
      partialize: (state) => ({ language: state.language }), // Only persist language
    }
  )
);