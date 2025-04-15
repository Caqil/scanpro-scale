import { PdfTools } from "@/components/pdf-tools";
import { Metadata } from "next";
import { ToolsHeaderSection } from "./tools-header-content";
import { SUPPORTED_LANGUAGES } from '@/src/lib/i18n/config';
import { generatePageSeoMetadata } from "@/lib/seo/schemas";
import { SEO } from "@/components/SEO";
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: paramLang } = await params;
  const lang = SUPPORTED_LANGUAGES.includes(paramLang as any) ? paramLang : "en";

  // Use the new SEO metadata generator
  return generatePageSeoMetadata(lang as any, { 
    translationPrefix: 'pdfTools', 
    canonicalPath: 'pdf-tools' 
  }); 
  
}
export default function ToolsPage() {
  return (
    <main className="py-8">
      <div className="container max-w-6xl mx-auto px-4">
       
        <ToolsHeaderSection/>
        <PdfTools />
      </div>
    </main>
  );
}