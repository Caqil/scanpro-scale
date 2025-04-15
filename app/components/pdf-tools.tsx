// components/pdf-tools.tsx
"use client";

import { PdfToolCard } from "@/components/pdf-tool-card";
import { useLanguageStore } from "@/src/store/store";
import {
  FileTextIcon,
  ImageIcon,
  TableIcon,
  ArrowRightIcon,
  LayoutIcon,
  ArrowDownIcon,
  RotateCcwIcon,
  ShieldIcon,
  Edit2Icon,
  LockIcon,
  FileCheck2,
  FileBadge2Icon,
  ReplaceAllIcon,
  PenLineIcon,
  FileCog,
  DiamondIcon,
} from "lucide-react";

export function PdfTools() {
  const { t } = useLanguageStore();
  
  // Define the tool categories and items with localized text
  const pdfTools = [
    {
      id: "convert",
      label: t('pdfTools.categories.convertFromPdf'),
      tools: [
        {
          id: "pdf-to-word",
          name: t('popular.pdfToWord'),
          description: t('toolDescriptions.pdfToWord'),
          icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="24" rx="6" fill="#DBEAFE"/>
              <path d="M6 4H18C19.1 4 20 4.9 20 6V18C20 19.1 19.1 20 18 20H6C4.9 20 4 19.1 4 18V6C4 4.9 4.9 4 6 4Z" fill="#3B82F6"/>
              <path d="M8 8V16M10 8L12 12L14 8M14 16V8M16 8V16" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          ),
          iconBg: "bg-blue-100 dark:bg-blue-900/30",
          href: "/convert/pdf-to-docx"  // Updated URL
        },
        {
          id: "pdf-to-powerpoint",
          name: t('popular.pdfToPowerPoint'),
          description: t('toolDescriptions.pdfToPowerpoint'),
          icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" rx="6" fill="#FFEDD5"/>
          <path d="M6 4H18C19.1 4 20 4.9 20 6V18C20 19.1 19.1 20 18 20H6C4.9 20 4 19.1 4 18V6C4 4.9 4.9 4 6 4Z" fill="#F97316"/>
          <path d="M8 8H16V10H8V8ZM8 12H14V14H8V12Z" fill="white"/>
        </svg>,
          iconBg: "bg-orange-100 dark:bg-orange-900/30",
          href: "/convert/pdf-to-pptx"  // Updated URL
        },
        {
          id: "pdf-to-excel",
          name: t('popular.pdfToExcel'),
          description: t('toolDescriptions.pdfToExcel'),
          icon: <TableIcon className="h-6 w-6 text-green-500" />,
          iconBg: "bg-green-100 dark:bg-green-900/30",
          href: "/convert/pdf-to-xlsx"  // Updated URL
        },
        {
          id: "pdf-to-jpg",
          name: t('popular.pdfToJpg'),
          description: t('toolDescriptions.pdfToJpg'),
          icon: <ImageIcon className="h-6 w-6 text-yellow-500" />,
          iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
          href: "/convert/pdf-to-jpg"  // Updated URL
        },
        {
          id: "pdf-to-png",
          name: t('popular.pdfToPng'),
          description: t('toolDescriptions.pdfToPng'),
          icon: <ImageIcon className="h-6 w-6 text-yellow-500" />,
          iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
          href: "/convert/pdf-to-png"  // Updated URL
        },
        {
          id: "pdf-to-html",
          name: t('popular.pdfToPng'),
          description: t('toolDescriptions.pdfToHtml'),
          icon: <LayoutIcon className="h-6 w-6 text-amber-500" />,
          iconBg: "bg-amber-100 dark:bg-amber-900/30",
          href: "/convert/pdf-to-html"  // Updated URL
        },
      ]
    },
    {
      id: "convert-to",
      label: t('pdfTools.categories.convertToPdf'),
      tools: [
        {
          id: "word-to-pdf",
          name: t('popular.wordToPdf'),
          description: t('toolDescriptions.wordToPdf'),
          icon: <FileTextIcon className="h-6 w-6 text-blue-500" />,
          iconBg: "bg-blue-100 dark:bg-blue-900/30",
          href: "/convert/docx-to-pdf"  // Updated URL
        },
        {
          id: "powerpoint-to-pdf",
          name: t('popular.powerPointToPdf'),
          description: t('toolDescriptions.powerpointToPdf'),
          icon: <FileTextIcon className="h-6 w-6 text-orange-500" />,
          iconBg: "bg-orange-100 dark:bg-orange-900/30",
          href: "/convert/pptx-to-pdf"  // Updated URL
        },
        {
          id: "excel-to-pdf",
          name: t('popular.excelToPdf'),
          description: t('toolDescriptions.excelToPdf'),
          icon: <TableIcon className="h-6 w-6 text-green-500" />,
          iconBg: "bg-green-100 dark:bg-green-900/30",
          href: "/convert/xlsx-to-pdf"  // Updated URL
        },
        {
          id: "jpg-to-pdf",
          name: t('popular.jpgToPdf'),
          description: t('toolDescriptions.jpgToPdf'),
          icon: <ImageIcon className="h-6 w-6 text-yellow-500" />,
          iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
          href: "/convert/jpg-to-pdf"  // Updated URL
        },
        {
          id: "png-to-pdf",
          name: t('popular.pngToPdf'),
          description: t('toolDescriptions.pngToPdf'),
          icon: <ImageIcon className="h-6 w-6 text-yellow-500" />,
          iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
          href: "/convert/png-to-pdf"  // Updated URL
        },
        {
          id: "html-to-pdf",
          name: t('popular.htmlToPdf'),
          description: t('toolDescriptions.htmlToPdf'),
          icon: <LayoutIcon className="h-6 w-6 text-amber-500" />,
          iconBg: "bg-amber-100 dark:bg-amber-900/30",
          href: "/convert/html-to-pdf"  // Updated URL
        },
      ]
    },
    {
      id: "modify",
      label: t('pdfTools.categories.basicTools'),
      tools: [
        {
          id: "merge-pdf",
          name:  t('popular.mergePdf'),
          description: t('toolDescriptions.mergePdf'),
          icon: <ArrowRightIcon className="h-6 w-6 text-red-500" />,
          iconBg: "bg-red-100 dark:bg-red-900/30",
          href: "/merge-pdf"
        },
        {
          id: "compress-pdf",
          name: t('popular.compressPdf'),
          description: t('toolDescriptions.compressPdf'),
          icon: <ArrowDownIcon className="h-6 w-6 text-green-500" />,
          iconBg: "bg-green-100 dark:bg-green-900/30",
          href: "/compress-pdf"
        },
         {
          id: "repair",
          name: t("repairPdf.title") || "Repair PDF",
          description: t("repairPdf.description") || "Fix corrupted PDF files and recover content",
          href: "/repair-pdf",
          icon: <ReplaceAllIcon className="h-8 w-8" />,
          iconBg: "bg-blue-100 dark:bg-blue-900/30",
          isNew: true
        },
        {
          id: "compress-file",
          name: t('compressPdf.compressAll'),
          description: t('compressPdf.description'),
          icon: <FileBadge2Icon className="h-6 w-6 text-green-500" />,
          iconBg: "bg-green-100 dark:bg-green-900/30",
          href: "/compress-files",
          isNew: true
        },
        {
          id: "split-pdf",
          name: t('popular.splitPdf'),
          description: t('splitPdf.description'),
          icon: <ArrowDownIcon className="h-6 w-6 text-green-500" />,
          iconBg: "bg-green-100 dark:bg-green-900/30",
          href: "/split-pdf",
        },
        { 
          id: "ocr",
          name: t('popular.ocr'), 
          href: "/ocr", 
          icon: <FileCheck2 className="h-5 w-5 text-blue-500" />,
          description: t('toolDescriptions.ocr'),
          iconBg: "bg-green-100 dark:bg-yellow-900/30",
          isNew: true
        },
        
      ]
    },
    {
      id: "organize",
      label: t('pdfTools.categories.organizePdf'),
      tools: [
        {
          id: "rotate-pdf",
          name: t('popular.rotatePdf'),
          description: t('toolDescriptions.rotatePdf'),
          icon: <RotateCcwIcon className="h-6 w-6 text-purple-500" />,
          iconBg: "bg-purple-100 dark:bg-purple-900/30",
          href: "/rotate-pdf"
        },
        {
          id: "watermark",
          name: t('popular.watermark'),
          description: t('toolDescriptions.watermark'),
          icon: <Edit2Icon className="h-6 w-6 text-purple-500" />,
          iconBg: "bg-purple-100 dark:bg-purple-900/30",
          href: "/watermark-pdf"
        },
      ]
    },
    {
      id: "security",
      label: t('pdfTools.categories.pdfSecurity'),
      tools: [
        {
          id: "unlock-pdf",
          name: "Unlock PDF",
          description: t('toolDescriptions.unlockPdf'),
          icon: <LockIcon className="h-6 w-6 text-blue-500" />,
          iconBg: "bg-blue-100 dark:bg-blue-900/30",
          href: "/unlock-pdf"
        },
        {
          id: "protect-pdf",
          name: "Protect PDF",
          description: t('toolDescriptions.protectPdf'),
          icon: <ShieldIcon className="h-6 w-6 text-blue-500" />,
          iconBg: "bg-blue-100 dark:bg-blue-900/30",
          href: "/protect-pdf"
        },
        { 
          id: "sign-pdf",
          name: t('popular.signPdf'), 
          href: "/sign-pdf", 
          icon: <PenLineIcon className="h-5 w-5 text-red-500" />,
          description: t('toolDescriptions.ocr'),
          iconBg: "bg-purple-100 dark:bg-yellow-900/30",
          isNew: true
        },
        {
          id: "repair-pdf",
          name: t("repairPdf.title"),
          description: t("repairPdf.shortDescription"),
          href: "/repair-pdf",
          icon: <FileCog className="w-6 h-6 text-indigo-500" />,
          backgroundColor: "bg-indigo-50 dark:bg-indigo-950/20",
          iconBg: "bg-green-100 dark:bg-blue-900/30",
        },
        {
          id: "pageNumber-pdf",
          name: t("pageNumber.title") || "Add Page Numbers", // New tool - Add Page Numbers
          description: t("pageNumber.shortDescription") || "Add customizable page numbers to your PDF documents",
          href: "/page-numbers-pdf",
          icon: <DiamondIcon className="w-6 h-6 text-violet-500" />,
          backgroundColor: "bg-violet-50 dark:bg-violet-950/20",
          iconBg: "bg-green-100 dark:bg-blue-900/30",
          new: true // Mark as new
        }
      ]
    }
  ];

  return (
    <div className="container max-w-6xl py-8 mx-auto">
      <div className="space-y-8">
        {pdfTools.map((category) => (
          <div key={category.id} className="space-y-4">
            <h2 className="text-xl font-bold">{category.label}</h2>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.tools.map((tool) => (
                <PdfToolCard
                  key={tool.id}
                  id={tool.id}
                  name={tool.name}
                  description={tool.description}
                  icon={tool.icon}
                  iconBg={tool.iconBg}
                  href={tool.href}
                  isNew={tool.isNew}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}