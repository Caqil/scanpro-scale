// app/[lang]/add-page-numbers/page.tsx
import { Metadata } from "next";
import { Suspense } from "react";
import { 
  PageNumbersHeaderSection,
  HowToAddPageNumbersSection,
  PageNumbersFaqSection,
  UseCasesSection,
  RelatedToolsSection,
  BenefitsSection
} from "./page-numbers-content";
import { AddPageNumbersClient } from "./page-numbers-client";
import { SUPPORTED_LANGUAGES } from '@/src/lib/i18n/config';
import { generatePageSeoMetadata } from "@/lib/seo/schemas";
import { SEO } from "@/components/SEO";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: paramLang } = await params;
  const lang = SUPPORTED_LANGUAGES.includes(paramLang as any) ? paramLang : "en";

  // Use the SEO metadata generator
  return generatePageSeoMetadata(lang as any, { 
    translationPrefix: 'pageNumber', 
    canonicalPath: 'page-numbers-pdf' 
  }); 
}

export default function AddPageNumbersPage() {
  return (
    <div className="container max-w-5xl py-12 mx-auto">
      <PageNumbersHeaderSection />
      
      {/* Main Tool Card */}
      <div className="mb-12">
        <Suspense fallback={<div>Loading...</div>}>
          <AddPageNumbersClient />
        </Suspense>
      </div>
      
      {/* How It Works */}
      <HowToAddPageNumbersSection />
      
      {/* Benefits Section */}
      <BenefitsSection />
      
      {/* Use Cases Section */}
      <UseCasesSection />
      
      {/* FAQ Section */}
      <PageNumbersFaqSection />
      
      {/* Related Tools Section */}
      <RelatedToolsSection />
    </div>
  );
}