"use client"

import { LanguageLink } from "@/components/language-link"
import { PdfOcr } from "@/components/pdf-ocr"
import { useLanguageStore } from "@/src/store/store"
import { Download, FileText, MergeIcon, Settings } from "lucide-react"

export function OcrContent() {
  const { t } = useLanguageStore()

  return (
    <div className="container max-w-5xl py-12 mx-auto">
      <div className="mb-12">
        <div className="mx-auto flex flex-col items-center text-center mb-8">
          <div className="mb-4 p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-purple-500"
            >
              <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
              <path d="M9 21h8a2 2 0 0 0 2-2V7l-5-4H7a2 2 0 0 0-2 2v2"></path>
              <path d="M9 13h6"></path>
              <path d="M9 17h3"></path>
              <text x="5" y="15" fontFamily="monospace" fontSize="3" fill="currentColor">
                T
              </text>
              <rect x="2" y="9" width="7" height="7" rx="1"></rect>
            </svg>
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {t("ocrPdf.title")}
          </h1>
          <p className="mt-4 text-xl text-muted-foreground max-w-[700px]">
            {t("ocrPdf.description")}
          </p>
        </div>
      </div>

      <div className="mb-12">
        <PdfOcr />
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-4">
            <span className="font-bold">1</span>
          </div>
          <h3 className="text-lg font-medium mb-2">{t("ocrPdf.step1Title")}</h3>
          <p className="text-sm text-muted-foreground">{t("ocrPdf.step1Description")}</p>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-4">
            <span className="font-bold">2</span>
          </div>
          <h3 className="text-lg font-medium mb-2">{t("ocrPdf.step2Title")}</h3>
          <p className="text-sm text-muted-foreground">{t("ocrPdf.step2Description")}</p>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-4">
            <span className="font-bold">3</span>
          </div>
          <h3 className="text-lg font-medium mb-2">{t("ocrPdf.step3Title")}</h3>
          <p className="text-sm text-muted-foreground">{t("ocrPdf.step3Description")}</p>
        </div>
      </div>

      <div className="mb-12 bg-muted/30 p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {t("ocrPdf.howItWorksTitle")}
        </h2>
        <p className="text-muted-foreground mb-4">
          {t("ocrPdf.howItWorksDescription")}
        </p>
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div className="flex gap-4">
            <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-purple-500"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                <line x1="9" x2="15" y1="9" y2="9"></line>
                <line x1="9" x2="15" y1="15" y2="15"></line>
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-lg mb-1">{t("ocrPdf.feature1Title")}</h3>
              <p className="text-sm text-muted-foreground">{t("ocrPdf.feature1Description")}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-purple-500"
              >
                <path d="m21 8-2 2-2-2-2 2-2-2-2 2-2-2-2 2-2-2"></path>
                <path d="M19 16v6"></path>
                <path d="M13 16v6"></path>
                <path d="M7 16v6"></path>
                <path d="M3 9v1"></path>
                <path d="M21 9v1"></path>
                <path d="M3 4v3"></path>
                <path d="M21 4v3"></path>
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-lg mb-1">{t("ocrPdf.feature2Title")}</h3>
              <p className="text-sm text-muted-foreground">{t("ocrPdf.feature2Description")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {t("ocrPdf.benefitsTitle")}
        </h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="border rounded-lg p-4 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-2 text-purple-500"
            >
              <path d="M10 21h7a2 2 0 0 0 2-2V9.414a1 1 0 0 0-.293-.707l-5.414-5.414A1 1 0 0 0 12.586 3H7a2 2 0 0 0-2 2v11"></path>
              <path d="M14 3v4a2 2 0 0 0 2 2h4"></path>
              <path d="m5 11 2 2 4-4"></path>
            </svg>
            <h3 className="font-medium">{t("ocrPdf.benefit1Title")}</h3>
            <p className="text-sm text-muted-foreground mt-2">{t("ocrPdf.benefit1Description")}</p>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-2 text-purple-500"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
              <path d="M14 2v6h6"></path>
              <path d="M16 13H8"></path>
              <path d="M16 17H8"></path>
              <path d="M10 9H8"></path>
            </svg>
            <h3 className="font-medium">{t("ocrPdf.benefit2Title")}</h3>
            <p className="text-sm text-muted-foreground mt-2">{t("ocrPdf.benefit2Description")}</p>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-2 text-purple-500"
            >
              <polyline points="22 7 12 2 2 7"></polyline>
              <path d="M2 7v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7"></path>
              <rect x="6" y="12" width="12" height="8"></rect>
              <path d="M2 19v3"></path>
              <path d="M22 19v3"></path>
            </svg>
            <h3 className="font-medium">{t("ocrPdf.benefit3Title")}</h3>
            <p className="text-sm text-muted-foreground mt-2">{t("ocrPdf.benefit3Description")}</p>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-2 text-purple-500"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            <h3 className="font-medium">{t("ocrPdf.benefit4Title")}</h3>
            <p className="text-sm text-muted-foreground mt-2">{t("ocrPdf.benefit4Description")}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {t("ocrPdf.faqTitle")}
        </h2>
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 text-primary"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 16v-4"></path>
              <path d="M12 8h.01"></path>
            </svg>
            {t("ocrPdf.faq1Question")}
          </h3>
          <p className="text-sm text-muted-foreground">{t("ocrPdf.faq1Answer")}</p>
        </div>
      </div>

      <section className="mt-12">
  <h2 className="text-2xl font-bold mb-6 text-center">{t('ocr.relatedTools')}</h2>
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <LanguageLink href="/convert/pdf-to-docx" className="border rounded-lg p-4 text-center hover:border-primary transition-colors">
      <div className="flex flex-col items-center">
        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-2">
          <FileText className="h-5 w-5 text-blue-500" />
        </div>
        <span className="text-sm font-medium">PDF to Word</span>
      </div>
    </LanguageLink>
    
    <LanguageLink href="/compress-pdf" className="border rounded-lg p-4 text-center hover:border-primary transition-colors">
      <div className="flex flex-col items-center">
        <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30 mb-2">
          <Download className="h-5 w-5 text-green-500" />
        </div>
        <span className="text-sm font-medium">Compress PDF</span>
      </div>
    </LanguageLink>
    
    <LanguageLink href="/merge-pdf" className="border rounded-lg p-4 text-center hover:border-primary transition-colors">
      <div className="flex flex-col items-center">
        <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30 mb-2">
          <MergeIcon className="h-5 w-5 text-red-500" />
        </div>
        <span className="text-sm font-medium">Merge PDFs</span>
      </div>
    </LanguageLink>
    
    <LanguageLink href="/pdf-tools" className="border rounded-lg p-4 text-center hover:border-primary transition-colors">
      <div className="flex flex-col items-center">
        <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-2">
          <Settings className="h-5 w-5 text-purple-500" />
        </div>
        <span className="text-sm font-medium">All Tools</span>
      </div>
    </LanguageLink>
  </div>
</section>
    </div>
  )
}
