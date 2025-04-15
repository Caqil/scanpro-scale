
import { Metadata } from "next";
import { SUPPORTED_LANGUAGES } from '@/src/lib/i18n/config';
import NotFoundPage from "../not-found";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: paramLang } = await params;
  const lang = SUPPORTED_LANGUAGES.includes(paramLang as any) ? paramLang : "en";

  return {
    title: "Page Not Found",
    description: "Sorry, we couldn't find the page you're looking for.",
    openGraph: {
      title: "Page Not Found",
    description: "Sorry, we couldn't find the page you're looking for.",
      url: `/${lang}/not-found`,
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
      canonical: `/${lang}/not-found`,
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
          return [langCode,`/${lang}/not-found`,];
        })
      ),
    },
   
  };
}

export default NotFoundPage;