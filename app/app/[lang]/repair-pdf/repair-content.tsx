"use client";

import { 
  FileText, 
  FileX, 
  FilePlus, 
  FileUp, 
  Info, 
  Check, 
  AlertTriangle, 
  Settings, 
  FileCheck2, 
  FileWarning, 
  File, 
  FlaskConical, 
  Link, 
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageLink } from "@/components/language-link";
import { useLanguageStore } from "@/src/store/store";

export function RepairHeaderSection() {
  const { t } = useLanguageStore();
  
  return (
    <div className="mx-auto flex flex-col items-center text-center mb-8">
      <div className="mb-4 p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
        <FileCheck2 className="h-8 w-8 text-blue-500" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        {t('repairPdf.title') || "Repair PDF Files"}
      </h1>
      <p className="mt-4 text-xl text-muted-foreground max-w-[700px]">
        {t('repairPdf.description') || "Fix corrupted PDF files, recover content, and optimize document structure"}
      </p>
    </div>
  );
}

export function HowToRepairSection() {
  const { t } = useLanguageStore();
  
  const steps = [
    {
      title: t('repairPdf.howTo.step1.title') || "Upload Your PDF",
      description: t('repairPdf.howTo.step1.description') || "Select the PDF file you want to repair from your device"
    },
    {
      title: t('repairPdf.howTo.step2.title') || "Choose Repair Mode",
      description: t('repairPdf.howTo.step2.description') || "Select the appropriate repair method based on your file's issues"
    },
    {
      title: t('repairPdf.howTo.step3.title') || "Download Repaired PDF",
      description: t('repairPdf.howTo.step3.description') || "Download your repaired PDF file with fixed structure and content"
    }
  ];

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center">{t('repairPdf.howTo.title') || "How to Repair Your PDF"}</h2>
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

export function WhyRepairSection() {
  const { t } = useLanguageStore();
  
  const reasons = [
    {
      icon: <FileX className="h-5 w-5 text-blue-500" />,
      title: t('repairPdf.why.corruptedFiles.title') || "Fix Corrupted Files",
      description: t('repairPdf.why.corruptedFiles.description') || "Recover content and structure from damaged PDF files that won't open properly"
    },
    {
      icon: <FilePlus className="h-5 w-5 text-blue-500" />,
      title: t('repairPdf.why.missingContent.title') || "Recover Missing Content",
      description: t('repairPdf.why.missingContent.description') || "Restore missing images, text or pages from partially corrupted documents"
    },
    {
      icon: <Settings className="h-5 w-5 text-blue-500" />,
      title: t('repairPdf.why.documentStructure.title') || "Fix Document Structure",
      description: t('repairPdf.why.documentStructure.description') || "Repair broken internal structure, page references, and links"
    },
    {
      icon: <Download className="h-5 w-5 text-blue-500" />,
      title: t('repairPdf.why.fileSize.title') || "Optimize File Size",
      description: t('repairPdf.why.fileSize.description') || "Clean up unnecessary data and optimize file size without quality loss"
    }
  ];

  return (
    <div className="mb-12 p-6 bg-muted/30 rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">{t('repairPdf.why.title') || "Why Repair PDFs"}</h2>
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

export function RepairModesSection() {
  const { t } = useLanguageStore();
  
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center">{t('repairPdf.modes.title') || "Available Repair Modes"}</h2>
      <div className="border rounded-lg p-6 bg-card">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <FileCheck2 className="mr-2 text-blue-500" />
              {t('repairPdf.modes.standard.title') || "Standard Repair"}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              {t('repairPdf.modes.standard.description') || "Fix common PDF issues, including broken cross-references, malformed objects, and stream errors. Best for mildly corrupted PDFs that still open but display errors."}
            </p>
            <div className="text-xs text-muted-foreground">
              <p><strong>Best for:</strong> PDFs that still open but have rendering issues or display errors</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <FileWarning className="mr-2 text-amber-500" />
              {t('repairPdf.modes.advanced.title') || "Advanced Recovery"}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              {t('repairPdf.modes.advanced.description') || "Deep repair for severely damaged PDFs with serious structural issues. Recovers as much content as possible from files that won't open at all."}
            </p>
            <div className="text-xs text-muted-foreground">
              <p><strong>Best for:</strong> Severely corrupted PDFs that won't open or are missing significant content</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <FlaskConical className="mr-2 text-green-500" />
              {t('repairPdf.modes.optimization.title') || "Optimization"}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              {t('repairPdf.modes.optimization.description') || "Restructure and optimize the PDF file without losing content. Removes redundant data, fixes minor issues, and improves overall file structure."}
            </p>
            <div className="text-xs text-muted-foreground">
              <p><strong>Best for:</strong> PDFs that open correctly but have performance issues or excessive file size</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RepairFaqSection() {
  const { t } = useLanguageStore();
  
  const faqs = [
    {
      question: t('repairPdf.faq.whatCanRepair.question') || "What types of PDF issues can be fixed?",
      answer: t('repairPdf.faq.whatCanRepair.answer') || "Our repair tool can fix a wide range of problems including corrupted file structures, broken page references, damaged content streams, missing cross-reference tables, and invalid objects. It can often recover content from PDFs that won't open or display correctly in standard PDF viewers."
    },
    {
      question: t('repairPdf.faq.completelyDamaged.question') || "Can you repair completely damaged PDFs?",
      answer: t('repairPdf.faq.completelyDamaged.answer') || "While our advanced repair mode can recover content from severely damaged PDFs, a 100% recovery isn't always possible if the file is completely corrupted. However, even in extreme cases, we can often recover partial content, especially text and basic elements."
    },
    {
      question: t('repairPdf.faq.contentQuality.question') || "Will repairing affect content quality?",
      answer: t('repairPdf.faq.contentQuality.answer') || "No, our repair process maintains the quality of recoverable content. Unlike some tools that simply extract and recreate PDFs (which can lose formatting), we attempt to preserve the original structure while fixing only the corrupted parts."
    },
    {
      question: t('repairPdf.faq.passwordProtected.question') || "Can you repair password-protected PDFs?",
      answer: t('repairPdf.faq.passwordProtected.answer') || "Yes, you can repair password-protected PDFs if you have the password. You'll need to enter the password during the repair process. We do not, however, attempt to bypass or remove encryption from protected documents without proper authorization."
    },
    {
      question: t('repairPdf.faq.dataSecurity.question') || "Is my PDF data secure during the repair process?",
      answer: t('repairPdf.faq.dataSecurity.answer') || "Yes, we take data security seriously. Your files are processed securely on our servers, not shared with third parties, and are automatically deleted after processing. We use encryption for all file transfers, and the entire repair process happens in a secure environment."
    }
  ];

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center">{t('repairPdf.faq.title') || "Frequently Asked Questions"}</h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border rounded-lg p-4">
            <h3 className="font-medium mb-2 flex items-center">
              <Info className="h-4 w-4 mr-2 text-primary" />
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
  
  const dosList = t('repairPdf.bestPractices.dosList') || [
    "Keep backups of original files before repair attempts",
    "Try the Standard repair mode first before using Advanced recovery",
    "Check the PDF with multiple viewers if possible",
    "Note which pages or elements are problematic before repair",
    "Use the Optimization mode for large but functional PDFs"
  ];
  
  const dontsList = t('repairPdf.bestPractices.dontsList') || [
    "Don't repeatedly save corrupted PDFs as this can worsen the damage",
    "Don't use repair as a substitute for proper PDF creation",
    "Don't expect 100% recovery from severely damaged files",
    "Don't open repaired files in older PDF viewers that might re-corrupt them",
    "Don't skip checking the repaired file for content accuracy"
  ];

  return (
    <div className="mb-12 bg-muted/30 p-6 rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">{t('repairPdf.bestPractices.title') || "Best Practices for PDF Recovery"}</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="text-lg font-medium mb-3 text-primary">{t('repairPdf.bestPractices.dos') || "Do's"}</h3>
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
          <h3 className="text-lg font-medium mb-3 text-destructive">{t('repairPdf.bestPractices.donts') || "Don'ts"}</h3>
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
      href: "/compress-pdf", 
      icon: <File className="h-5 w-5 text-green-500" />,
      name: t('repairPdf.relatedTools.compress') || "Compress PDF",
      bg: "bg-green-100 dark:bg-green-900/30"
    },
    { 
      href: "/unlock-pdf", 
      icon: <FileCheck2 className="h-5 w-5 text-blue-500" />,
      name: t('repairPdf.relatedTools.unlock') || "Unlock PDF",
      bg: "bg-blue-100 dark:bg-blue-900/30"
    },
    { 
      href: "/protect-pdf", 
      icon: <FileCheck2 className="h-5 w-5 text-purple-500" />,
      name: t('repairPdf.relatedTools.protect') || "Protect PDF",
      bg: "bg-purple-100 dark:bg-purple-900/30"
    },
    { 
      href: "/edit", 
      icon: <FileCheck2 className="h-5 w-5 text-orange-500" />,
      name: t('repairPdf.relatedTools.edit') || "Edit PDF",
      bg: "bg-orange-100 dark:bg-orange-900/30"
    }
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center">{t('repairPdf.relatedTools.title') || "Related Tools"}</h2>
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
          <Button variant="outline">{t('repairPdf.relatedTools.viewAll') || "View All Tools"}</Button>
        </LanguageLink>
      </div>
    </div>
  );
}