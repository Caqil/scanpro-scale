import { Metadata } from "next";
import { notFound } from "next/navigation";
import { SEO } from "@/components/SEO";
import { ClientConversionContent } from "./client-conversion-content";
import { SUPPORTED_LANGUAGES, getTranslation } from '@/src/lib/i18n/config';

// Define conversion types mapping for metadata generation
const conversionTitles: Record<string, { titleKey: string, descKey: string }> = {
  "pdf-to-docx": { titleKey: "convert.title.pdfToWord", descKey: "convert.description.pdfToWord" },
  "pdf-to-xlsx": { titleKey: "convert.title.pdfToExcel", descKey: "convert.description.pdfToExcel" },
  "pdf-to-pptx": { titleKey: "convert.title.pdfToPowerPoint", descKey: "convert.description.pdfToPowerPoint" },
  "pdf-to-jpg": { titleKey: "convert.title.pdfToJpg", descKey: "convert.description.pdfToJpg" },
  "pdf-to-png": { titleKey: "convert.title.pdfToPng", descKey: "convert.description.pdfToPng" },
  "pdf-to-html": { titleKey: "convert.title.pdfToHtml", descKey: "convert.description.pdfToHtml" },
  "docx-to-pdf": { titleKey: "convert.title.wordToPdf", descKey: "convert.description.wordToPdf" },
  "xlsx-to-pdf": { titleKey: "convert.title.excelToPdf", descKey: "convert.description.excelToPdf" },
  "pptx-to-pdf": { titleKey: "convert.title.powerPointToPdf", descKey: "convert.description.powerPointToPdf" },
  "jpg-to-pdf": { titleKey: "convert.title.jpgToPdf", descKey: "convert.description.jpgToPdf" },
  "png-to-pdf": { titleKey: "convert.title.pngToPdf", descKey: "convert.description.pngToPdf" },
  "html-to-pdf": { titleKey: "convert.title.htmlToPdf", descKey: "convert.description.htmlToPdf" },
};

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ lang: string, conversion: string }> 
}): Promise<Metadata> {
  const { lang: paramLang, conversion } = await params;
  
  if (!SUPPORTED_LANGUAGES.includes(paramLang)) {
    notFound();
  }
  
  const lang = paramLang;
  const t = (key: string) => getTranslation(lang, key);
  
  const conversionInfo = conversionTitles[conversion] || { 
    titleKey: "convert.title.generic", 
    descKey: "convert.description.generic" 
  };

  // Stop words logic remains the same as in your original implementation
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
  
  // Keyword extraction function remains the same
  const extractKeywords = (text: string, language: string): string[] => {
    const stopWords = stopWordsByLanguage[language] || stopWordsByLanguage["en"];
    
    const words = text.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/);
    
    const filteredWords = words
      .filter(word => !stopWords.includes(word) && word.length > 2)
      .reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
  
    return Object.keys(filteredWords)
      .sort((a, b) => filteredWords[b] - filteredWords[a])
      .slice(0, 5);
  };

  // Generate keywords
  const keywords = extractKeywords(
    `${t(conversionInfo.titleKey)} ${t(conversionInfo.descKey)}`, 
    lang
  );

  // Generate conversion-specific JSON-LD schema
  const conversionSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: t(conversionInfo.titleKey),
    description: t(conversionInfo.descKey),
    applicationCategory: 'Productivity',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0'
    }
  };

  return {
    title: t(conversionInfo.titleKey),
    description: t(conversionInfo.descKey),
    keywords: keywords,
    openGraph: {
      title: t(conversionInfo.titleKey),
      description: t(conversionInfo.descKey),
      url: `/${lang}/convert/${conversion}`,
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
      canonical: `/${lang}/convert/${conversion}`,
      languages: Object.fromEntries(
        SUPPORTED_LANGUAGES.map(code => {
          const langCode = code === 'en' ? 'en-US' : 
                          code === 'id' ? 'id-ID' : 
                          code === 'es' ? 'es-ES' :
                          code === 'fr' ? 'fr-FR' :
                          code === 'zh' ? 'zh-CN' :
                          code === 'ar' ? 'ar-SA' :
                          code === 'hi' ? 'hi-IN' :
                          code === 'ru' ? 'ru-RU' :
                          code === 'pt' ? 'pt-BR' :
                          code === 'de' ? 'de-DE' :
                          code === 'ja' ? 'ja-JP' :
                          code === 'ko' ? 'ko-KR' :
                          code === 'it' ? 'it-IT' :
                          code === 'tr' ? 'tr-TR' : `${code}`;
          return [langCode, `/${code}/convert/${conversion}`];
        })
      ),
    },
    // Include custom JSON-LD schema
    other: {
      'script[type="application/ld+json"]': JSON.stringify(conversionSchema)
    }
  };
}

export default async function ConversionPage({ 
  params 
}: { 
  params: Promise<{ lang: string, conversion: string }> 
}) {
  const { lang: paramLang, conversion } = await params;
  
  if (!SUPPORTED_LANGUAGES.includes(paramLang)) {
    notFound();
  }
  
  return (
    <>
      {/* Add SEO with conversion-specific schema */}
      <SEO />
      
      <ClientConversionContent />
    </>
  );
}