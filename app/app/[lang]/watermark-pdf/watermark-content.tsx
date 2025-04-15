"use client";

import { 
  Stamp, 
  FileText, 
  Image, 
  RefreshCcw, 
  Eye, 
  Shield, 
  AlertTriangle,
  Check,
  FileCheck2,
  PenTool,
  Key,
  Fingerprint
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageLink } from "@/components/language-link";
import { useLanguageStore } from "@/src/store/store";
import { useSearchParams } from "next/navigation";

export function WatermarkHeaderSection() {
  const { t } = useLanguageStore();
  return (
    <div className="mx-auto flex flex-col items-center text-center mb-8">
      <div className="mb-4 p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
        <Stamp className="h-8 w-8 text-blue-500" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        {t('watermarkPdf.headerTitle') || "Add Watermark to PDF"}
      </h1>
      <p className="mt-4 text-xl text-muted-foreground max-w-[700px]">
        {t('watermarkPdf.headerDescription') || "Add custom text or image watermarks to your PDF documents for branding, copyright protection, and document classification"}
      </p>
    </div>
  );
}

export function HowToWatermarkSection() {
  const { t } = useLanguageStore();
  const steps = [
    {
      title: t('watermarkPdf.howTo.step1.title') || "Upload Your PDF",
      description: t('watermarkPdf.howTo.step1.description') || "Select and upload the PDF file you want to add a watermark to"
    },
    {
      title: t('watermarkPdf.howTo.step2.title') || "Customize Watermark",
      description: t('watermarkPdf.howTo.step2.description') || "Choose between text or image watermark and customize its appearance"
    },
    {
      title: t('watermarkPdf.howTo.step3.title') || "Download Watermarked PDF",
      description: t('watermarkPdf.howTo.step3.description') || "Process your file and download the watermarked PDF document"
    }
  ];

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center">{t('watermarkPdf.howTo.title') || "How to Add a Watermark"}</h2>
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

export function WhyWatermarkSection() {
  const { t } = useLanguageStore();
  const reasons = [
    {
      icon: <Shield className="h-5 w-5 text-blue-500" />,
      title: t('watermarkPdf.why.copyright.title') || "Copyright Protection",
      description: t('watermarkPdf.why.copyright.description') || "Protect your intellectual property by adding copyright notices and ownership information"
    },
    {
      icon: <Fingerprint className="h-5 w-5 text-blue-500" />,
      title: t('watermarkPdf.why.branding.title') || "Branding & Identity",
      description: t('watermarkPdf.why.branding.description') || "Reinforce your brand identity by adding logos or brand text to distributed documents"
    },
    {
      icon: <FileText className="h-5 w-5 text-blue-500" />,
      title: t('watermarkPdf.why.classification.title') || "Document Classification",
      description: t('watermarkPdf.why.classification.description') || "Mark documents as Draft, Confidential, or Final to indicate their status"
    },
    {
      icon: <Key className="h-5 w-5 text-blue-500" />,
      title: t('watermarkPdf.why.tracking.title') || "Document Tracking",
      description: t('watermarkPdf.why.tracking.description') || "Add unique identifiers to track document distribution and identify leaks"
    }
  ];

  return (
    <div className="mb-12 p-6 bg-muted/30 rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">{t('watermarkPdf.why.title') || "Why Add Watermarks"}</h2>
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

export function WatermarkTypesSection() {
  const { t } = useLanguageStore();
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center">{t('watermarkPdf.types.title') || "Watermark Types & Options"}</h2>
      <div className="border rounded-lg p-6 bg-card">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <FileText className="mr-2 text-blue-500" />
              {t('watermarkPdf.types.text.title') || "Text Watermark"}
            </h3>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-3">
                {t('watermarkPdf.types.text.description') || "Customize text watermarks with various options:"}
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>{t('watermarkPdf.types.text.options.text') || "Custom text content (multi-line supported)"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>{t('watermarkPdf.types.text.options.font') || "Font family, size, and color"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>{t('watermarkPdf.types.text.options.rotation') || "Rotation angle (0-360 degrees)"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>{t('watermarkPdf.types.text.options.opacity') || "Opacity level (transparent to fully visible)"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>{t('watermarkPdf.types.text.options.position') || "Position (center, tiled, custom placement)"}</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Image className="mr-2 text-blue-500" />
              {t('watermarkPdf.types.image.title') || "Image Watermark"}
            </h3>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-3">
                {t('watermarkPdf.types.image.description') || "Add image watermarks with these customizations:"}
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>{t('watermarkPdf.types.image.options.upload') || "Upload your own logo or image"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>{t('watermarkPdf.types.image.options.scale') || "Scale and resize"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>{t('watermarkPdf.types.image.options.rotation') || "Rotation options"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>{t('watermarkPdf.types.image.options.opacity') || "Transparency control"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>{t('watermarkPdf.types.image.options.position') || "Position customization"}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WatermarkFaqSection() {
  const { t } = useLanguageStore();
  
  const faqs = [
    {
      question: t('watermarkPdf.faq.removable.question') || "Can watermarks be removed from a PDF?",
      answer: t('watermarkPdf.faq.removable.answer') || "Our standard watermarks are semi-permanent and difficult to remove without specialized software. However, they are not completely tamper-proof. For more secure, tamper-resistant watermarking, consider our Pro plan which offers advanced security features that embed watermarks more deeply into the document structure."
    },
    {
      question: t('watermarkPdf.faq.printing.question') || "Will watermarks appear when the document is printed?",
      answer: t('watermarkPdf.faq.printing.answer') || "Yes, watermarks will appear when the document is printed. You can control the opacity to make them more subtle for printed documents while still being visible. The text watermarks will always print, while image watermarks will print based on your opacity settings."
    },
    {
      question: t('watermarkPdf.faq.pages.question') || "Can I watermark specific pages only?",
      answer: t('watermarkPdf.faq.pages.answer') || "Yes, our Pro plan allows you to apply watermarks to specific pages rather than the entire document. You can select individual pages, ranges, or even apply different watermarks to different sections of your document."
    },
    {
      question: t('watermarkPdf.faq.formats.question') || "What image formats are supported for image watermarks?",
      answer: t('watermarkPdf.faq.formats.answer') || "We support PNG, JPG/JPEG, and SVG formats for image watermarks. PNG is recommended for logos and images that require transparency. For best results, use high-resolution images with transparent backgrounds."
    },
    {
      question: t('watermarkPdf.faq.multiple.question') || "Can I add multiple watermarks to a single document?",
      answer: t('watermarkPdf.faq.multiple.answer') || "Pro users can add multiple watermarks to a single document, such as combining a logo in the corner with a 'Confidential' text watermark diagonally across the page. Free users are limited to one watermark per document."
    }
  ];

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center">{t('watermarkPdf.faq.title') || "Frequently Asked Questions"}</h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border rounded-lg p-4">
            <h3 className="font-medium mb-2 flex items-center">
              <Eye className="h-4 w-4 mr-2 text-primary" />
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
  
  const dosList = t('watermarkPdf.bestPractices.dosList') || [
    "Use semi-transparent watermarks to avoid obscuring content",
    "Consider diagonal watermarks for better coverage",
    "Test your watermark on a sample page before processing large documents",
    "Use contrasting colors for better visibility",
    "Include copyright symbol © for legal protection"
  ];
  
  const dontsList = t('watermarkPdf.bestPractices.dontsList') || [
    "Don't use watermarks that are too dark or opaque",
    "Don't place watermarks over important text or elements",
    "Don't use extremely small text that becomes illegible",
    "Don't rely solely on watermarks for document security",
    "Don't use low-resolution images that appear pixelated"
  ];

  return (
    <div className="mb-12 bg-muted/30 p-6 rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">{t('watermarkPdf.bestPractices.title') || "Watermarking Best Practices"}</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="text-lg font-medium mb-3 text-primary">{t('watermarkPdf.bestPractices.dos') || "Do's"}</h3>
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
          <h3 className="text-lg font-medium mb-3 text-destructive">{t('watermarkPdf.bestPractices.donts') || "Don'ts"}</h3>
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
      href: "/protect", 
      icon: <Shield className="h-5 w-5 text-blue-500" />,
      name: t('watermarkPdf.relatedTools.protect') || "Protect PDF",
      bg: "bg-blue-100 dark:bg-blue-900/30"
    },
    { 
      href: "/sign-pdf", 
      icon: <PenTool className="h-5 w-5 text-green-500" />,
      name: t('watermarkPdf.relatedTools.sign') || "Sign PDF",
      bg: "bg-green-100 dark:bg-green-900/30"
    },
    { 
      href: "/edit", 
      icon: <FileText className="h-5 w-5 text-purple-500" />,
      name: t('watermarkPdf.relatedTools.edit') || "Edit PDF",
      bg: "bg-purple-100 dark:bg-purple-900/30"
    },
    { 
      href: "/ocr", 
      icon: <FileCheck2 className="h-5 w-5 text-orange-500" />,
      name: t('watermarkPdf.relatedTools.ocr') || "OCR PDF",
      bg: "bg-orange-100 dark:bg-orange-900/30"
    }
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center">{t('watermarkPdf.relatedTools.title') || "Related Tools"}</h2>
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
          <Button variant="outline">{t('watermarkPdf.relatedTools.viewAll') || "View All Tools"}</Button>
        </LanguageLink>
      </div>
    </div>
  );
}