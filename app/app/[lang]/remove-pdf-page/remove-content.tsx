"use client";

import { FileTextIcon, Trash2Icon, CheckCircleIcon, AlertCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageLink } from "@/components/language-link";
import { useLanguageStore } from "@/src/store/store";

export function RemoveHeaderSection() {
  const { t } = useLanguageStore();
  
  return (
    <div className="mx-auto flex flex-col items-center text-center mb-8">
      <div className="mb-4 p-3 rounded-full bg-red-100 dark:bg-red-900/30">
        <Trash2Icon className="h-8 w-8 text-red-500" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        {t('removePdf.title')}
      </h1>
      <p className="mt-4 text-xl text-muted-foreground max-w-[700px]">
        {t('removePdf.description')}
      </p>
    </div>
  );
}

export function HowToRemoveSection() {
  const { t } = useLanguageStore();
  
  const steps = [
    {
      title: t('removePdf.howTo.step1.title'),
      description: t('removePdf.howTo.step1.description')
    },
    {
      title: t('removePdf.howTo.step2.title'),
      description: t('removePdf.howTo.step2.description')
    },
    {
      title: t('removePdf.howTo.step3.title'),
      description: t('removePdf.howTo.step3.description')
    }
  ];

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center">{t('removePdf.howTo.title')}</h2>
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

export function BenefitsSection() {
  const { t } = useLanguageStore();
  
  const benefits = [
    {
      icon: <CheckCircleIcon className="h-6 w-6 text-green-500" />,
      title: t('removePdf.benefits.accuracy.title'),
      description: t('removePdf.benefits.accuracy.description')
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M9 11H4a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h5"/><path d="M15 11h5a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-5"/><line x1="12" y1="3" x2="12" y2="21"/></svg>,
      title: t('removePdf.benefits.preview.title'),
      description: t('removePdf.benefits.preview.description')
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>,
      title: t('removePdf.benefits.secure.title'),
      description: t('removePdf.benefits.secure.description')
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 1 1 0 7H6"></path></svg>,
      title: t('removePdf.benefits.flexible.title'),
      description: t('removePdf.benefits.flexible.description')
    }
  ];

  return (
    <div className="mb-12 p-6 bg-muted/30 rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">{t('removePdf.benefits.title')}</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {benefits.map((benefit, index) => (
          <div key={index} className="flex gap-4">
            <div className="bg-background rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0">
              {benefit.icon}
            </div>
            <div>
              <h3 className="font-medium text-lg mb-1">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground">{benefit.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function UseCasesSection() {
  const { t } = useLanguageStore();
  
  const useCases = [
    {
      icon: <FileTextIcon className="h-6 w-6 text-blue-500" />,
      title: t('removePdf.useCases.confidential.title'),
      description: t('removePdf.useCases.confidential.description')
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-green-500"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
      title: t('removePdf.useCases.reports.title'),
      description: t('removePdf.useCases.reports.description')
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-purple-500"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>,
      title: t('removePdf.useCases.presentations.title'),
      description: t('removePdf.useCases.presentations.description')
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-red-500"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>,
      title: t('removePdf.useCases.sharing.title'),
      description: t('removePdf.useCases.sharing.description')
    }
  ];

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center">{t('removePdf.useCases.title')}</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {useCases.map((useCase, index) => (
          <div key={index} className="flex gap-4">
            <div className="bg-muted rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0">
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

export function RemovePdfFaqSection() {
  const { t } = useLanguageStore();
  
  const faqItems = [
    {
      question: t('removePdf.faq.multiplePages.question'),
      answer: t('removePdf.faq.multiplePages.answer')
    },
    {
      question: t('removePdf.faq.pageLimit.question'),
      answer: t('removePdf.faq.pageLimit.answer')
    },
    {
      question: t('removePdf.faq.quality.question'),
      answer: t('removePdf.faq.quality.answer')
    },
    {
      question: t('removePdf.faq.encrypted.question'),
      answer: t('removePdf.faq.encrypted.answer')
    }
  ];

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center">{t('removePdf.faq.title')}</h2>
      <div className="space-y-4">
        {faqItems.map((item, index) => (
          <div key={index} className="border rounded-lg p-4">
            <h3 className="font-medium mb-2 flex items-center">
              <AlertCircleIcon className="h-4 w-4 mr-2 text-primary" />
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
      href: "/split-pdf",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
        <path d="M8 3H5a2 2 0 0 0-2 2v3"></path>
        <path d="M21 8V5a2 2 0 0 0-2-2h-3"></path>
        <path d="M3 16v3a2 2 0 0 0 2 2h3"></path>
        <path d="M16 21h3a2 2 0 0 0 2-2v-3"></path>
      </svg>,
      name: t('splitPdf.title'),
      bg: "bg-blue-100 dark:bg-blue-900/30"
    },
    {
      href: "/merge-pdf",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
        <path d="M8 3H5a2 2 0 0 0-2 2v3"></path>
        <path d="M21 8V5a2 2 0 0 0-2-2h-3"></path>
        <path d="M3 16v3a2 2 0 0 0 2 2h3"></path>
        <path d="M16 21h3a2 2 0 0 0 2-2v-3"></path>
      </svg>,
      name: t('mergePdf.title'),
      bg: "bg-green-100 dark:bg-green-900/30"
    },
    {
      href: "/rotate-pdf",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500">
        <path d="M21 2v6h-6"></path>
        <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
        <path d="M3 22v-6h6"></path>
        <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
      </svg>,
      name: t('rotatePdf.title'),
      bg: "bg-purple-100 dark:bg-purple-900/30"
    },
    {
      href: "/compress-pdf",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
        <path d="M22 12H2m20 0-4 4m4-4-4-4M2 20V4"></path>
      </svg>,
      name: t('compressPdf.title'),
      bg: "bg-orange-100 dark:bg-orange-900/30"
    }
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center">{t('removePdf.relatedTools')}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tools.map((tool) => (
          <LanguageLink 
            key={tool.href} 
            href={tool.href} 
            className="border rounded-lg p-4 text-center hover:border-primary transition-colors"
          >
            <div className="flex flex-col items-center">
              <div className={`p-2 rounded-full ${tool.bg} mb-2`}>
                {tool.icon}
              </div>
              <span className="text-sm font-medium">{tool.name}</span>
            </div>
          </LanguageLink>
        ))}
      </div>
      <div className="text-center mt-6">
        <LanguageLink href="/pdf-tools">
          <Button variant="outline">{t('popular.viewAll')}</Button>
        </LanguageLink>
      </div>
    </div>
  );
}