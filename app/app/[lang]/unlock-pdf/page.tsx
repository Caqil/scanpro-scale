import { Metadata } from "next";
import { PdfUnlocker } from "@/components/pdf-unlocker";
import { useLanguageStore } from "@/src/store/store";
import { Suspense } from "react";
import { BenefitsSection, FAQSection, HowToUnlockSection, RelatedToolsSection, UnlockHeaderSection, UseCasesSection } from "./unlock-content";
import { SUPPORTED_LANGUAGES } from '@/src/lib/i18n/config';
import { generatePageSeoMetadata } from "@/lib/seo/schemas";
import { SEO } from "@/components/SEO";


export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: paramLang } = await params;
  const lang = SUPPORTED_LANGUAGES.includes(paramLang as any) ? paramLang : "en";

  // Use the new SEO metadata generator
  return generatePageSeoMetadata(lang as any, { 
    translationPrefix: 'unlockPdf', 
    canonicalPath: 'unlock-pdf' 
  }); 
  
}


export default function UnlockPDFPage() {
 
  return (
    <div className="container max-w-5xl py-12 mx-auto">
     <UnlockHeaderSection/>

      {/* Main Tool Card */}
      <div className="mb-12">
         <Suspense> <PdfUnlocker /></Suspense>
      </div>

      {/* How It Works */}
      <HowToUnlockSection />
      <BenefitsSection />
      <UseCasesSection />
      {/* FAQ Section */}
      <FAQSection />

      {/* Related Tools Section */}
      <RelatedToolsSection />
    </div>
  );
}