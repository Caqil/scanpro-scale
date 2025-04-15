import { Metadata } from "next";
import { Suspense } from "react";
import { OcrContent } from "./ocr-content";

import { SUPPORTED_LANGUAGES } from '@/src/lib/i18n/config';
import { generatePageSeoMetadata } from "@/lib/seo/schemas";
import { SEO } from "@/components/SEO";
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: paramLang } = await params;
  const lang = SUPPORTED_LANGUAGES.includes(paramLang as any) ? paramLang : "en";

  // Use the new SEO metadata generator
  return generatePageSeoMetadata(lang as any, { 
    translationPrefix: 'ocrPdf', 
    canonicalPath: 'ocr-pdf' 
  }); 
  
}

export default function OcrPage() {
  return (
    <Suspense fallback={
      <div className="container max-w-5xl py-12 mx-auto">
        Loading OCR tool...
      </div>
    }>
      <OcrContent />
    </Suspense>
  );
}