// app/[lang]/pricing/page.tsx
import { Metadata } from "next";
import { PricingContent } from "./pricing-content";

import { SUPPORTED_LANGUAGES } from '@/src/lib/i18n/config';
import { generatePageSeoMetadata } from "@/lib/seo/schemas";
import { SEO } from "@/components/SEO";
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: paramLang } = await params;
  const lang = SUPPORTED_LANGUAGES.includes(paramLang as any) ? paramLang : "en";

  // Use the new SEO metadata generator
  return generatePageSeoMetadata(lang as any, { 
    translationPrefix: 'pricing', 
    canonicalPath: 'pricing' 
  }); 
  
}


export default function PricingPage() {
  return (
    <div>
      <PricingContent />
    </div>
  );
}