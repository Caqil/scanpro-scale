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
import { SignPdfClient } from "./sign-pdf-client";
import { SUPPORTED_LANGUAGES } from '@/src/lib/i18n/config';
import { generatePageSeoMetadata } from "@/lib/seo/schemas";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: paramLang } = await params;
  const lang = SUPPORTED_LANGUAGES.includes(paramLang as any) ? paramLang : "en";

  // Use the SEO metadata generator
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
        <Suspense fallback={<div>Loading...</div>}>
          <SignPdfClient />
        </Suspense>
      </div>
      
      {/* How It Works */}
      <HowToSignSection />
      
      {/* Benefits Section */}
      <BenefitsSection />
      
      {/* Use Cases Section */}
      <UseCasesSection />
      
      {/* FAQ Section */}
      <SignPdfFaqSection />
      
      {/* Related Tools Section */}
      <RelatedToolsSection />
    </div>
  );
}