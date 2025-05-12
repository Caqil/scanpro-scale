import { Metadata } from "next";
import { SUPPORTED_LANGUAGES } from '@/src/lib/i18n/config';
import { generatePageSeoMetadata } from "@/lib/seo/schemas";
import { 
  CropHeaderSection, 
  HowToCropSection, 
  WhyCropSection, 
  CropFaqSection, 
  BestPracticesSection, 
  RelatedToolsSection 
} from "./crop-content";
import { CropPdfClientWrapper } from "./client-wrapper";

// Add this line to force dynamic rendering
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: paramLang } = await params;
  const lang = SUPPORTED_LANGUAGES.includes(paramLang as any) ? paramLang : "en";

  // Use the SEO metadata generator
  return generatePageSeoMetadata(lang as any, { 
    translationPrefix: 'cropPdf', 
    canonicalPath: 'crop-pdf' 
  }); 
}

export default function CropPDFPage() {
  return (
    <div className="container max-full">
      <CropHeaderSection />
      
      {/* Main Tool Card */}
      <div className="mb-12">
        <CropPdfClientWrapper />
      </div>
      
      {/* How It Works */}
      <HowToCropSection />
      
      {/* Benefits Section */}
      <WhyCropSection />
      
      {/* FAQ Section */}
      <CropFaqSection />
      
      {/* Best Practices Section */}
      <BestPracticesSection />
      
      {/* Related Tools Section */}
      <RelatedToolsSection />
    </div>
  );
}