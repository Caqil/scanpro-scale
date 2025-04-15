// app/[lang]/compress-files/page.tsx
import { Metadata } from "next";
import UniversalFileCompressor from "@/components/universal-file-compressor";
import { CompressionHeaderSection, HowToCompressSection, CompressionFaqSection } from "./compression-content";
import { SUPPORTED_LANGUAGES } from '@/src/lib/i18n/config';
import { generatePageSeoMetadata } from "@/lib/seo/schemas";
import { SEO } from "@/components/SEO";
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: paramLang } = await params;
  const lang = SUPPORTED_LANGUAGES.includes(paramLang as any) ? paramLang : "en";

  // Use the new SEO metadata generator
  return generatePageSeoMetadata(lang as any, { 
    translationPrefix: 'universalCompressor', 
    canonicalPath: 'compress-files' 
  }); 
  
}

export default function CompressFilesPage() {
  
  return (
    <>
      {/* Add SEO component */}
      <SEO />

      <div className="container max-w-5xl py-12 mx-auto">
        <CompressionHeaderSection />

        {/* Main Compressor Tool */}
        <div className="mb-12">
          <UniversalFileCompressor />
        </div>

        {/* How It Works */}
        <HowToCompressSection />

        {/* FAQ Section */}
        <CompressionFaqSection />
      </div>
    </>
  );
}