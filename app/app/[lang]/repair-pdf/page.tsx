import { Metadata } from "next";
import { PdfRepairTool } from "@/components/pdf-repair-tool";
import {
  RepairHeaderSection,
  HowToRepairSection,
  WhyRepairSection,
  RepairModesSection,
  RepairFaqSection,
  BestPracticesSection,
  RelatedToolsSection
} from "./repair-content";
import { SUPPORTED_LANGUAGES } from '@/src/lib/i18n/config';
import { generatePageSeoMetadata } from "@/lib/seo/schemas";
import { SEO } from "@/components/SEO";
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: paramLang } = await params;
  const lang = SUPPORTED_LANGUAGES.includes(paramLang as any) ? paramLang : "en";

  // Use the new SEO metadata generator
  return generatePageSeoMetadata(lang as any, { 
    translationPrefix: 'repairPdf', 
    canonicalPath: 'repair-pdf' 
  }); 
  
}

export default function RepairPDFPage() {
  return (
    <div className="container max-w-5xl py-12 mx-auto">
      <RepairHeaderSection />

      {/* Main Tool Card */}
      <div className="mb-12">
        <PdfRepairTool />
      </div>

      {/* How It Works */}
      <HowToRepairSection />

      {/* Benefits Section */}
      <WhyRepairSection />

      {/* Repair Modes Section */}
      <RepairModesSection />

      {/* FAQ Section */}
      <RepairFaqSection />

      {/* Best Practices Section */}
      <BestPracticesSection />

      {/* Related Tools Section */}
      <RelatedToolsSection />
    </div>
  );
}