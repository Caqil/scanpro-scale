// app/[lang]/remove-pdf/page.tsx
import { Metadata } from 'next';
import { PdfRemove } from '@/components/pdf-remove';
import {
  RemoveHeaderSection,
  HowToRemoveSection,
  BenefitsSection,
  UseCasesSection,
  RemovePdfFaqSection,
  RelatedToolsSection
} from './remove-content';
import { SUPPORTED_LANGUAGES } from '@/src/lib/i18n/config';
import { generatePageSeoMetadata } from '@/lib/seo/schemas';
import { Suspense } from 'react';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: paramLang } = await params;
  const lang = SUPPORTED_LANGUAGES.includes(paramLang as any) ? paramLang : 'en';

  // Use the new SEO metadata generator
  return generatePageSeoMetadata(lang as any, { 
    translationPrefix: 'removePdf', 
    canonicalPath: 'remove-pdf-page' 
  }); 
}

export default function RemovePdfPage() {
  return (
    <div className="container max-w-5xl py-12 mx-auto">
      <RemoveHeaderSection />
  <div className="mb-12">
        <Suspense fallback={<div>Loading...</div>}>
          <PdfRemove />
        </Suspense>
      </div>
      {/* Main Tool Card */}
    

      {/* How It Works */}
      <HowToRemoveSection />

      {/* Benefits Section */}
      <BenefitsSection />

      {/* Use Cases Section */}
      <UseCasesSection />

      {/* FAQ Section */}
      <RemovePdfFaqSection />

      {/* Related Tools Section */}
      <RelatedToolsSection />
    </div>
  );
}