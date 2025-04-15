"use client";

import { PenIcon, FileTextIcon, StampIcon, InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageLink } from "@/components/language-link";
import { useLanguageStore } from "@/src/store/store";

export function SignHeaderSection() {
  const { t } = useLanguageStore();
  
  return (
    <div className="mx-auto flex flex-col items-center text-center mb-8">
      <div className="mb-4 p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
        <PenIcon className="h-8 w-8 text-blue-500" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        {t('signPdf.title')}
      </h1>
      <p className="mt-4 text-xl text-muted-foreground max-w-[700px]">
        {t('signPdf.description')}
      </p>
    </div>
  );
}

export function HowToSignSection() {
  const { t } = useLanguageStore();
  
  const steps = [
    {
      title: t('signPdf.howTo.step1.title'),
      description: t('signPdf.howTo.step1.description')
    },
    {
      title: t('signPdf.howTo.step2.title'),
      description: t('signPdf.howTo.step2.description')
    },
    {
      title: t('signPdf.howTo.step3.title'),
      description: t('signPdf.howTo.step3.description')
    }
  ];

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center">{t('signPdf.howTo.title')}</h2>
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
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path><line x1="16" y1="8" x2="2" y2="22"></line><line x1="17.5" y1="15" x2="9" y2="15"></line></svg>,
      title: t('signPdf.benefits.paperless.title'),
      description: t('signPdf.benefits.paperless.description')
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
      title: t('signPdf.benefits.time.title'),
      description: t('signPdf.benefits.time.description')
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>,
      title: t('signPdf.benefits.professional.title'),
      description: t('signPdf.benefits.professional.description')
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500"><path d="M5 22h14"></path><path d="M5 2h14"></path><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"></path><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"></path></svg>,
      title: t('signPdf.benefits.workflow.title'),
      description: t('signPdf.benefits.workflow.description')
    }
  ];

  return (
    <div className="mb-12 p-6 bg-muted/30 rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">{t('signPdf.benefits.title')}</h2>
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
      title: t('signPdf.useCases.contracts.title'),
      description: t('signPdf.useCases.contracts.description')
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-green-500"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
      title: t('signPdf.useCases.forms.title'),
      description: t('signPdf.useCases.forms.description')
    },
    {
      icon: <StampIcon className="h-6 w-6 text-red-500" />,
      title: t('signPdf.useCases.approvals.title'),
      description: t('signPdf.useCases.approvals.description')
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-purple-500"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>,
      title: t('signPdf.useCases.feedback.title'),
      description: t('signPdf.useCases.feedback.description')
    }
  ];

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center">{t('signPdf.useCases.title')}</h2>
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

export function SignPdfFaqSection() {
  const { t } = useLanguageStore();
  
  const faqItems = [
    {
      question: t('signPdf.faq.legality.question'),
      answer: t('signPdf.faq.legality.answer')
    },
    {
      question: t('signPdf.faq.security.question'),
      answer: t('signPdf.faq.security.answer')
    },
    {
      question: t('signPdf.faq.formats.question'),
      answer: t('signPdf.faq.formats.answer')
    },
    {
      question: t('signPdf.faq.multipleSignatures.question'),
      answer: t('signPdf.faq.multipleSignatures.answer')
    }
  ];

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center">{t('signPdf.faq.title')}</h2>
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
      href: "/protect-pdf",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>,
      name: t('protectPdf.title'),
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
      name: "Merge PDF",
      bg: "bg-green-100 dark:bg-green-900/30"
    },
    {
      href: "/watermark-pdf",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
      </svg>,
      name: t('watermarkPdf.title'),
      bg: "bg-purple-100 dark:bg-purple-900/30"
    },
    {
      href: "/compress-pdf",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
        <path d="M22 12H2m20 0-4 4m4-4-4-4M2 20V4"></path>
      </svg>,
      name: t('compressPdf.title'),
      bg: "bg-red-100 dark:bg-red-900/30"
    }
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center">{t('mergePdf.relatedTools')}</h2>
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