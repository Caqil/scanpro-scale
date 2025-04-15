import { Metadata } from "next";
import {
  WatermarkHeaderSection,
  HowToWatermarkSection,
  WatermarkFaqSection,
  RelatedToolsSection,
  WhyWatermarkSection,
  WatermarkTypesSection
} from "./watermark-content";
import { SUPPORTED_LANGUAGES } from '@/src/lib/i18n/config';
import { generatePageSeoMetadata } from "@/lib/seo/schemas";
import { SEO } from "@/components/SEO";
import { WatermarkPDF } from "@/components/pdf-watermarker";


export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: paramLang } = await params;
  const lang = SUPPORTED_LANGUAGES.includes(paramLang as any) ? paramLang : "en";

  // Use the new SEO metadata generator
  return generatePageSeoMetadata(lang as any, { 
    translationPrefix: 'watermarkPdf', 
    canonicalPath: 'watermark-pdf' 
  }); 
  
}


export default function WatermarkPDFPage() {
  return (
    <div className="container max-w-5xl py-12 mx-auto">
      <WatermarkHeaderSection />
   {/* Main Tool Section with Tabs */}
      <div className="mb-12">
      <WatermarkPDF  />
      </div>
     

      {/* How It Works */}
      <HowToWatermarkSection />

      {/* FAQ Section */}
      <WhyWatermarkSection />
      <WatermarkTypesSection /> 
      <WatermarkFaqSection />
      {/* Related Tools Section */}
      <RelatedToolsSection />
    </div>
  );
}