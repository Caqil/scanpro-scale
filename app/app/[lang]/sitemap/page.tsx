"use client";

import { Metadata } from "next";
import { LanguageLink } from "@/components/language-link";
import { useLanguageStore } from "@/src/store/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  FileIcon, 
  ArrowRight, 
  ImageIcon, 
  TableIcon, 
  LayoutGrid,
  Edit2Icon,
  LockIcon,
  ShieldIcon,
  FileCheck2,
  ScanIcon,
  BookOpenIcon,
  HelpCircleIcon,
  InfoIcon,
  LockOpenIcon
} from "lucide-react";

// Define sitemap categories and pages
interface SitemapPage {
  title: string;
  url: string;
  icon: React.ReactNode;
  description?: string;
}

interface SitemapCategory {
  title: string;
  pages: SitemapPage[];
}

export default function SitemapPage() {
  const { t } = useLanguageStore();

  // Define the sitemap data
  const sitemapData: SitemapCategory[] = [
    {
      title: t('pdfTools.categories.convertFromPdf'),
      pages: [
        { 
          title: t('popular.pdfToWord'), 
          url: "/convert/pdf-to-docx", 
          icon: <FileText className="h-4 w-4 text-blue-500" />,
          description: t('toolDescriptions.pdfToWord')
        },
        { 
          title: t('popular.pdfToExcel'), 
          url: "/convert/pdf-to-xlsx", 
          icon: <TableIcon className="h-4 w-4 text-green-500" />,
          description: t('toolDescriptions.pdfToExcel')
        },
        { 
          title: t('popular.pdfToPowerPoint'), 
          url: "/convert/pdf-to-pptx", 
          icon: <FileText className="h-4 w-4 text-orange-500" />,
          description: t('toolDescriptions.pdfToPowerpoint')
        },
        { 
          title: t('popular.pdfToJpg'), 
          url: "/convert/pdf-to-jpg", 
          icon: <ImageIcon className="h-4 w-4 text-yellow-500" />,
          description: t('toolDescriptions.pdfToJpg')
        },
        { 
          title: t('popular.pdfToPng'), 
          url: "/convert/pdf-to-png", 
          icon: <ImageIcon className="h-4 w-4 text-yellow-500" />,
          description: t('toolDescriptions.pdfToPng')
        },
        { 
          title: t('popular.pdfToHtml'), 
          url: "/convert/pdf-to-html", 
          icon: <LayoutGrid className="h-4 w-4 text-purple-500" />,
          description: t('toolDescriptions.pdfToHtml')
        },
      ]
    },
    {
      title: t('pdfTools.categories.convertToPdf'),
      pages: [
        { 
          title: t('popular.wordToPdf'), 
          url: "/convert/docx-to-pdf", 
          icon: <FileText className="h-4 w-4 text-blue-500" />,
          description: t('toolDescriptions.wordToPdf')
        },
        { 
          title: t('popular.excelToPdf'), 
          url: "/convert/xlsx-to-pdf", 
          icon: <TableIcon className="h-4 w-4 text-green-500" />,
          description: t('toolDescriptions.excelToPdf')
        },
        { 
          title: t('popular.powerPointToPdf'), 
          url: "/convert/pptx-to-pdf", 
          icon: <FileText className="h-4 w-4 text-orange-500" />,
          description: t('toolDescriptions.powerpointToPdf')
        },
        { 
          title: t('popular.jpgToPdf'), 
          url: "/convert/jpg-to-pdf", 
          icon: <ImageIcon className="h-4 w-4 text-yellow-500" />,
          description: t('toolDescriptions.jpgToPdf')
        },
        { 
          title: t('popular.pngToPdf'), 
          url: "/convert/png-to-pdf", 
          icon: <ImageIcon className="h-4 w-4 text-yellow-500" />,
          description: t('toolDescriptions.pngToPdf')
        },
        { 
          title: t('popular.htmlToPdf'), 
          url: "/convert/html-to-pdf", 
          icon: <LayoutGrid className="h-4 w-4 text-purple-500" />,
          description: t('toolDescriptions.htmlToPdf')
        },
      ]
    },
    {
      title: t('pdfTools.categories.organizePdf'),
      pages: [
        { 
          title: t('popular.mergePdf'), 
          url: "/merge-pdf", 
          icon: <ArrowRight className="h-4 w-4 text-red-500" />,
          description: t('toolDescriptions.mergePdf')
        },
        { 
          title: t('popular.splitPdf'), 
          url: "/split-pdf", 
          icon: <ArrowRight className="h-4 w-4 rotate-90 text-red-500" />,
          description: t('toolDescriptions.splitPdf')
        },
        { 
          title: t('popular.compressPdf'), 
          url: "/compress-pdf", 
          icon: <FileIcon className="h-4 w-4 text-green-500" />,
          description: t('toolDescriptions.compressPdf')
        },
        { 
          title: t('popular.rotatePdf'), 
          url: "/rotate", 
          icon: <ArrowRight className="h-4 w-4 rotate-45 text-blue-500" />,
          description: t('toolDescriptions.rotatePdf')
        },
        { 
          title: t('popular.watermark'), 
          url: "/watermark-pdf", 
          icon: <Edit2Icon className="h-4 w-4 text-purple-500" />,
          description: t('toolDescriptions.watermark')
        },
      ]
    },
    {
      title: t('pdfTools.categories.pdfSecurity'),
      pages: [
        { 
          title: t('popular.protectPdf'), 
          url: "/protect-pdf", 
          icon: <ShieldIcon className="h-4 w-4 text-blue-500" />,
          description: t('toolDescriptions.protectPdf')
        },
        { 
          title: t('popular.unlockPdf'), 
          url: "/unlock-pdf", 
          icon: <LockOpenIcon className="h-4 w-4 text-blue-500" />,
          description: t('toolDescriptions.unlockPdf')
        },
        { 
          title: t('popular.ocr'), 
          url: "/ocr", 
          icon: <ScanIcon className="h-4 w-4 text-purple-500" />,
          description: t('toolDescriptions.ocr')
        },
      ]
    },
    {
      title: t('nav.company'),
      pages: [
        { 
          title: t('about.title'), 
          url: "/about", 
          icon: <InfoIcon className="h-4 w-4 text-blue-500" />
        },
       
        { 
          title: "Contact", 
          url: "/contact", 
          icon: <HelpCircleIcon className="h-4 w-4 text-purple-500" />
        },
        { 
          title: "Terms", 
          url: "/terms", 
          icon: <FileText className="h-4 w-4 text-gray-500" />
        },
        { 
          title: "Privacy", 
          url: "/privacy", 
          icon: <LockIcon className="h-4 w-4 text-gray-500" />
        },
      ]
    },
  ];

  return (
    <div className="container max-w-4xl py-12 mx-auto">
      <div className="mb-8 flex items-center">
        <h1 className="text-3xl font-bold">Sitemap</h1>
        <p className="text-muted-foreground mt-2">A complete listing of all pages on our website</p>
      </div>

      <div className="space-y-8">
        {sitemapData.map((category, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{category.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {category.pages.map((page, pageIndex) => (
                  <LanguageLink 
                    key={pageIndex} 
                    href={page.url}
                    className="flex items-start p-3 border rounded-md hover:bg-muted/60 transition-colors"
                  >
                    <div className="mr-3 mt-0.5">{page.icon}</div>
                    <div>
                      <h3 className="font-medium">{page.title}</h3>
                      {page.description && (
                        <p className="text-sm text-muted-foreground">{page.description}</p>
                      )}
                    </div>
                  </LanguageLink>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}