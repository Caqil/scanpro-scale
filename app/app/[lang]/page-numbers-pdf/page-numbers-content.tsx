"use client";

import { 
  EyeIcon, 
  FileText, 
  BookIcon, 
  FileIcon, 
  InfoIcon, 
  CheckIcon,
  Book, 
  FileCheck2, 
  FileCog, 
  FileSpreadsheet,
  BookOpen,
  Briefcase,
  GraduationCap,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageLink } from "@/components/language-link";
import { useLanguageStore } from "@/src/store/store";

export function PageNumbersHeaderSection() {
  const { t } = useLanguageStore();
  
  return (
    <div className="mx-auto flex flex-col items-center text-center mb-8">
      <div className="mb-4 p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
        <EyeIcon className="h-8 w-8 text-indigo-500" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        {t('pageNumber.title') || "Add Page Numbers to PDF"}
      </h1>
      <p className="mt-4 text-xl text-muted-foreground max-w-[700px]">
        {t('pageNumber.description') || "Add custom page numbers to your PDF documents with various formats, positions, and styles"}
      </p>
    </div>
  );
}

export function HowToAddPageNumbersSection() {
  const { t } = useLanguageStore();
  
  const steps = [
    {
      title: t('pageNumber.howTo.step1.title') || "Upload Your PDF",
      description: t('pageNumber.howTo.step1.description') || "Select the PDF file you want to add page numbers to"
    },
    {
      title: t('pageNumber.howTo.step2.title') || "Customize Page Numbers",
      description: t('pageNumber.howTo.step2.description') || "Choose format, position, font, and other page number settings"
    },
    {
      title: t('pageNumber.howTo.step3.title') || "Download Your PDF",
      description: t('pageNumber.howTo.step3.description') || "Process and download your PDF with page numbers added"
    }
  ];

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center">{t('pageNumber.howTo.title') || "How to Add Page Numbers"}</h2>
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
      icon: <BookOpen className="h-5 w-5 text-indigo-500" />,
      title: t('pageNumber.benefits.navigation.title') || "Improved Navigation",
      description: t('pageNumber.benefits.navigation.description') || "Make it easier to navigate through your documents with clearly visible page numbers"
    },
    {
      icon: <Briefcase className="h-5 w-5 text-indigo-500" />,
      title: t('pageNumber.benefits.professional.title') || "Professional Documents",
      description: t('pageNumber.benefits.professional.description') || "Give your documents a professional look with properly formatted page numbers"
    },
    {
      icon: <FileSpreadsheet className="h-5 w-5 text-indigo-500" />,
      title: t('pageNumber.benefits.organization.title') || "Better Organization",
      description: t('pageNumber.benefits.organization.description') || "Keep track of pages in large documents and reference specific pages easily"
    },
    {
      icon: <FileCog className="h-5 w-5 text-indigo-500" />,
      title: t('pageNumber.benefits.customization.title') || "Full Customization",
      description: t('pageNumber.benefits.customization.description') || "Customize the appearance and position of page numbers to match your document's style"
    }
  ];

  return (
    <div className="mb-12 p-6 bg-muted/30 rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">{t('pageNumber.benefits.title') || "Benefits of Adding Page Numbers"}</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {benefits.map((benefit, index) => (
          <div key={index} className="flex gap-4">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0">
              {benefit.icon}
            </div>
            <div>
              <h3 className="font-medium text-lg mb-1">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground">
                {benefit.description}
              </p>
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
      icon: <Book className="h-6 w-6 text-indigo-500" />,
      title: t('pageNumber.useCases.books.title') || "Books and E-books",
      description: t('pageNumber.useCases.books.description') || "Add proper page numbering to your books, e-books, or reports for better readability and referencing"
    },
    {
      icon: <GraduationCap className="h-6 w-6 text-indigo-500" />,
      title: t('pageNumber.useCases.academic.title') || "Academic Papers",
      description: t('pageNumber.useCases.academic.description') || "Number pages in theses, dissertations, and research papers according to academic standards"
    },
    {
      icon: <Briefcase className="h-6 w-6 text-indigo-500" />,
      title: t('pageNumber.useCases.business.title') || "Business Documents",
      description: t('pageNumber.useCases.business.description') || "Add professional page numbering to proposals, reports, and business plans"
    },
    {
      icon: <Users className="h-6 w-6 text-indigo-500" />,
      title: t('pageNumber.useCases.legal.title') || "Legal Documents",
      description: t('pageNumber.useCases.legal.description') || "Apply consistent page numbering to contracts, agreements, and legal briefs for proper referencing"
    }
  ];

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center">{t('pageNumber.useCases.title') || "Common Use Cases"}</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {useCases.map((useCase, index) => (
          <div key={index} className="flex gap-4 border rounded-lg p-4">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0">
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

export function PageNumbersFaqSection() {
  const { t } = useLanguageStore();
  
  const faqs = [
    {
      question: t('pageNumber.faq.formats.question') || "What page number formats are available?",
      answer: t('pageNumber.faq.formats.answer') || "Our tool supports three page number formats: numeric (1, 2, 3), Roman numerals (I, II, III), and alphabetic (A, B, C). You can select the format that best fits your document needs."
    },
    {
      question: t('pageNumber.faq.customize.question') || "Can I customize how page numbers appear?",
      answer: t('pageNumber.faq.customize.answer') || "Yes, you can fully customize your page numbers by adding prefixes (like 'Page '), suffixes (like ' of 10'), choosing different fonts, sizes, colors, and positioning them anywhere on the page."
    },
    {
      question: t('pageNumber.faq.skipPages.question') || "Can I skip certain pages when adding page numbers?",
      answer: t('pageNumber.faq.skipPages.answer') || "Absolutely! You can specify exactly which pages should receive numbers using our page selection feature. You can also choose to skip the first page (often a cover page) with a single click."
    },
    {
      question: t('pageNumber.faq.startNumber.question') || "Can I start page numbering from a specific number?",
      answer: t('pageNumber.faq.startNumber.answer') || "Yes, you can set the starting number for your page sequence. This is useful for documents that continue from other documents or have preliminary pages with different numbering."
    },
    {
      question: t('pageNumber.faq.security.question') || "Is my PDF secure when I upload it?",
      answer: t('pageNumber.faq.security.answer') || "Yes, all file processing happens securely on our servers. Your files are encrypted during transfer, processed, and then automatically deleted. We never store your files permanently or access their content for any purpose other than adding the page numbers."
    }
  ];

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center">{t('pageNumber.faq.title') || "Frequently Asked Questions"}</h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border rounded-lg p-4">
            <h3 className="font-medium mb-2 flex items-center">
              <InfoIcon className="h-4 w-4 mr-2 text-primary" />
              {faq.question}
            </h3>
            <p className="text-sm text-muted-foreground">{faq.answer}</p>
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
      href: "/watermark-pdf", 
      icon: <FileCheck2 className="h-5 w-5 text-blue-500" />,
      name: t('popular.watermark') || "Add Watermark",
      bg: "bg-blue-100 dark:bg-blue-900/30"
    },
    { 
      href: "/sign-pdf", 
      icon: <FileText className="h-5 w-5 text-green-500" />,
      name: t('popular.signPdf') || "Edit PDF",
      bg: "bg-green-100 dark:bg-green-900/30"
    },
    { 
      href: "/merge-pdf", 
      icon: <FileIcon className="h-5 w-5 text-orange-500" />,
      name: t('popular.mergePdf') || "Merge PDF",
      bg: "bg-orange-100 dark:bg-orange-900/30"
    },
    { 
      href: "/ocr-pdf", 
      icon: <FileText className="h-5 w-5 text-purple-500" />,
      name: t('popular.ocrPdf') || "OCR PDF",
      bg: "bg-purple-100 dark:bg-purple-900/30"
    }
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center">{t('pageNumber.relatedTools.title') || "Related Tools"}</h2>
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
          <Button variant="outline">{t('popular.viewAll') || "View All Tools"}</Button>
        </LanguageLink>
      </div>
    </div>
  );
}