"use client";

import { useLanguageStore } from "@/src/store/store";
import { LanguageLink } from "@/components/language-link";

export function ToolsHeaderSection() {
  const { t } = useLanguageStore();
  

  return (
    <div className="mx-auto max-w-3xl text-center mb-8 md:mb-12">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
            {t('pdfTools.title')}
          </h1>
          <p className="mt-4 text-xl text-muted-foreground">
          {t('pdfTools.description')}
          </p>
        </div>
  );
}
