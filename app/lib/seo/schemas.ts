// lib/seo/schemas.ts
import { Metadata } from 'next';
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

type Language = typeof SUPPORTED_LANGUAGES[number];

// Reuse your existing translation function
function getTranslation(lang: string, key: string): string {
    let translations;
    switch (lang) {
        case "id": translations = idTranslations; break;
        case "es": translations = esTranslations; break;
        case "fr": translations = frTranslations; break;
        case "zh": translations = zhTranslations; break;
        case "ar": translations = arTranslations; break;
        case "hi": translations = hiTranslations; break;
        case "ru": translations = ruTranslations; break;
        case "pt": translations = ptTranslations; break;
        case "de": translations = deTranslations; break;
        case "ja": translations = jaTranslations; break;
        case "ko": translations = koTranslations; break;
        case "it": translations = itTranslations; break;
        case "tr": translations = trTranslations; break;
        default: translations = enTranslations;
    }

    const keys = key.split('.');
    const result = keys.reduce((obj, k) =>
        (obj && obj[k] !== undefined) ? obj[k] : undefined,
        translations as any
    );

    return result !== undefined ? result : key;
}

// Stop words logic from your existing implementation
const stopWordsByLanguage: Record<string, string[]> = {
    en: ["the", "a", "an", "and", "or", "to", "in", "with", "for", "is", "on", "at"],
    id: ["dan", "di", "ke", "dari", "untuk", "yang", "dengan", "atau", "pada"],
    es: ["el", "la", "los", "las", "y", "o", "en", "con", "para", "de", "a"],
    fr: ["le", "la", "les", "et", "ou", "à", "en", "avec", "pour", "de"],
    zh: ["的", "了", "在", "是", "我", "他", "这", "那", "和", "你"],
    ar: ["في", "من", "إلى", "على", "و", "هذا", "تلك", "مع", "أو"],
    hi: ["और", "के", "में", "से", "है", "को", "का", "कि", "पर"],
    ru: ["и", "в", "на", "с", "к", "от", "для", "по", "или"],
    pt: ["e", "ou", "em", "com", "para", "de", "a", "o", "as"],
    de: ["und", "in", "mit", "für", "zu", "auf", "an", "oder"],
    ja: ["の", "に", "を", "は", "が", "と", "で", "です"],
    ko: ["은", "는", "이", "가", "을", "를", "에", "와"],
    it: ["e", "o", "in", "con", "per", "di", "a", "il", "la"],
    tr: ["ve", "ile", "de", "da", "için", "bu", "şu", "veya"]
};
function extractKeywords(text: string, language: string): string[] {
    const stopWords = stopWordsByLanguage[language] || stopWordsByLanguage["en"];

    // Split text into words and clean it
    const words = text.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter(word => word.length > 2);

    // Generate bigrams (two-word phrases)
    const bigrams: string[] = [];
    for (let i = 0; i < words.length - 1; i++) {
        // Skip if either word is a stop word
        if (!stopWords.includes(words[i]) && !stopWords.includes(words[i + 1])) {
            bigrams.push(`${words[i]} ${words[i + 1]}`);
        }
    }

    // Count frequency of bigrams
    const bigramCounts = bigrams.reduce((acc, bigram) => {
        acc[bigram] = (acc[bigram] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Sort by frequency and take top 5
    return Object.keys(bigramCounts)
        .sort((a, b) => bigramCounts[b] - bigramCounts[a])
        .slice(0, 5);
}

// Interface to define custom canonical options
interface SeoOptions {
    canonicalPath?: string; // Optional custom canonical path
    translationPrefix: string;
    additionalOptions?: Partial<Metadata>;
}

// Generate SEO metadata with translation support and flexible canonical URL
export function generatePageSeoMetadata(
    lang: Language,
    options: SeoOptions
): Metadata {
    const { canonicalPath, translationPrefix, additionalOptions = {} } = options;

    // Get translations
    const title = getTranslation(lang, `${translationPrefix}.title`);
    const description = getTranslation(lang, `${translationPrefix}.description`);

    // Extract keywords
    const keywords = extractKeywords(`${title} ${description}`, lang);

    // Determine canonical path
    const canonicalSegment = canonicalPath || translationPrefix.split('.').pop() || '';

    // Construct base metadata
    const baseMetadata: Metadata = {
        title,
        description,
        keywords,
        
        openGraph: {
            title,
            description,
            url: `/${lang}/${canonicalSegment}`,
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
            canonical: `/${lang}/${canonicalSegment}`,
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

                    return [langCode, `/${code}/${canonicalSegment}`];
                })
            ),
        }
    };

    // Merge with additional options
    return {
        ...baseMetadata,
        ...additionalOptions
    };
}

// Schemas for rich text SEO
export function generateScanProSchemas() {
    return [
        {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'ScanPro',
            url: 'https://scanpro.cc',
            description: 'Comprehensive PDF and file management tools'
        },
        {
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'ScanPro',
            url: 'https://scanpro.cc',
            description: 'Online platform for PDF and file conversion, compression, and management',
            applicationCategory: 'Productivity'
        }
    ];
}