import { Metadata } from "next";
import SeoContent, {
  TextEditorHeaderSection,
  HowToEditTextSection,
  TextEditorFeaturesSection,
  TextEditorUseCasesSection,
  TextEditorRelatedToolsSection,
} from "./text-editor-content";
import { Suspense } from "react";
import { SUPPORTED_LANGUAGES } from "@/src/lib/i18n/config";
import { generatePageSeoMetadata } from "@/lib/seo/schemas";
import { PdfTextEditor } from "@/components/pdf-editor";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: paramLang } = await params;
  const lang = SUPPORTED_LANGUAGES.includes(paramLang as any)
    ? paramLang
    : "en";

  return generatePageSeoMetadata(lang as any, {
    translationPrefix: "pdfTextEditor",
    canonicalPath: "edit-pdf-text",
  });
}

export default function EditPdfTextPage() {
  return (
    <div className="container max-w-5xl py-12 mx-auto">
      <TextEditorHeaderSection />

      <div className="mb-12">
        <Suspense fallback={<div>{"loading...."}</div>}>
          <PdfTextEditor />
        </Suspense>
      </div>

      <HowToEditTextSection />
      <TextEditorFeaturesSection />
      <TextEditorUseCasesSection />
      <TextEditorRelatedToolsSection />
      <SeoContent />
    </div>
  );
}
