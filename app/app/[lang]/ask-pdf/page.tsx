import { Metadata } from "next";
import { Suspense } from "react";
import { SUPPORTED_LANGUAGES } from "@/src/lib/i18n/config";
import { generatePageSeoMetadata } from "@/lib/seo/schemas";
import { AskPdfContent } from "./ask-pdf-content";

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
    translationPrefix: "pdfChat",
    canonicalPath: "ask-pdf",
  });
}

export default function AskPdfPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AskPdfContent />
    </Suspense>
  );
}
