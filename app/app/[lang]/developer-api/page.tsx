// app/[lang]/developer/page.tsx
import { Metadata } from "next";
import { DeveloperPageClient } from "./developer-client";
import { SUPPORTED_LANGUAGES } from '@/src/lib/i18n/config';
import { generatePageSeoMetadata } from "@/lib/seo/schemas";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: paramLang } = await params;
  const lang = SUPPORTED_LANGUAGES.includes(paramLang as any) ? paramLang : "en";
  
  // Use the new SEO metadata generator
  return generatePageSeoMetadata(lang as any, { 
    translationPrefix: 'developer', 
    canonicalPath: 'developer-api' 
  });
}

export default function DeveloperPage() {
  return <DeveloperPageClient />;
}