"use client";

import { 
  ArrowDownIcon, 
  FileIcon, 
  MailIcon, 
  HardDriveIcon, 
  FileX2Icon, 
  Check, 
  AlertTriangle,
  AlignLeft,
  Image,
  Table
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageLink } from "@/components/language-link";
import { useLanguageStore } from "@/src/store/store";
import { cn } from "@/lib/utils";

export function CompressHeaderSection() {
  const { t } = useLanguageStore();
  
  return (
    <div className="mx-auto flex flex-col items-center text-center mb-8">
      <div className="mb-4 p-3 rounded-full bg-green-100 dark:bg-green-900/30">
        <ArrowDownIcon className="h-8 w-8 text-green-500" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        {t('compressPdf.title') || "Compress PDF Files"}
      </h1>
      <p className="mt-4 text-xl text-muted-foreground max-w-[700px]">
        {t('compressPdf.description') || "Reduce PDF file sizes effortlessly while preserving document quality"}
      </p>
    </div>
  );
}

export function HowToCompressSection() {
  const { t } = useLanguageStore();
  
  const steps = [
    {
      title: t('compressPdf.howTo.step1.title') || "Upload PDF",
      description: t('compressPdf.howTo.step1.description') || "Upload the PDF file you want to compress. Files up to 100MB are supported."
    },
    {
      title: t('compressPdf.howTo.step2.title') || "Choose Quality",
      description: t('compressPdf.howTo.step2.description') || "Select your preferred compression level based on your needs."
    },
    {
      title: t('compressPdf.howTo.step3.title') || "Download",
      description: t('compressPdf.howTo.step3.description') || "Download your compressed PDF file, ready to share or store."
    }
  ];

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center">{t('compressPdf.howTo.title') || "How to Compress PDF Files"}</h2>
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

export function WhyCompressSection() {
  const { t } = useLanguageStore();
  
  const reasons = [
    {
      icon: <FileX2Icon className="h-5 w-5 text-green-500" />,
      title: t('compressPdf.why.uploadSpeed.title') || "Lightning-Fast Uploads",
      description: t('compressPdf.why.uploadSpeed.description') || "Share compressed PDFs quickly with faster upload speeds"
    },
    {
      icon: <MailIcon className="h-5 w-5 text-green-500" />,
      title: t('compressPdf.why.emailFriendly.title') || "Email Friendly",
      description: t('compressPdf.why.emailFriendly.description') || "Fit within email size limits without compromising quality"
    },
    {
      icon: <HardDriveIcon className="h-5 w-5 text-green-500" />,
      title: t('compressPdf.why.storage.title') || "Storage Efficient",
      description: t('compressPdf.why.storage.description') || "Maximize space on your devices and cloud storage"
    },
    {
      icon: <FileIcon className="h-5 w-5 text-green-500" />,
      title: t('compressPdf.why.quality.title') || "Maintained Quality",
      description: t('compressPdf.why.quality.description') || "Choose compression levels that preserve the quality you need"
    }
  ];

  return (
    <div className="mb-12 p-6 bg-muted/30 rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">{t('compressPdf.why.title') || "Why Compress PDFs?"}</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {reasons.map((reason, index) => (
          <div key={index} className="flex gap-4">
            <div className="bg-green-100 dark:bg-green-900/30 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0">
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

export function CompressFaqSection() {
  const { t } = useLanguageStore();
  
  const faqs = [
    {
      question: t('compressPdf.faq.howMuch.question') || "How much can PDF files be compressed?",
      answer: t('compressPdf.faq.howMuch.answer') || "Most PDF files can be compressed by 20-80%, depending on the content. Documents with many images typically achieve higher compression rates than text-heavy documents. Our compression tool offers different quality levels to balance file size and visual quality based on your needs."
    },
    {
      question: t('compressPdf.faq.quality.question') || "Will compression affect the quality of my PDF?",
      answer: t('compressPdf.faq.quality.answer') || "Our compression tool offers different quality settings. High quality compression maintains visual fidelity while still reducing file size. Medium and low quality settings apply more aggressive compression, which may affect image quality but results in smaller files. Text content remains sharp and readable at all compression levels."
    },
    {
      question: t('compressPdf.faq.secure.question') || "Is my PDF data secure when compressing?",
      answer: t('compressPdf.faq.secure.answer') || "Yes, we take data security seriously. All file processing happens on our secure servers, and your files are automatically deleted after processing (typically within 24 hours). We don't share your files with third parties, and all data transfers are encrypted using HTTPS."
    },
    {
      question: t('compressPdf.faq.fileLimits.question') || "What are the file size limits?",
      answer: t('compressPdf.faq.fileLimits.answer') || "Free users can compress PDF files up to 10MB. Premium subscribers can compress larger files: Basic plan allows up to 50MB, Pro plan up to 100MB, and Enterprise plan up to 500MB per file. If you need to process larger files, please contact us for custom solutions."
    },
    {
      question: t('compressPdf.faq.batch.question') || "Can I compress multiple PDFs at once?",
      answer: t('compressPdf.faq.batch.answer') || "Yes, our tool supports batch compression. You can upload and compress multiple PDF files simultaneously, saving you time when processing multiple documents. Premium users get higher limits on batch processing."
    }
  ];

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center">{t('compressPdf.faq.title') || "Frequently Asked Questions"}</h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border rounded-lg p-4">
            <h3 className="font-medium mb-2 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-primary" />
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

export function CompressModeSection() {
  const { t } = useLanguageStore();
  
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center">{t('compressPdf.modes.title') || "Compression Modes"}</h2>
      <div className="border rounded-lg p-6 bg-card">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Check className="mr-2 text-green-500" />
              {t('compressPdf.modes.moderate.title') || "Moderate Compression"}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              {t('compressPdf.modes.moderate.description') || "Balanced approach that reduces file size while maintaining good visual quality. Perfect for most documents where quality is important but some size reduction is needed."}
            </p>
            <div className="text-xs text-muted-foreground">
              <p><strong>Best for:</strong> General documents, reports, and presentations</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Check className="mr-2 text-amber-500" />
              {t('compressPdf.modes.high.title') || "High Compression"}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              {t('compressPdf.modes.high.description') || "More aggressive compression that significantly reduces file size. Some image quality loss may be noticeable, but text remains clear and legible."}
            </p>
            <div className="text-xs text-muted-foreground">
              <p><strong>Best for:</strong> Email attachments and web sharing</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Check className="mr-2 text-blue-500" />
              {t('compressPdf.modes.lossless.title') || "Lossless Compression"}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              {t('compressPdf.modes.lossless.description') || "Reduces file size without affecting quality by removing redundant data, optimizing structure, and cleaning metadata. No visual differences from the original."}
            </p>
            <div className="text-xs text-muted-foreground">
              <p><strong>Best for:</strong> Important documents where quality is critical</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BestPracticesSection() {
  const { t } = useLanguageStore();
  
  const dosList = t('compressPdf.bestPractices.dosList') || [
    "Compress images before creating PDFs for best results",
    "Choose the appropriate compression level for your needs",
    "Keep original files as backups before compression",
    "Use lossless compression for important documents",
    "Remove unnecessary pages to further reduce file size"
  ];
  
  const dontsList = t('compressPdf.bestPractices.dontsList') || [
    "Don't overcompress documents needed for printing",
    "Don't compress legal or archival documents if every detail matters",
    "Don't compress already heavily compressed PDFs repeatedly",
    "Don't expect huge reductions for PDFs with mostly text",
    "Don't compress if file size isn't an issue"
  ];

  return (
    <div className="mb-12 bg-muted/30 p-6 rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">{t('compressPdf.bestPractices.title') || "Best Practices for PDF Compression"}</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="text-lg font-medium mb-3 text-primary">{t('compressPdf.bestPractices.dos') || "Do's"}</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {Array.isArray(dosList) && dosList.map((item, index) => (
              <li key={index} className="flex items-start">
                <Check className="text-green-500 mr-2 mt-0.5 h-4 w-4" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="text-lg font-medium mb-3 text-destructive">{t('compressPdf.bestPractices.donts') || "Don'ts"}</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {Array.isArray(dontsList) && dontsList.map((item, index) => (
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
      href: "/merge", 
      icon: <FileIcon className="h-5 w-5 text-blue-500" />,
      name: t('compressPdf.relatedTools.merge') || "Merge PDF",
      bg: "bg-blue-100 dark:bg-blue-900/30"
    },
    { 
      href: "/split", 
      icon: <AlignLeft className="h-5 w-5 text-orange-500" />,
      name: t('compressPdf.relatedTools.split') || "Split PDF",
      bg: "bg-orange-100 dark:bg-orange-900/30"
    },
    { 
      href: "/convert/pdf-to-docx", 
      icon: <FileIcon className="h-5 w-5 text-green-500" />,
      name: t('compressPdf.relatedTools.pdfToWord') || "PDF to Word",
      bg: "bg-green-100 dark:bg-green-900/30"
    },
    { 
      href: "/convert/pdf-to-jpg", 
      icon: <Image className="h-5 w-5 text-purple-500" />,
      name: t('compressPdf.relatedTools.pdfToJpg') || "PDF to JPG",
      bg: "bg-purple-100 dark:bg-purple-900/30"
    }
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center">{t('compressPdf.relatedTools.title') || "Related Tools"}</h2>
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
          <Button variant="outline">{t('compressPdf.relatedTools.viewAll') || "View All Tools"}</Button>
        </LanguageLink>
      </div>
    </div>
  );
}

// Feature Card component for the Why Compress section
export function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div
      className={cn(
        "group relative p-6 bg-card rounded-lg shadow-sm border border-border/20",
        "hover:shadow-md transition-all duration-300"
      )}
    >
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
      <div className="relative flex flex-col items-center text-center">
        <div
          className={cn(
            "h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4",
            "transform group-hover:scale-110 transition-transform duration-200"
          )}
        >
          {icon}
        </div>
        <h3
          className={cn(
            "text-xl font-semibold mb-2 text-foreground",
            "group-hover:text-primary transition-colors duration-200"
          )}
        >
          {title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}