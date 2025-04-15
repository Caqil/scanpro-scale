"use client"
import { ArrowDown, FileIcon, FileImage, FileText, FolderDown, Info, Table } from "lucide-react";
import { useLanguageStore } from "@/src/store/store";
import { LanguageLink } from "@/components/language-link";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";

export function CompressionHeaderSection() {
  const { t } = useLanguageStore();
  return (
    <div className="mx-auto flex flex-col items-center text-center mb-8">
      <div className="mb-4 p-3 rounded-full bg-green-100 dark:bg-green-900/30">
        <ArrowDown className="h-8 w-8 text-green-500" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        {t('universalCompressor.title')}
      </h1>
      <p className="mt-4 text-xl text-muted-foreground max-w-[700px]">
        {t('universalCompressor.description')}
      </p>
      <div className="mt-6 flex flex-wrap gap-2 justify-center">
        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-sm text-red-600 dark:text-red-400">
          <FileText size={16} />
          <span>PDF</span>
        </div>
        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-sm text-blue-600 dark:text-blue-400">
          <FileImage size={16} />
          <span>JPG, PNG</span>
        </div>
        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-sm text-green-600 dark:text-green-400">
          <Table size={16} />
          <span>DOCX, PPTX, XLSX</span>
        </div>
      </div>
    </div>
  );
}

export function HowToCompressSection() {
  const { t } = useLanguageStore();
  const steps = [
    {
      title: t('universalCompressor.howTo.step1.title'),
      description: t('universalCompressor.howTo.step1.description')
    },
    {
      title: t('universalCompressor.howTo.step2.title'),
      description: t('universalCompressor.howTo.step2.description')
    },
    {
      title: t('universalCompressor.howTo.step3.title'),
      description: t('universalCompressor.howTo.step3.description')
    }
  ];

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center">{t('universalCompressor.howTo.title')}</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-4">
              <span className="font-bold">{index + 1}</span>
            </div>
            <h3 className="text-lg font-medium mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CompressionFaqSection() {
  const { t } = useLanguageStore();
  const faqItems = [
    {
      question: t('universalCompressor.faq.compressionRate.question'),
      answer: t('universalCompressor.faq.compressionRate.answer')
    },
    {
      question: t('universalCompressor.faq.quality.question'),
      answer: t('universalCompressor.faq.quality.answer')
    },
    {
      question: t('universalCompressor.faq.sizeLimit.question'),
      answer: t('universalCompressor.faq.sizeLimit.answer')
    }
  ];

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center">{t('ocr.faq.title')}</h2>
      <div className="space-y-4">
        {faqItems.map((item, index) => (
          <div key={index} className="border rounded-lg p-4">
            <h3 className="font-medium mb-2 flex items-center">
              <Info className="h-4 w-4 mr-2 text-primary" />
              {item.question}
            </h3>
            <p className="text-sm text-muted-foreground">
              {item.answer}
            </p>
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
      href: "/compress-pdf", 
      icon: <ArrowDown className="h-5 w-5 text-green-500" />,
      name: "PDF Compressor",
      bg: "bg-green-100 dark:bg-green-900/30"
    },
    { 
      href: "/ocr", 
      icon: <FileText className="h-5 w-5 text-blue-500" />,
      name: t('popular.ocr'),
      bg: "bg-blue-100 dark:bg-blue-900/30"
    },
    { 
      href: "/convert/pdf-to-docx", 
      icon: <FileText className="h-5 w-5 text-purple-500" />,
      name: t('popular.pdfToWord'),
      bg: "bg-purple-100 dark:bg-purple-900/30"
    },
    { 
      href: "/merge-pdf", 
      icon: <FolderDown className="h-5 w-5 text-red-500" />,
      name: t('popular.mergePdf'),
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

export function CompressionBenefitsSection() {
  const { t } = useLanguageStore();
  const benefits = [
    {
      title: t('compressPdf.benefits.faster.title') || "Faster File Sharing",
      description: t('compressPdf.benefits.faster.description') || "Smaller files mean faster uploads and downloads, especially on slower internet connections.",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
    },
    {
      title: t('compressPdf.benefits.storage.title') || "Save Storage Space",
      description: t('compressPdf.benefits.storage.description') || "Reduce file sizes by up to 80%, freeing up valuable storage space on your devices and cloud accounts.",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
    },
    {
      title: t('compressPdf.benefits.email.title') || "Email Friendly",
      description: t('compressPdf.benefits.email.description') || "Most email services have attachment size limits. Compression helps you stay under these limits while sending important files.",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
    },
    {
      title: t('compressPdf.benefits.quality.title') || "Preserve Quality",
      description: t('compressPdf.benefits.quality.description') || "Our smart compression algorithms reduce file size while maintaining visual quality for documents, images, and presentations.",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500"><path d="M5 3v4M3 5h4M6 17v4M4 19h4M13 3l4 4M17 5l2 2M15 19l-2 2M19 15l2 2M19 5l-4 4M15 3l-2 2M5 19l4-4M3 15l2-2"></path></svg>
    }
  ];
  
  return (
    <div className="mb-12 bg-muted/30 p-6 rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">{t('compressPdf.benefits.title') || "Benefits of Compression"}</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {benefits.map((benefit, index) => (
          <div key={index} className="flex gap-4">
            <div className="bg-background rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0">
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

export function FileTypeInfoSection() {
  const { t } = useLanguageStore();
  const fileTypes = [
    {
      type: t('universalCompressor.fileTypes.pdf') || "PDF Documents",
      description: t('universalCompressor.fileTypes.pdfDesc') || "Reduce PDF file sizes while preserving text quality, graphics, and formatting. Ideal for reports, eBooks, and presentations.",
      icon: <FileText className="h-10 w-10 text-red-500" />,
      compressionRates: t('universalCompressor.fileTypes.pdfRate') || "20-70% reduction"
    },
    {
      type: t('universalCompressor.fileTypes.images') || "Images (JPG, PNG)",
      description: t('universalCompressor.fileTypes.imagesDesc') || "Compress images for web, email, or storage. Our intelligent algorithms adjust compression based on image content.",
      icon: <FileImage className="h-10 w-10 text-blue-500" />,
      compressionRates: t('universalCompressor.fileTypes.imagesRate') || "30-80% reduction"
    },
    {
      type: t('universalCompressor.fileTypes.office') || "Office Documents",
      description: t('universalCompressor.fileTypes.officeDesc') || "Compress Word documents, PowerPoint presentations, and Excel spreadsheets without losing formatting or functionality.",
      icon: <Table className="h-10 w-10 text-green-500" />,
      compressionRates: t('universalCompressor.fileTypes.officeRate') || "10-50% reduction"
    }
  ];
  
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center">{t('universalCompressor.fileTypes.title') || "Supported File Types"}</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {fileTypes.map((fileType, index) => (
          <div key={index} className="border rounded-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              {fileType.icon}
            </div>
            <h3 className="text-lg font-medium mb-2">{fileType.type}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {fileType.description}
            </p>
            <div className="inline-block px-3 py-1 rounded-full bg-muted text-sm font-medium">
              {fileType.compressionRates}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}