"use client"
import { ScissorsIcon, FileIcon, InfoIcon, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageLink } from "@/components/language-link";
import { useLanguageStore } from "@/src/store/store";
export function SplitHeaderSection() {
  const { t } = useLanguageStore();
  return (
    <div className="mx-auto flex flex-col items-center text-center mb-8">
      <div className="mb-4 p-3 rounded-full bg-orange-100 dark:bg-orange-900/30">
        <ScissorsIcon className="h-8 w-8 text-orange-500" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        {t("splitPdf.title")}
      </h1>
      <p className="mt-4 text-xl text-muted-foreground max-w-[700px]">
        {t("splitPdf.description")}
      </p>
    </div>
  );
}

export function HowToSplitSection() {
  const { t } = useLanguageStore();
  const steps = [
    {
      title: t("splitPdf.howTo.step1.title"),
      description: t("splitPdf.howTo.step1.description"),
    },
    {
      title: t("splitPdf.howTo.step2.title"),
      description: t("splitPdf.howTo.step2.description"),
    },
    {
      title: t("splitPdf.howTo.step3.title"),
      description: t("splitPdf.howTo.step3.description"),
    },
  ];

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center">{t("splitPdf.howTo.title")}</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-4">
              <span className="font-bold">{index + 1}</span>
            </div>
            <h3 className="text-lg font-medium mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WhyUseSection() {
  const { t } = useLanguageStore();
  return (
    <div className="mb-12 bg-muted/30 p-6 rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {t("splitPdf.newSection.title")}
      </h2>
      <p className="text-muted-foreground max-w-[800px] mx-auto">
        {t("splitPdf.newSection.description")}
      </p>
      <p className="mt-4 text-muted-foreground">
        {t("splitPdf.newSection.additional")}
      </p>
    </div>
  );
}

export function SplitUseCasesSection() {
  const { t } = useLanguageStore();
  const useCases = [
    {
      icon: <FileText className="h-6 w-6 text-blue-500" />,
      title: t("splitPdf.useCases.chapters.title"),
      description: t("splitPdf.useCases.chapters.description"),
    },
    {
      icon: <FileIcon className="h-6 w-6 text-green-500" />,
      title: t("splitPdf.useCases.extract.title"),
      description: t("splitPdf.useCases.extract.description"),
    },
    {
      icon: <ScissorsIcon className="h-6 w-6 text-orange-500" />,
      title: t("splitPdf.useCases.remove.title"),
      description: t("splitPdf.useCases.remove.description"),
    },
    {
      icon: <FileIcon className="h-6 w-6 text-purple-500" />,
      title: t("splitPdf.useCases.size.title"),
      description: t("splitPdf.useCases.size.description"),
    },
  ];

  return (
    <div className="mb-12 bg-muted/30 p-6 rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">{t("splitPdf.useCases.title")}</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {useCases.map((useCase, index) => (
          <div key={index} className="flex gap-4">
            <div className="bg-background rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0">
              {useCase.icon}
            </div>
            <div>
              <h3 className="font-medium text-lg mb-1">{useCase.title}</h3>
              <p className="text-sm text-muted-foreground">{useCase.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SplitPdfFaqSection() {
  const { t } = useLanguageStore();
  const faqItems = [
    {
      question: t("splitPdf.faq.q1.question"),
      answer: t("splitPdf.faq.q1.answer"),
    },
    {
      question: t("splitPdf.faq.q2.question"),
      answer: t("splitPdf.faq.q2.answer"),
    },
    {
      question: t("splitPdf.faq.q3.question"),
      answer: t("splitPdf.faq.q3.answer"),
    },
    {
      question: t("splitPdf.faq.q4.question"),
      answer: t("splitPdf.faq.q4.answer"),
    },
  ];

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center">{t("splitPdf.faq.title")}</h2>
      <div className="space-y-4">
        {faqItems.map((item, index) => (
          <div key={index} className="border rounded-lg p-4">
            <h3 className="font-medium mb-2 flex items-center">
              <InfoIcon className="h-4 w-4 mr-2 text-primary" />
              {item.question}
            </h3>
            <p className="text-sm text-muted-foreground">{item.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RelatedToolsSection() {
  const { t } = useLanguageStore();
  const tools = [
    {
      href: "/merge-pdf",
      icon: <FileIcon className="h-5 w-5 text-red-500" />,
      name: "Merge PDF",
      bg: "bg-red-100 dark:bg-red-900/30",
    },
    {
      href: "/compress-pdf",
      icon: <FileIcon className="h-5 w-5 text-green-500" />,
      name: "Compress PDF",
      bg: "bg-green-100 dark:bg-green-900/30",
    },
    {
      href: "/convert/pdf-to-docx",
      icon: <FileIcon className="h-5 w-5 text-blue-500" />,
      name: "PDF to Word",
      bg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      href: "/protect-pdf",
      icon: <FileIcon className="h-5 w-5 text-purple-500" />,
      name: "Protect PDF",
      bg: "bg-purple-100 dark:bg-purple-900/30",
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center">{t("mergePdf.relatedTools")}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tools.map((tool) => (
          <LanguageLink
            key={tool.href}
            href={tool.href}
            className="border rounded-lg p-4 text-center hover:border-primary transition-colors"
          >
            <div className="flex flex-col items-center">
              <div className={`p-2 rounded-full ${tool.bg} mb-2`}>{tool.icon}</div>
              <span className="text-sm font-medium">{tool.name}</span>
            </div>
          </LanguageLink>
        ))}
      </div>
      <div className="text-center mt-6">
        <LanguageLink href="/pdf-tools">
          <Button variant="outline">{t("splitPdf.popular.viewAll")}</Button>
        </LanguageLink>
      </div>
    </div>
  );
}

export function SeoContentSection() {
  const { t } = useLanguageStore();
  return (
    <div className="mt-12 text-muted-foreground">
      <h2 className="text-2xl font-bold mb-4">{t("splitPdf.seoContent.title")}</h2>
      <p>{t("splitPdf.seoContent.p1")}</p>
      <p className="mt-4">{t("splitPdf.seoContent.p2")}</p>
      <p className="mt-4">{t("splitPdf.seoContent.p3")}</p>
      <p className="mt-4">{t("splitPdf.seoContent.p4")}</p>
    </div>
  );
}