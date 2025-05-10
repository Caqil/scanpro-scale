import { Metadata } from 'next';
import { Suspense, lazy } from 'react';
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

// Lazy load the main component
const PdfRemove = lazy(() => import('@/components/pdf-remove').then(mod => ({ default: mod.PdfRemove })));

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: paramLang } = await params;
  const lang = SUPPORTED_LANGUAGES.includes(paramLang as any) ? paramLang : 'en';

  return generatePageSeoMetadata(lang as any, { 
    translationPrefix: 'removePdf', 
    canonicalPath: 'remove-pdf' 
  }); 
}

export default function RemovePdfPage() {
  return (
    <div className="container max-full">
      <RemoveHeaderSection />
      
      {/* Main Tool Card */}
      <div className="mb-12">
        <Suspense fallback={<div className="bg-muted/30 rounded-lg p-4 w-full h-[600px]"></div>}>
          <PdfRemove />
        </Suspense>
      </div>
      
      {/* Other sections */}
      <HowToRemoveSection />
      <UseCasesSection />
      <RemovePdfFaqSection />
      <RelatedToolsSection />
    </div>
  );
}