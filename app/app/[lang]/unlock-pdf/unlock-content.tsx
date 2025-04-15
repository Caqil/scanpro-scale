"use client";

import { useLanguageStore } from "@/src/store/store";
import { LanguageLink } from "@/components/language-link";
import { Button } from "@/components/ui/button";

// Original UnlockHeaderSection (unchanged)
export function UnlockHeaderSection() {
  const { t } = useLanguageStore();

  return (
    <div className="mx-auto flex flex-col items-center text-center mb-8">
      <div className="mb-4 p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
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
          className="text-blue-500"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      </div>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        {t('unlockPdf.title')} {/* "Unlock PDF Files Easily with Our PDF Unlocker" */}
      </h1>
      <p className="mt-4 text-xl text-muted-foreground max-w-[700px]">
        {t('unlockPdf.description')} {/* "Remove PDF passwords and unprotect PDF files quickly with our online PDF unlock tool. Unlock PDFs to create an unsecured PDF file on any operating system." */}
      </p>
    </div>
  );
}

// New BenefitsSection
export function BenefitsSection() {
  const { t } = useLanguageStore();

  const benefits = [
    {
      title: t('unlockPdf.benefits.list.0.title'), // "Fast PDF Unlocker"
      description: t('unlockPdf.benefits.list.0.description'), // "Use our unlock PDF tool to quickly remove the PDF password and create an unsecured PDF file, ready for downloading your file instantly."
    },
    {
      title: t('unlockPdf.benefits.list.1.title'), // "Easy Unlocking PDF Files"
      description: t('unlockPdf.benefits.list.1.description'), // "With a simple enter password box, unlock PDF files online by entering the permissions password or document open password—click save and you’re done."
    },
    {
      title: t('unlockPdf.benefits.list.2.title'), // "Unlock PDFs on Any Platform"
      description: t('unlockPdf.benefits.list.2.description'), // "Our online PDF unlocker works on any operating system, making unlocking PDF files seamless whether you use SmallPDF unlock or our unlock PDF tool."
    },
    {
      title: t('unlockPdf.benefits.list.3.title'), // "Secure PDF Document Unlock"
      description: t('unlockPdf.benefits.list.3.description'), // "Safely remove password from PDF files with our tool, ensuring your unlocked file stays private after unlocking PDF."
    },
  ];

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {t('unlockPdf.benefits.title')} {/* "Why Use Our Unlock PDF Tool for Unlocking PDF Files" */}
      </h2>
      <div className="grid md:grid-cols-2 gap-8">
        {benefits.map((benefit, index) => (
          <div key={index} className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-800/20 flex items-center justify-center mb-4">
              <span className="text-blue-500 font-bold">{index + 1}</span>
            </div>
            <h3 className="text-lg font-medium mb-2">{benefit.title}</h3>
            <p className="text-sm text-muted-foreground">{benefit.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// New UseCasesSection
export function UseCasesSection() {
  const { t } = useLanguageStore();

  const useCases = [
    {
      title: t('unlockPdf.useCases.list.0.title'), // "Unlock PDF File with Permissions Password"
      description: t('unlockPdf.useCases.list.0.description'), // "Use our PDF unlocker to remove the permissions password and unlock to PDF for full access when you know the password click."
    },
    {
      title: t('unlockPdf.useCases.list.1.title'), // "Online PDF for Business"
      description: t('unlockPdf.useCases.list.1.description'), // "Unlock PDF files online to remove PDF passwords from business documents, simplifying sharing and editing with a quick click save."
    },
    {
      title: t('unlockPdf.useCases.list.2.title'), // "Unlocking PDF Study Materials"
      description: t('unlockPdf.useCases.list.2.description'), // "Unprotect online PDF study resources with our unlock PDF tool to create an unsecured PDF file for seamless learning."
    },
    {
      title: t('unlockPdf.useCases.list.3.title'), // "Personal PDF Document Unlock"
      description: t('unlockPdf.useCases.list.3.description'), // "Learn how to unlock PDF file from your personal collection by downloading your file after using our SmallPDF unlock PDF alternative."
    },
  ];

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {t('unlockPdf.useCases.title')} {/* "How to Unlock PDF File: Top Use Cases" */}
      </h2>
      <div className="space-y-6">
        {useCases.map((useCase, index) => (
          <div key={index} className="border rounded-lg p-4 text-left">
            <h3 className="text-lg font-medium mb-2 flex items-center">
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
                className="mr-2 text-blue-500"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              {useCase.title}
            </h3>
            <p className="text-sm text-muted-foreground">{useCase.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Existing HowToUnlockSection (unchanged)
export function HowToUnlockSection() {
  const { t } = useLanguageStore();
  const steps = [
    {
      number: "1",
      title: t('unlockPdf.howTo.upload.title'),
      description: t('unlockPdf.howTo.upload.description'),
    },
    {
      number: "2",
      title: t('unlockPdf.howTo.enterPassword.title'),
      description: t('unlockPdf.howTo.enterPassword.description'),
    },
    {
      number: "3",
      title: t('unlockPdf.howTo.download.title'),
      description: t('unlockPdf.howTo.download.description'),
    },
  ];

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center">{t('unlockPdf.howTo.title')}</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((step) => (
          <div key={step.number} className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-4">
              <span className="font-bold">{step.number}</span>
            </div>
            <h3 className="text-lg font-medium mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Existing FAQSection (unchanged)
export function FAQSection() {
  const { t } = useLanguageStore();
  const faqs = [
    {
      question: t('unlockPdf.faq.passwordRequired.question'),
      answer: t('unlockPdf.faq.passwordRequired.answer'),
    },
    {
      question: t('unlockPdf.faq.security.question'),
      answer: t('unlockPdf.faq.security.answer'),
    },
    {
      question: t('unlockPdf.faq.restrictions.question'),
      answer: t('unlockPdf.faq.restrictions.answer'),
    },
    {
      question: t('unlockPdf.faq.quality.question'),
      answer: t('unlockPdf.faq.quality.answer'),
    },
    {
      question: t('unlockPdf.faq.compatibility.question'),
      answer: t('unlockPdf.faq.compatibility.answer'),
    },
  ];

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center">{t('contact.faq.title')}</h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border rounded-lg p-4">
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
              {faq.question}
            </h3>
            <p className="text-sm text-muted-foreground">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Existing RelatedToolsSection (unchanged)
export function RelatedToolsSection() {
  const { t } = useLanguageStore();
  const tools = [
    {
      href: "/protect-pdf",
      icon: (
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
          className="text-blue-500"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      ),
      name: t('protectPdf.title'),
    },
    {
      href: "/sign-pdf",
      icon: (
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
          className="text-blue-500"
        >
          <path d="M20 20h-8.5c-.83 0-1.5-.67-1.5-1.5v-8c0-.83.67-1.5 1.5-1.5h8.5"></path>
          <path d="M16 8V4c0-.5.5-1 1-1h4"></path>
          <path d="M18 15v-7h3"></path>
          <path d="M10 20H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4"></path>
        </svg>
      ),
      name: "Sign PDF",
    },
    {
      href: "/watermark-pdf",
      icon: (
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
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
        </svg>
      ),
      name: t('watermarkPdf.title'),
    },
    {
      href: "/compress-pdf",
      icon: (
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
          className="text-green-500"
        >
          <path d="M22 12H2m20 0-4 4m4-4-4-4M2 20V4"></path>
        </svg>
      ),
      name: t('compressPdf.title'),
    },
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
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-2">
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