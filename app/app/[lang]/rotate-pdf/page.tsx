import { Metadata } from "next";
import { Suspense } from "react";
import { SUPPORTED_LANGUAGES } from "@/src/lib/i18n/config";
import { generatePageSeoMetadata } from "@/lib/seo/schemas";
import {
  HowToRotateSection,
  RelatedToolsSection,
  RotateFaqSection,
  RotateHeaderSection,
  WhyRotateSection,
} from "./rotate-content";
import { PdfRotator } from "@/components/pdf-rotator";
import { RotatePdfClientWrapper } from "./client-wrapper";

// Add this line to force dynamic rendering
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: paramLang } = await params;
  const lang = SUPPORTED_LANGUAGES.includes(paramLang as any)
    ? paramLang
    : "en";

  // Use the SEO metadata generator
  return generatePageSeoMetadata(lang as any, {
    translationPrefix: "rotatePdf",
    canonicalPath: "rotate-pdf",
  });
}

export default function RotatePDFPage() {
  return (
    <div className="container max-full">
      <RotateHeaderSection />

      {/* Main Tool Card */}
      <div className="mb-12">
        <RotatePdfClientWrapper />
      </div>

      {/* How It Works */}
      <HowToRotateSection />

      {/* Benefits Section */}
      <WhyRotateSection />

      {/* FAQ Section */}
      <RotateFaqSection />

      {/* Related Tools Section */}
      <RelatedToolsSection />
    </div>
  );
}
