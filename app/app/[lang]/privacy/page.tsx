// app/[lang]/privacy/page.tsx
import { Metadata } from 'next';
import { generatePageSeoMetadata } from '@/lib/seo/schemas';
import { SUPPORTED_LANGUAGES } from '@/src/lib/i18n/config';
import { PrivacyContent } from './privacy-content';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: paramLang } = await params;
  const lang = SUPPORTED_LANGUAGES.includes(paramLang as any) ? paramLang : 'en';

  return generatePageSeoMetadata(lang as any, { 
    translationPrefix: 'privacy', 
    canonicalPath: 'privacy' 
  });
}

export default function PrivacyPolicyPage() {
  return <PrivacyContent />;
}