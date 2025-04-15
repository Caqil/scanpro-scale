"use client"
import { LockIcon, FileIcon, InfoIcon, FileText, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageLink } from "@/components/language-link";
import { useLanguageStore } from "@/src/store/store";

export function ProtectHeaderSection() {
  const { t } = useLanguageStore();
  
  return (
    <div className="mx-auto flex flex-col items-center text-center mb-8">
      <div className="mb-4 p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
        <LockIcon className="h-8 w-8 text-blue-500" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        {t('protectPdf.title')}
      </h1>
      <p className="mt-4 text-xl text-muted-foreground max-w-[700px]">
        {t('protectPdf.description')}
      </p>
    </div>
  );
}

export function HowToProtectSection() {
  const { t } = useLanguageStore();
  
  const steps = [
    {
      title: t('protectPdf.howTo.step1.title'),
      description: t('protectPdf.howTo.step1.description')
    },
    {
      title: t('protectPdf.howTo.step2.title'),
      description: t('protectPdf.howTo.step2.description')
    },
    {
      title: t('protectPdf.howTo.step3.title'),
      description: t('protectPdf.howTo.step3.description')
    }
  ];

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center">{t('protectPdf.howTo.title')}</h2>
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

export function WhyProtectSection() {
  const { t } = useLanguageStore();
  
  const reasons = [
    {
      icon: <LockIcon className="h-5 w-5 text-blue-500" />,
      title: t('protectPdf.why.confidentiality.title'),
      description: t('protectPdf.why.confidentiality.description')
    },
    {
      icon: <Shield className="h-5 w-5 text-blue-500" />,
      title: t('protectPdf.why.controlledAccess.title'),
      description: t('protectPdf.why.controlledAccess.description')
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>,
      title: t('protectPdf.why.authorizedDistribution.title'),
      description: t('protectPdf.why.authorizedDistribution.description')
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>,
      title: t('protectPdf.why.documentExpiration.title'),
      description: t('protectPdf.why.documentExpiration.description')
    }
  ];

  return (
    <div className="mb-12 p-6 bg-muted/30 rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">{t('protectPdf.why.title')}</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {reasons.map((reason, index) => (
          <div key={index} className="flex gap-4">
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0">
              {reason.icon}
            </div>
            <div>
              <h3 className="font-medium text-lg mb-1">{reason.title}</h3>
              <p className="text-sm text-muted-foreground">
                {reason.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SecurityExplainedSection() {
  const { t } = useLanguageStore();
  
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center">{t('protectPdf.security.title')}</h2>
      <div className="border rounded-lg p-6 bg-card">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-blue-500">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              {t('protectPdf.security.passwords.title')}
            </h3>
            <p className="text-sm text-muted-foreground">
              <strong>{t('protectPdf.form.password')}:</strong> {t('protectPdf.security.passwords.user')}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              <strong>Owner Password:</strong> {t('protectPdf.security.passwords.owner')}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-blue-500">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
              </svg>
              {t('protectPdf.security.encryption.title')}
            </h3>
            <p className="text-sm text-muted-foreground">
              <strong>128-bit AES:</strong> {t('protectPdf.security.encryption.aes128')}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              <strong>256-bit AES:</strong> {t('protectPdf.security.encryption.aes256')}
            </p>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-blue-500">
              <path d="M2 12a5 5 0 0 0 5 5 8 8 0 0 1 5 2 8 8 0 0 1 5-2 5 5 0 0 0 5-5V7H2Z"></path>
              <path d="M6 8v6"></path>
              <path d="M18 8v6"></path>
              <path d="M12 8v8"></path>
            </svg>
            {t('protectPdf.security.permissions.title')}
          </h3>
          <div className="grid md:grid-cols-3 gap-4 mt-3">
            <div className="border rounded-md p-3">
              <div className="font-medium mb-1">{t('protectPdf.security.permissions.printing.title')}</div>
              <p className="text-xs text-muted-foreground">{t('protectPdf.security.permissions.printing.description')}</p>
            </div>
            <div className="border rounded-md p-3">
              <div className="font-medium mb-1">{t('protectPdf.security.permissions.copying.title')}</div>
              <p className="text-xs text-muted-foreground">{t('protectPdf.security.permissions.copying.description')}</p>
            </div>
            <div className="border rounded-md p-3">
              <div className="font-medium mb-1">{t('protectPdf.security.permissions.editing.title')}</div>
              <p className="text-xs text-muted-foreground">{t('protectPdf.security.permissions.editing.description')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProtectFaqSection() {
  const { t } = useLanguageStore();
  
  const faqs = [
    {
      question: t('protectPdf.faq.encryptionDifference.question'),
      answer: t('protectPdf.faq.encryptionDifference.answer')
    },
    {
      question: t('protectPdf.faq.removeProtection.question'),
      answer: t('protectPdf.faq.removeProtection.answer')
    },
    {
      question: t('protectPdf.faq.securityStrength.question'),
      answer: t('protectPdf.faq.securityStrength.answer')
    },
    {
      question: t('protectPdf.faq.contentQuality.question'),
      answer: t('protectPdf.faq.contentQuality.answer')
    },
    {
      question: t('protectPdf.faq.batchProcessing.question'),
      answer: t('protectPdf.faq.batchProcessing.answer')
    }
  ];

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center">{t('ocr.faq.title')}</h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border rounded-lg p-4">
            <h3 className="font-medium mb-2 flex items-center">
              <InfoIcon className="h-4 w-4 mr-2 text-primary" />
              {faq.question}
            </h3>
            <p className="text-sm text-muted-foreground">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BestPracticesSection() {
  const { t } = useLanguageStore();
  
  const dosList = t('protectPdf.bestPractices.dosList');
  const dontsList = t('protectPdf.bestPractices.dontsList');

  return (
    <div className="mb-12 bg-muted/30 p-6 rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">{t('protectPdf.bestPractices.title')}</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="text-lg font-medium mb-3 text-primary">{t('protectPdf.bestPractices.dos')}</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {Array.isArray(dosList) && dosList.map((item, index) => (
              <li key={index} className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2 mt-0.5">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="text-lg font-medium mb-3 text-destructive">{t('protectPdf.bestPractices.donts')}</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {Array.isArray(dontsList) && dontsList.map((item, index) => (
              <li key={index} className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 mr-2 mt-0.5">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
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
      href: "/unlock-pdf", 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>,
      name: "Unlock PDF",
      bg: "bg-blue-100 dark:bg-blue-900/30"
    },
    { 
      href: "/sign-pdf", 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
        <path d="M20 20h-8.5c-.83 0-1.5-.67-1.5-1.5v-8c0-.83.67-1.5 1.5-1.5h8.5"></path>
        <path d="M16 8V4c0-.5.5-1 1-1h4"></path>
        <path d="M18 15v-7h3"></path>
        <path d="M10 20H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4"></path>
      </svg>,
      name: "Sign PDF",
      bg: "bg-blue-100 dark:bg-blue-900/30"
    },
    { 
      href: "/watermark-pdf", 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
      </svg>,
      name: "Watermark PDF",
      bg: "bg-purple-100 dark:bg-purple-900/30"
    },
    { 
      href: "/redact", 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
        <line x1="9" x2="15" y1="15" y2="9"></line>
      </svg>,
      name: "Redact PDF",
      bg: "bg-red-100 dark:bg-red-900/30"
    }
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center">{t('ocr.relatedTools')}</h2>
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