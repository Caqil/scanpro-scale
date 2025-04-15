"use client";

import {
  RotateCw,
  FileText,
  RefreshCcw,
  Info,
  Check,
  AlertTriangle,
  RotateCcw,
  FileIcon,
  Smartphone,
  ArrowUpDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageLink } from "@/components/language-link";
import { useLanguageStore } from "@/src/store/store";

export function RotateHeaderSection() {
  const { t } = useLanguageStore();

  return (
    <div className="mx-auto flex flex-col items-center text-center mb-8">
      <div className="mb-4 p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
        <RotateCw className="h-8 w-8 text-indigo-500" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        {t("rotatePdf.title")}
      </h1>
      <p className="mt-4 text-xl text-muted-foreground max-w-[700px]">
        {t("rotatePdf.description")}
      </p>
    </div>
  );
}

export function HowToRotateSection() {
  const { t } = useLanguageStore();

  const steps = [
    {
      title: t("rotatePdf.howTo.step1.title"),
      description: t("rotatePdf.howTo.step1.description")
    },
    {
      title: t("rotatePdf.howTo.step2.title"),
      description: t("rotatePdf.howTo.step2.description")
    },
    {
      title: t("rotatePdf.howTo.step3.title"),
      description: t("rotatePdf.howTo.step3.description")
    }
  ];

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {t("rotatePdf.howTo.title")}
      </h2>
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

export function WhyRotateSection() {
  const { t } = useLanguageStore();

  const reasons = [
    {
      icon: <RotateCw className="h-5 w-5 text-indigo-500" />,
      title: t("rotatePdf.why.fixScanned.title"),
      description: t("rotatePdf.why.fixScanned.description")
    },
    {
      icon: <Smartphone className="h-5 w-5 text-indigo-500" />,
      title: t("rotatePdf.why.printing.title"),
      description: t("rotatePdf.why.printing.description")
    },
    {
      icon: <ArrowUpDown className="h-5 w-5 text-indigo-500" />,
      title: t("rotatePdf.why.mixedOrientation.title"),
      description: t("rotatePdf.why.mixedOrientation.description")
    },
    {
      icon: <FileText className="h-5 w-5 text-indigo-500" />,
      title: t("rotatePdf.why.presentation.title"),
      description: t("rotatePdf.why.presentation.description")
    }
  ];

  return (
    <div className="mb-12 p-6 bg-muted/30 rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">{t("rotatePdf.why.title")}</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {reasons.map((reason, index) => (
          <div key={index} className="flex gap-4">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0">
              {reason.icon}
            </div>
            <div>
              <h3 className="font-medium text-lg mb-1">{reason.title}</h3>
              <p className="text-sm text-muted-foreground">{reason.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RotateFaqSection() {
  const { t } = useLanguageStore();

  const faqs = [
    {
      question: t("rotatePdf.faq.permanent.question"),
      answer: t("rotatePdf.faq.permanent.answer")
    },
    {
      question: t("rotatePdf.faq.quality.question"),
      answer: t("rotatePdf.faq.quality.answer")
    },
    {
      question: t("rotatePdf.faq.size.question"),
      answer: t("rotatePdf.faq.size.answer")
    },
    {
      question: t("rotatePdf.faq.limitations.question"),
      answer: t("rotatePdf.faq.limitations.answer")
    },
    {
      question: t("rotatePdf.faq.secured.question"),
      answer: t("rotatePdf.faq.secured.answer")
    }
  ];

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center">{t("rotatePdf.faq.title")}</h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border rounded-lg p-4">
            <h3 className="font-medium mb-2 flex items-center">
              <Info className="h-4 w-4 mr-2 text-primary" />
              {faq.question}
            </h3>
            <p className="text-sm text-muted-foreground">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BestPracticesSection() {
  const { t } = useLanguageStore();

  const dosList = t("rotatePdf.bestPractices.dosList");
  const dontsList = t("rotatePdf.bestPractices.dontsList");

  return (
    <div className="mb-12 bg-muted/30 p-6 rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">{t("rotatePdf.bestPractices.title")}</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="text-lg font-medium mb-3 text-primary">{t("rotatePdf.bestPractices.dos")}</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {Array.isArray(dosList) &&
              dosList.map((item, index) => (
                <li key={index} className="flex items-start">
                  <Check className="text-green-500 mr-2 mt-0.5 h-4 w-4" />
                  {item}
                </li>
              ))}
          </ul>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="text-lg font-medium mb-3 text-destructive">{t("rotatePdf.bestPractices.donts")}</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {Array.isArray(dontsList) &&
              dontsList.map((item, index) => (
                <li key={index} className="flex items-start">
                  <AlertTriangle className="text-red-500 mr-2 mt-0.5 h-4 w-4" />
                  {item}
                </li>
              ))}
          </ul>
        </div>
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
      name: t("rotatePdf.relatedTools.merge"),
      bg: "bg-red-100 dark:bg-red-900/30"
    },
    {
      href: "/split-pdf",
      icon: <FileIcon className="h-5 w-5 text-green-500" />,
      name: t("rotatePdf.relatedTools.split"),
      bg: "bg-green-100 dark:bg-green-900/30"
    },
    {
      href: "/compress-pdf",
      icon: <FileIcon className="h-5 w-5 text-blue-500" />,
      name: t("rotatePdf.relatedTools.compress"),
      bg: "bg-blue-100 dark:bg-blue-900/30"
    },
    {
      href: "/edit-pdf",
      icon: <FileIcon className="h-5 w-5 text-purple-500" />,
      name: t("rotatePdf.relatedTools.edit"),
      bg: "bg-purple-100 dark:bg-purple-900/30"
    }
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center">{t("rotatePdf.relatedTools.title")}</h2>
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
          <Button variant="outline">{t("rotatePdf.relatedTools.viewAll")}</Button>
        </LanguageLink>
      </div>
    </div>
  );
}
