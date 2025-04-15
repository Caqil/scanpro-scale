import { Metadata } from "next";
import { PdfPasswordProtector } from "@/components/pdf-password-protector";
import {
  ProtectHeaderSection,
  HowToProtectSection,
  WhyProtectSection,
  SecurityExplainedSection,
  BestPracticesSection,
  RelatedToolsSection,
  ProtectFaqSection
} from "./protect-content";
import { SUPPORTED_LANGUAGES } from '@/src/lib/i18n/config';
import { generatePageSeoMetadata } from "@/lib/seo/schemas";
import { SEO } from "@/components/SEO";
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: paramLang } = await params;
  const lang = SUPPORTED_LANGUAGES.includes(paramLang as any) ? paramLang : "en";

  // Use the new SEO metadata generator
  return generatePageSeoMetadata(lang as any, { 
    translationPrefix: 'protectPdf', 
    canonicalPath: 'protect-pdf' 
  }); 
  
}
export default function ProtectPDFPage() {
  return (
    <div className="container max-w-5xl py-12 mx-auto">
      <ProtectHeaderSection />

      {/* Main Tool Card */}
      <div className="mb-12">
        <PdfPasswordProtector />
      </div>

      {/* How It Works */}
      <HowToProtectSection />

      {/* Benefits Section */}
      <WhyProtectSection />

      {/* Security Explained Section */}
      <SecurityExplainedSection />

      {/* FAQ Section */}
      <ProtectFaqSection />

      {/* Best Practices Section */}
      <BestPracticesSection />

      {/* Related Tools Section */}
      <RelatedToolsSection />
    </div>
  );
}