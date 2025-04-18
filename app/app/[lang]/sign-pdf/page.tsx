import { Metadata } from "next";
import { Suspense } from "react";
import { 
  SignHeaderSection,
  HowToSignSection,
  BenefitsSection,
  UseCasesSection,
  SignPdfFaqSection,
  RelatedToolsSection
} from "./sign-content";
import { SignPdfClientWrapper } from "./client-wrapper";
import { SUPPORTED_LANGUAGES } from '@/src/lib/i18n/config';
import { generatePageSeoMetadata } from "@/lib/seo/schemas";

// Add this line to force dynamic rendering
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: paramLang } = await params;
  const lang = SUPPORTED_LANGUAGES.includes(paramLang as any) ? paramLang : "en";

  return generatePageSeoMetadata(lang as any, { 
    translationPrefix: 'signPdf', 
    canonicalPath: 'sign-pdf' 
  }); 
}

export default function SignPdfPage() {
  return (
    <div className="container max-full">
      <SignHeaderSection />
      
      {/* Main Tool Card */}
      <div className="mb-12">
        <SignPdfClientWrapper />
      </div>
      
      {/* Other sections */}
      <HowToSignSection />
      <BenefitsSection />
      <UseCasesSection />
      <SignPdfFaqSection />
      <RelatedToolsSection />
    </div>
  );
}