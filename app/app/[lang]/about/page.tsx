// app/[lang]/about/page.tsx
import { Metadata } from "next";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { SUPPORTED_LANGUAGES } from '@/src/lib/i18n/config';

import enTranslations from '@/src/lib/i18n/locales/en';
import idTranslations from '@/src/lib/i18n/locales/id';
import esTranslations from '@/src/lib/i18n/locales/es';
import frTranslations from '@/src/lib/i18n/locales/fr';
import zhTranslations from '@/src/lib/i18n/locales/zh';
import arTranslations from '@/src/lib/i18n/locales/ar';
import hiTranslations from '@/src/lib/i18n/locales/hi';
import ruTranslations from '@/src/lib/i18n/locales/ru';
import ptTranslations from '@/src/lib/i18n/locales/pt';
import deTranslations from '@/src/lib/i18n/locales/de';
import jaTranslations from '@/src/lib/i18n/locales/ja';
import koTranslations from '@/src/lib/i18n/locales/ko';
import itTranslations from '@/src/lib/i18n/locales/it';
import trTranslations from '@/src/lib/i18n/locales/tr';
import AboutPageContent from "./about-content";

type Language = typeof SUPPORTED_LANGUAGES[number];

// Helper function to get translation based on language
function getTranslation(lang: string, key: string): string {
  let translations;
  
  // Check which language to use
  switch (lang) {
    case "id":
      translations = idTranslations;
      break;
    case "es":
      translations = esTranslations;
      break;
    case "fr":
      translations = frTranslations;
      break;
    case "zh":
      translations = zhTranslations;
      break;
    case "ar":
      translations = arTranslations;
      break;
    case "hi":
      translations = hiTranslations;
      break;
    case "ru":
      translations = ruTranslations;
      break;
    case "pt":
      translations = ptTranslations;
      break;
    case "de":
      translations = deTranslations;
      break;
    case "ja":
      translations = jaTranslations;
      break;
    case "ko":
      translations = koTranslations;
      break;
    case "it":
      translations = itTranslations;
      break;
    case "tr":
      translations = trTranslations;
      break;
    default:
      translations = enTranslations; // Fallback to English
  }
  
  // Navigate through nested keys
  const keys = key.split('.');
  const result = keys.reduce((obj, k) => 
    (obj && obj[k] !== undefined) ? obj[k] : undefined, 
    translations as any
  );
  
  return result !== undefined ? result : key;
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: paramLang } = await params;
  const lang = SUPPORTED_LANGUAGES.includes(paramLang as Language) ? paramLang as Language : "en";
  const t = (key: string) => getTranslation(lang, key);
  const stopWordsByLanguage: Record<string, string[]> = {
    en: ["the", "a", "an", "and", "or", "to", "in", "with", "for", "is", "on", "at"],
    id: ["dan", "di", "ke", "dari", "untuk", "yang", "dengan", "atau", "pada"],
    es: ["el", "la", "los", "las", "y", "o", "en", "con", "para", "de", "a"],
    fr: ["le", "la", "les", "et", "ou", "à", "en", "avec", "pour", "de"],
    zh: ["的", "了", "在", "是", "我", "他", "这", "那", "和", "你"], // Simplified Chinese
    ar: ["في", "من", "إلى", "على", "و", "هذا", "تلك", "مع", "أو"], // Arabic
    hi: ["और", "के", "में", "से", "है", "को", "का", "कि", "पर"], // Hindi
    ru: ["и", "в", "на", "с", "к", "от", "для", "по", "или"], // Russian
    pt: ["e", "ou", "em", "com", "para", "de", "a", "o", "as"], // Portuguese
    de: ["und", "in", "mit", "für", "zu", "auf", "an", "oder"], // German
    ja: ["の", "に", "を", "は", "が", "と", "で", "です"], // Japanese (hiragana)
    ko: ["은", "는", "이", "가", "을", "를", "에", "와"], // Korean
    it: ["e", "o", "in", "con", "per", "di", "a", "il", "la"], // Italian
    tr: ["ve", "ile", "de", "da", "için", "bu", "şu", "veya"] // Turkish
  };
  
  
  
  // Keyword extraction function with language-specific stop words
  const extractKeywords = (text: string, language: string): string[] => {
    // Select stop words based on language, default to English if not found
    const stopWords = stopWordsByLanguage[language] || stopWordsByLanguage["en"];
    
    // Convert to lowercase (for Latin-based languages) and remove punctuation
    const words = text.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/);
    
    // Filter out stop words and short words, then count frequency
    const filteredWords = words
      .filter(word => !stopWords.includes(word) && word.length > 2)
      .reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
  
    // Sort by frequency and take top 5
    return Object.keys(filteredWords)
      .sort((a, b) => filteredWords[b] - filteredWords[a])
      .slice(0, 5);
  };
  // Get translated title and description
  const title = t("ocr.title");
  const description = t("ocr.description");
  // Combine title and description for keyword extraction
  const keywords = extractKeywords(`${title} ${description}`, lang);

  return {
    title: t("about.title") || "About ScanPro | Transforming Document Management",
    description: t("about.description") || "Learn about ScanPro's mission to simplify digital document management with cutting-edge PDF tools.",
    openGraph: {
      title: t("about.title") || "About ScanPro | Transforming Document Management",
      description: t("about.description") || "Learn about ScanPro's mission to simplify digital document management with cutting-edge PDF tools.",
      url: `/${lang}/about`,
      siteName: "ScanPro",
      locale: {
        'en': 'en_US',
        'id': 'id_ID',
        'es': 'es_ES',
        'fr': 'fr_FR',
        'zh': 'zh_CN',
        'ar': 'ar_SA',
        'hi': 'hi_IN',
        'ru': 'ru_RU',
        'pt': 'pt_BR',
        'de': 'de_DE',
        'ja': 'ja_JP',
        'ko': 'ko_KR',
        'it': 'it_IT',
        'tr': 'tr_TR'
      }[lang] || 'en_US',
    },
    alternates: {
      canonical: `/${lang}/about`,
      languages: Object.fromEntries(
        SUPPORTED_LANGUAGES.map(code => {
          const langCode = {
            'en': 'en-US',
            'id': 'id-ID',
            'es': 'es-ES',
            'fr': 'fr-FR',
            'zh': 'zh-CN',
            'ar': 'ar-SA',
            'hi': 'hi-IN',
            'ru': 'ru-RU',
            'pt': 'pt-BR',
            'de': 'de-DE',
            'ja': 'ja-JP',
            'ko': 'ko-KR',
            'it': 'it-IT',
            'tr': 'tr-TR'
          }[code] || `${code}`;
          
          return [langCode, `/${code}/about`];
        })
      ),
    }
  };
}

export default function AboutPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    }>
      <AboutPageContent />
    </Suspense>
  );
}