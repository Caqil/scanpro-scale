"use client";
import { useLanguageStore } from "@/src/store/store";
import { ArrowRightIcon, FileIcon, InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageLink } from "@/components/language-link";
import ClientMergePDFContent from "./client-merge-content";
import { useSearchParams } from "next/navigation";

export default function MergePDFClient() {
    const { t } = useLanguageStore()
  return (
    <div className="container max-w-5xl py-12 mx-auto">
      <div className="mx-auto flex flex-col items-center text-center mb-8">
        <div className="mb-4 p-3 rounded-full bg-red-100 dark:bg-red-900/30">
          <ArrowRightIcon className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {t("mergePdf.title") || t("mergePdf.title")}
        </h1>
        <p className="mt-4 text-xl text-muted-foreground max-w-[700px]">
          {t("mergePdf.description") || t("mergePdf.description")}
        </p>
      </div>
      
      {/* Main content */}
      <div className="mb-8">
        <ClientMergePDFContent />
      </div>
      
      {/* How It Works section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">{t("mergePdf.howTo.title")}</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-4">
              <span className="font-bold">1</span>
            </div>
            <h3 className="text-lg font-medium mb-2">{t("mergePdf.howTo.step1.title")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("mergePdf.howTo.step1.description")}
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-4">
              <span className="font-bold">2</span>
            </div>
            <h3 className="text-lg font-medium mb-2">{t("mergePdf.howTo.step2.title")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("mergePdf.howTo.step2.description")}
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-4">
              <span className="font-bold">3</span>
            </div>
            <h3 className="text-lg font-medium mb-2">{t("mergePdf.howTo.step3.title")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("mergePdf.howTo.step3.description")}
            </p>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">{t("mergePdf.benefits.title")}</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-medium mb-2">{t("mergePdf.benefits.compatibility.title")}</h3>
            <p className="text-muted-foreground">
              {t("mergePdf.benefits.compatibility.description")}
            </p>
          </div>
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-medium mb-2">{t("mergePdf.benefits.privacy.title")}</h3>
            <p className="text-muted-foreground">
              {t("mergePdf.benefits.privacy.description")}
            </p>
          </div>
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-medium mb-2">{t("mergePdf.benefits.simplicity.title")}</h3>
            <p className="text-muted-foreground">
              {t("mergePdf.benefits.simplicity.description")}
            </p>
          </div>
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-medium mb-2">{t("mergePdf.benefits.quality.title")}</h3>
            <p className="text-muted-foreground">
              {t("mergePdf.benefits.quality.description")}
            </p>
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">{t("mergePdf.useCases.title")}</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-medium mb-2">{t("mergePdf.useCases.business.title")}</h3>
            <p className="text-muted-foreground">
              {t("mergePdf.useCases.business.description")}
            </p>
          </div>
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-medium mb-2">{t("mergePdf.useCases.academic.title")}</h3>
            <p className="text-muted-foreground">
              {t("mergePdf.useCases.academic.description")}
            </p>
          </div>
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-medium mb-2">{t("mergePdf.useCases.personal.title")}</h3>
            <p className="text-muted-foreground">
              {t("mergePdf.useCases.personal.description")}
            </p>
          </div>
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-medium mb-2">{t("mergePdf.useCases.professional.title")}</h3>
            <p className="text-muted-foreground">
              {t("mergePdf.useCases.professional.description")}
            </p>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">{t("mergePdf.tips.title")}</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-medium mb-2">{t("mergePdf.tips.tip1.title")}</h3>
            <p className="text-muted-foreground">
              {t("mergePdf.tips.tip1.description")}
            </p>
          </div>
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-medium mb-2">{t("mergePdf.tips.tip2.title")}</h3>
            <p className="text-muted-foreground">
              {t("mergePdf.tips.tip2.description")}
            </p>
          </div>
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-medium mb-2">{t("mergePdf.tips.tip3.title")}</h3>
            <p className="text-muted-foreground">
              {t("mergePdf.tips.tip3.description")}
            </p>
          </div>
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-medium mb-2">{t("mergePdf.tips.tip4.title")}</h3>
            <p className="text-muted-foreground">
              {t("mergePdf.tips.tip4.description")}
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">{t("mergePdf.comparison.title")}</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-medium mb-2">{t("mergePdf.comparison.point1.title")}</h3>
            <p className="text-muted-foreground">
              {t("mergePdf.comparison.point1.description")}
            </p>
          </div>
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-medium mb-2">{t("mergePdf.comparison.point2.title")}</h3>
            <p className="text-muted-foreground">
              {t("mergePdf.comparison.point2.description")}
            </p>
          </div>
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-medium mb-2">{t("mergePdf.comparison.point3.title")}</h3>
            <p className="text-muted-foreground">
              {t("mergePdf.comparison.point3.description")}
            </p>
          </div>
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-medium mb-2">{t("mergePdf.comparison.point4.title")}</h3>
            <p className="text-muted-foreground">
              {t("mergePdf.comparison.point4.description")}
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">{t("mergePdf.faq.title")}</h2>
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2 flex items-center">
              <InfoIcon className="h-4 w-4 mr-2 text-primary" />
              {t("mergePdf.faq.q1.question")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("mergePdf.faq.q1.answer")}
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2 flex items-center">
              <InfoIcon className="h-4 w-4 mr-2 text-primary" />
              {t("mergePdf.faq.q2.question")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("mergePdf.faq.q2.answer")}
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2 flex items-center">
              <InfoIcon className="h-4 w-4 mr-2 text-primary" />
              {t("mergePdf.faq.q3.question")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("mergePdf.faq.q3.answer")}
            </p>
          </div>
        </div>
      </div>

      {/* More Tools Section */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-center">{t("mergePdf.relatedTools")}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <LanguageLink href="/split-pdf" className="border rounded-lg p-4 text-center hover:border-primary transition-colors">
            <div className="flex flex-col items-center">
              <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30 mb-2">
                <ArrowRightIcon className="h-5 w-5 text-red-500" />
              </div>
              <span className="text-sm font-medium">{t("popular.splitPdf")}</span>
            </div>
          </LanguageLink>
          <LanguageLink href="/compress-pdf" className="border rounded-lg p-4 text-center hover:border-primary transition-colors">
            <div className="flex flex-col items-center">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30 mb-2">
                <ArrowRightIcon className="h-5 w-5 text-green-500" />
              </div>
              <span className="text-sm font-medium">{t("popular.compressPdf")}</span>
            </div>
          </LanguageLink>
          <LanguageLink href="/convert/pdf-to-docx" className="border rounded-lg p-4 text-center hover:border-primary transition-colors">
            <div className="flex flex-col items-center">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-2">
                <FileIcon className="h-5 w-5 text-blue-500" />
              </div>
              <span className="text-sm font-medium">{t("popular.pdfToWord")}</span>
            </div>
          </LanguageLink>
          <LanguageLink href="/ocr" className="border rounded-lg p-4 text-center hover:border-primary transition-colors">
            <div className="flex flex-col items-center">
              <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-2">
                <FileIcon className="h-5 w-5 text-purple-500" />
              </div>
              <span className="text-sm font-medium">{t("popular.ocr")}</span>
            </div>
          </LanguageLink>
        </div>
        <div className="text-center mt-6">
          <LanguageLink href="/pdf-tools">
            <Button variant="outline">{t("mergePdf.viewAllTools")}</Button>
          </LanguageLink>
        </div>
      </div>
    </div>
  );
}