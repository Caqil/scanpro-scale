import { Metadata } from "next";
import { RotatePdfClient } from "./rotate-pdf-client";
import { SUPPORTED_LANGUAGES } from '@/src/lib/i18n/config';
import { generatePageSeoMetadata } from "@/lib/seo/schemas";
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: paramLang } = await params;
  const lang = SUPPORTED_LANGUAGES.includes(paramLang as any) ? paramLang : "en";

  // Use the SEO metadata generator
  return generatePageSeoMetadata(lang as any, { 
    translationPrefix: 'rotatePdf', 
    canonicalPath: 'rotate-pdf' 
  }); 
}

export default function RotatePDFPage() {
  return <RotatePdfClient />;
}