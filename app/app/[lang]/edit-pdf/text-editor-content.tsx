"use client";
import { Pencil1Icon, FileTextIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { LanguageLink } from "@/components/language-link";
import { useLanguageStore } from "@/src/store/store";
import { EditIcon, SaveIcon } from "lucide-react";

export function TextEditorHeaderSection() {
  const { t } = useLanguageStore();

  return (
    <div className="mx-auto flex flex-col items-center text-center mb-8">
      <div className="mb-4 p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
        <Pencil1Icon className="h-8 w-8 text-blue-500" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        {t("pdfTextEditor.title")}
      </h1>
      <p className="mt-4 text-xl text-muted-foreground max-w-[700px]">
        {t("pdfTextEditor.description")}
      </p>
    </div>
  );
}

export function HowToEditTextSection() {
  const { t } = useLanguageStore();
  const steps = [
    {
      title: t("pdfTextEditor.howTo.step1.title"),
      description: t("pdfTextEditor.howTo.step1.description"),
      icon: <FileTextIcon className="h-6 w-6 text-blue-500" />,
    },
    {
      title: t("pdfTextEditor.howTo.step2.title"),
      description: t("pdfTextEditor.howTo.step2.description"),
      icon: <EditIcon className="h-6 w-6 text-green-500" />,
    },
    {
      title: t("pdfTextEditor.howTo.step3.title"),
      description: t("pdfTextEditor.howTo.step3.description"),
      icon: <SaveIcon className="h-6 w-6 text-purple-500" />,
    },
  ];

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {t("pdfTextEditor.howTo.title")}
      </h2>
      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              {step.icon}
            </div>
            <h3 className="text-lg font-medium mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TextEditorFeaturesSection() {
  const { t } = useLanguageStore();
  const features = [
    {
      title: t("pdfTextEditor.features.preserve"),
      description: t("pdfTextEditor.features.preserve"),
      icon: "🎯",
    },
    {
      title: t("pdfTextEditor.features.visual"),
      description: t("pdfTextEditor.features.visual"),
      icon: "👆",
    },
    {
      title: t("pdfTextEditor.features.multipage"),
      description: t("pdfTextEditor.features.multipage"),
      icon: "📄",
    },
    {
      title: t("pdfTextEditor.features.fonts"),
      description: t("pdfTextEditor.features.fonts"),
      icon: "🔤",
    },
  ];

  return (
    <div className="mb-12 bg-muted/30 p-6 rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {t("pdfTextEditor.features.title")}
      </h2>
      <div className="grid md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <div key={index} className="flex gap-4">
            <div className="text-2xl flex-shrink-0">{feature.icon}</div>
            <div>
              <h3 className="font-medium text-lg mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TextEditorUseCasesSection() {
  const { t } = useLanguageStore();
  const useCases = [
    {
      title: t("pdfTextEditor.useCases.documentTranslation.title"),
      description: t("pdfTextEditor.useCases.documentTranslation.description"),
      icon: "🌐",
    },
    {
      title: t("pdfTextEditor.useCases.contentCorrection.title"),
      description: t("pdfTextEditor.useCases.contentCorrection.description"),
      icon: "✏️",
    },
    {
      title: t("pdfTextEditor.useCases.templateCustomization.title"),
      description: t(
        "pdfTextEditor.useCases.templateCustomization.description"
      ),
      icon: "📋",
    },
    {
      title: t("pdfTextEditor.useCases.rebrandingDocuments.title"),
      description: t("pdfTextEditor.useCases.rebrandingDocuments.description"),
      icon: "🏢",
    },
  ];

  return (
    <div className="mb-12 bg-muted/30 p-6 rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {t("pdfTextEditor.useCases.title")}
      </h2>
      <div className="grid md:grid-cols-2 gap-6">
        {useCases.map((useCase, index) => (
          <div key={index} className="flex gap-4">
            <div className="text-2xl flex-shrink-0">{useCase.icon}</div>
            <div>
              <h3 className="font-medium text-lg mb-1">{useCase.title}</h3>
              <p className="text-sm text-muted-foreground">
                {useCase.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TextEditorRelatedToolsSection() {
  const { t } = useLanguageStore();
  const tools = [
    {
      href: "/convert",
      name: t("pdfTextEditor.relatedTools.convertPDF.title"),
      description: t("pdfTextEditor.relatedTools.convertPDF.description"),
      bg: "bg-blue-100 dark:bg-blue-900/30",
      icon: "🔄",
    },
    {
      href: "/watermark-pdf",
      name: t("pdfTextEditor.relatedTools.watermarkPDF.title"),
      description: t("pdfTextEditor.relatedTools.watermarkPDF.description"),
      bg: "bg-green-100 dark:bg-green-900/30",
      icon: "🏷️",
    },
    {
      href: "/merge-pdf",
      name: t("pdfTextEditor.relatedTools.mergePDF.title"),
      description: t("pdfTextEditor.relatedTools.mergePDF.description"),
      bg: "bg-purple-100 dark:bg-purple-900/30",
      icon: "📎",
    },
    {
      href: "/split-pdf",
      name: t("pdfTextEditor.relatedTools.splitPDF.title"),
      description: t("pdfTextEditor.relatedTools.splitPDF.description"),
      bg: "bg-orange-100 dark:bg-orange-900/30",
      icon: "✂️",
    },
  ];

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {t("pdfTextEditor.relatedTools.title")}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tools.map((tool) => (
          <LanguageLink
            key={tool.href}
            href={tool.href}
            className="border rounded-lg p-4 text-center hover:border-primary transition-colors"
          >
            <div className="flex flex-col items-center">
              <div className={`p-3 rounded-full ${tool.bg} mb-3`}>
                <span className="text-2xl">{tool.icon}</span>
              </div>
              <span className="text-sm font-medium mb-1">{tool.name}</span>
              <span className="text-xs text-muted-foreground">
                {tool.description}
              </span>
            </div>
          </LanguageLink>
        ))}
      </div>
      <div className="text-center mt-6">
        <LanguageLink href="/pdf-tools">
          <Button variant="outline">
            {t("pdfTextEditor.relatedTools.viewAllPDFTools")}
          </Button>
        </LanguageLink>
      </div>
    </div>
  );
}

export default function SeoContent() {
  const { t } = useLanguageStore();

  return (
    <div className="container max-w-5xl py-12 mx-auto">
      <div className="mt-12 text-muted-foreground">
        <h2 className="text-2xl font-bold mb-4">
          {t("pdfTextEditor.seoContent.title")}
        </h2>
        <p>{t("pdfTextEditor.seoContent.paragraph1")}</p>
        <p className="mt-4">{t("pdfTextEditor.seoContent.paragraph2")}</p>
        <p className="mt-4">{t("pdfTextEditor.seoContent.paragraph3")}</p>
      </div>
    </div>
  );
}