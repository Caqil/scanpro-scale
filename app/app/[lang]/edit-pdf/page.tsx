import { Metadata } from "next";
import {
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
        <Suspense fallback={<div>Loading PDF Text Editor...</div>}>
          <PdfTextEditor />
        </Suspense>
      </div>

      <HowToEditTextSection />
      <TextEditorFeaturesSection />
      <TextEditorUseCasesSection />
      <TextEditorRelatedToolsSection />

      {/* SEO Content */}
      <div className="mt-12 text-muted-foreground">
        <h2 className="text-2xl font-bold mb-4">Advanced PDF Text Editing</h2>
        <p>
          Our PDF text editor provides professional-grade text editing
          capabilities for PDF documents. Unlike simple PDF editors, our tool
          preserves the exact positioning and formatting of your original
          document while allowing you to modify text content.
        </p>
        <p className="mt-4">
          The extraction process uses advanced algorithms to identify text
          blocks, font information, and positioning data. This ensures that when
          you save your edited PDF, it maintains the professional appearance of
          the original document.
        </p>
        <p className="mt-4">
          Perfect for businesses, legal documents, forms, and any PDF where you
          need to make text changes without affecting the overall layout and
          design.
        </p>
      </div>
    </div>
  );
}
