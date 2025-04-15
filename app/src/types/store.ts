export interface LanguageState {
  language: string
  setLanguage: (lang: string) => void
  t: (key: string) => string
}

