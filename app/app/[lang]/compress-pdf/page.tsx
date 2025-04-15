import { Metadata } from "next";
import { CompressHeaderSection, HowToCompressSection, WhyCompressSection, CompressFaqSection, RelatedToolsSection } from "./compress-content";
import { MultiPdfCompressor } from "@/components/pdf-compressor";
import { SUPPORTED_LANGUAGES } from '@/src/lib/i18n/config';
import { generatePageSeoMetadata } from "@/lib/seo/schemas";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: paramLang } = await params;
  const lang = SUPPORTED_LANGUAGES.includes(paramLang as any) ? paramLang : "en";

  // Use the new SEO metadata generator
  return generatePageSeoMetadata(lang as any, { 
    translationPrefix: 'compressPdf', 
    canonicalPath: 'compress-pdf' 
  });
  
}
export default function CompressPage() {
  return (
    
    <div className="container max-w-5xl py-12 mx-auto">
      <CompressHeaderSection />

      {/* Main Tool Card */}
      <div className="mb-12">
        <MultiPdfCompressor />
      </div>

      {/* How It Works */}
      <HowToCompressSection />

      {/* Benefits Section */}
      <WhyCompressSection />

      {/* FAQ Section */}
      <CompressFaqSection />

      {/* Related Tools Section */}
      <RelatedToolsSection />
    </div>
  );
}