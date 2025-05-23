// components/pdf-tools.tsx
"use client";

import { PdfToolCard } from "@/components/pdf-tool-card";
import { useLanguageStore } from "@/src/store/store";
import { TrashIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
  SplitIcon,
  AlertCircleIcon,
} from "lucide-react";

// Interface for tool status from API
interface ToolStatus {
  id: string;
  enabled: boolean;
}

export function PdfTools() {
  const { t } = useLanguageStore();
  const [toolStatus, setToolStatus] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  // Fetch tool status from API
  useEffect(() => {
    const fetchToolStatus = async () => {
      try {
        setLoading(true);
        // Fetch tool status from API
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const response = await fetch(`${apiUrl}/api/tools/status`);

        if (response.ok) {
          const data = await response.json();
          // Convert array of tool status to an object for easier lookup
          const statusObj: Record<string, boolean> = {};
          data.tools.forEach((tool: ToolStatus) => {
            statusObj[tool.id] = tool.enabled;
          });
          setToolStatus(statusObj);
        } else {
          // If API endpoint doesn't exist yet or fails, default all tools to enabled
          console.warn(
            "Failed to fetch tool status, defaulting all tools to enabled"
          );
          const pdfToolsList = pdfTools.flatMap((category) => category.tools);
          const defaultStatus: Record<string, boolean> = {};
          pdfToolsList.forEach((tool) => {
            defaultStatus[tool.id] = true;
          });
          setToolStatus(defaultStatus);
        }
      } catch (error) {
        console.error("Failed to fetch tool status:", error);
        // Default all tools to enabled on error
        const pdfToolsList = pdfTools.flatMap((category) => category.tools);
        const defaultStatus: Record<string, boolean> = {};
        pdfToolsList.forEach((tool) => {
          defaultStatus[tool.id] = true;
        });
        setToolStatus(defaultStatus);
      } finally {
        setLoading(false);
      }
    };

    fetchToolStatus();
  }, []);

  // Define the tool categories and items with localized text
  const pdfTools = [
    {
      id: "convert",
      label: t("pdfTools.categories.convertFromPdf"),
      tools: [
        {
          id: "pdf-to-word",
          name: t("popular.pdfToWord"),
          description: t("toolDescriptions.pdfToWord"),
          icon: (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="24" height="24" rx="6" fill="#DBEAFE" />
              <path
                d="M6 4H18C19.1 4 20 4.9 20 6V18C20 19.1 19.1 20 18 20H6C4.9 20 4 19.1 4 18V6C4 4.9 4.9 4 6 4Z"
                fill="#3B82F6"
              />
              <path
                d="M8 8V16M10 8L12 12L14 8M14 16V8M16 8V16"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          ),
          iconBg: "bg-blue-100 dark:bg-blue-900/30",
          href: "/convert/pdf-to-docx", // Updated URL
          apiToolId: "convert", // Mapped to the API tool ID
        },
        {
          id: "pdf-to-powerpoint",
          name: t("popular.pdfToPowerPoint"),
          description: t("toolDescriptions.pdfToPowerpoint"),
          icon: (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="24" height="24" rx="6" fill="#FFEDD5" />
              <path
                d="M6 4H18C19.1 4 20 4.9 20 6V18C20 19.1 19.1 20 18 20H6C4.9 20 4 19.1 4 18V6C4 4.9 4.9 4 6 4Z"
                fill="#F97316"
              />
              <path d="M8 8H16V10H8V8ZM8 12H14V14H8V12Z" fill="white" />
            </svg>
          ),
          iconBg: "bg-orange-100 dark:bg-orange-900/30",
          href: "/convert/pdf-to-pptx", // Updated URL
          apiToolId: "convert", // Mapped to the API tool ID
        },
        {
          id: "pdf-to-excel",
          name: t("popular.pdfToExcel"),
          description: t("toolDescriptions.pdfToExcel"),
          icon: <TableIcon className="h-6 w-6 text-green-500" />,
          iconBg: "bg-green-100 dark:bg-green-900/30",
          href: "/convert/pdf-to-xlsx", // Updated URL
          apiToolId: "convert", // Mapped to the API tool ID
        },
        {
          id: "pdf-to-jpg",
          name: t("popular.pdfToJpg"),
          description: t("toolDescriptions.pdfToJpg"),
          icon: <ImageIcon className="h-6 w-6 text-yellow-500" />,
          iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
          href: "/convert/pdf-to-jpg", // Updated URL
          apiToolId: "convert", // Mapped to the API tool ID
        },
        {
          id: "pdf-to-png",
          name: t("popular.pdfToPng"),
          description: t("toolDescriptions.pdfToPng"),
          icon: <ImageIcon className="h-6 w-6 text-yellow-500" />,
          iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
          href: "/convert/pdf-to-png", // Updated URL
          apiToolId: "convert", // Mapped to the API tool ID
        },
        {
          id: "pdf-to-html",
          name: t("popular.pdfToHtml"),
          description: t("toolDescriptions.pdfToHtml"),
          icon: <LayoutIcon className="h-6 w-6 text-amber-500" />,
          iconBg: "bg-amber-100 dark:bg-amber-900/30",
          href: "/convert/pdf-to-html", // Updated URL
          apiToolId: "convert", // Mapped to the API tool ID
        },
      ],
    },
    {
      id: "convert-to",
      label: t("pdfTools.categories.convertToPdf"),
      tools: [
        {
          id: "word-to-pdf",
          name: t("popular.wordToPdf"),
          description: t("toolDescriptions.wordToPdf"),
          icon: <FileTextIcon className="h-6 w-6 text-blue-500" />,
          iconBg: "bg-blue-100 dark:bg-blue-900/30",
          href: "/convert/docx-to-pdf", // Updated URL
          apiToolId: "convert", // Mapped to the API tool ID
        },
        {
          id: "powerpoint-to-pdf",
          name: t("popular.powerPointToPdf"),
          description: t("toolDescriptions.powerpointToPdf"),
          icon: <FileTextIcon className="h-6 w-6 text-orange-500" />,
          iconBg: "bg-orange-100 dark:bg-orange-900/30",
          href: "/convert/pptx-to-pdf", // Updated URL
          apiToolId: "convert", // Mapped to the API tool ID
        },
        {
          id: "excel-to-pdf",
          name: t("popular.excelToPdf"),
          description: t("toolDescriptions.excelToPdf"),
          icon: <TableIcon className="h-6 w-6 text-green-500" />,
          iconBg: "bg-green-100 dark:bg-green-900/30",
          href: "/convert/xlsx-to-pdf", // Updated URL
          apiToolId: "convert", // Mapped to the API tool ID
        },
        {
          id: "jpg-to-pdf",
          name: t("popular.jpgToPdf"),
          description: t("toolDescriptions.jpgToPdf"),
          icon: <ImageIcon className="h-6 w-6 text-yellow-500" />,
          iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
          href: "/convert/jpg-to-pdf", // Updated URL
          apiToolId: "convert", // Mapped to the API tool ID
        },
        {
          id: "png-to-pdf",
          name: t("popular.pngToPdf"),
          description: t("toolDescriptions.pngToPdf"),
          icon: <ImageIcon className="h-6 w-6 text-yellow-500" />,
          iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
          href: "/convert/png-to-pdf", // Updated URL
          apiToolId: "convert", // Mapped to the API tool ID
        },
        {
          id: "html-to-pdf",
          name: t("popular.htmlToPdf"),
          description: t("toolDescriptions.htmlToPdf"),
          icon: <LayoutIcon className="h-6 w-6 text-amber-500" />,
          iconBg: "bg-amber-100 dark:bg-amber-900/30",
          href: "/convert/html-to-pdf", // Updated URL
          apiToolId: "convert", // Mapped to the API tool ID
        },
      ],
    },
    {
      id: "modify",
      label: t("pdfTools.categories.basicTools"),
      tools: [
        {
          id: "merge-pdf",
          name: t("popular.mergePdf"),
          description: t("toolDescriptions.mergePdf"),
          icon: <ArrowRightIcon className="h-6 w-6 text-red-500" />,
          iconBg: "bg-red-100 dark:bg-red-900/30",
          href: "/merge-pdf",
          apiToolId: "merge", // Mapped to the API tool ID
        },
        {
          id: "compress-pdf",
          name: t("popular.compressPdf"),
          description: t("toolDescriptions.compressPdf"),
          icon: <ArrowDownIcon className="h-6 w-6 text-green-500" />,
          iconBg: "bg-green-100 dark:bg-green-900/30",
          href: "/compress-pdf",
          apiToolId: "compress", // Mapped to the API tool ID
        },
        {
          id: "repair",
          name: t("repairPdf.title") || "Repair PDF",
          description:
            t("repairPdf.description") ||
            "Fix corrupted PDF files and recover content",
          href: "/repair-pdf",
          icon: <ReplaceAllIcon className="h-8 w-8" />,
          iconBg: "bg-blue-100 dark:bg-blue-900/30",
          apiToolId: "repair", // Mapped to the API tool ID
        },
        {
          id: "split-pdf",
          name: t("popular.splitPdf"),
          description: t("splitPdf.description"),
          icon: <SplitIcon className="h-6 w-6 text-green-500" />,
          iconBg: "bg-green-100 dark:bg-green-900/30",
          href: "/split-pdf",
          apiToolId: "split", // Mapped to the API tool ID
        },
        {
          id: "ocr",
          name: t("ocr.extractText"),
          href: "/ocr",
          icon: <FileCheck2 className="h-5 w-5 text-blue-500" />,
          description: t("toolDescriptions.ocr"),
          iconBg: "bg-green-100 dark:bg-yellow-900/30",
          apiToolId: "ocr", // Mapped to the API tool ID
        },
        {
          id: "ocr-pdf",
          name: t("ocrPdf.title"),
          href: "/ocr-pdf",
          icon: <FileCheck2 className="h-5 w-5 text-blue-500" />,
          description: t("ocrPdf.description"),
          iconBg: "bg-green-100 dark:bg-yellow-900/30",
          apiToolId: "ocr", // Mapped to the API tool ID
        },
        {
          id: "edit-pdf",
          name: t("pdfTextEditor.title"),
          description: t("pdfTextEditor.description"),
          icon: <ArrowRightIcon className="h-6 w-6 text-red-500" />,
          iconBg: "bg-red-100 dark:bg-red-900/30",
          href: "/edit-pdf",
          apiToolId: "edit", // Mapped to the API tool ID
        },
      ],
    },
    {
      id: "organize",
      label: t("pdfTools.categories.organizePdf"),
      tools: [
        {
          id: "rotate-pdf",
          name: t("popular.rotatePdf"),
          description: t("toolDescriptions.rotatePdf"),
          icon: <RotateCcwIcon className="h-6 w-6 text-purple-500" />,
          iconBg: "bg-purple-100 dark:bg-purple-900/30",
          href: "/rotate-pdf",
          apiToolId: "rotate", // Mapped to the API tool ID
        },
        {
          id: "watermark",
          name: t("popular.watermark"),
          description: t("toolDescriptions.watermark"),
          icon: <Edit2Icon className="h-6 w-6 text-purple-500" />,
          iconBg: "bg-purple-100 dark:bg-purple-900/30",
          href: "/watermark-pdf",
          apiToolId: "watermark", // Mapped to the API tool ID
        },
        {
          id: "remove-pdf-pages",
          name: t("removePdf.title"),
          description: t("removePdf.description"),
          icon: <TrashIcon className="h-6 w-6 text-green-500" />,
          iconBg: "bg-green-100 dark:bg-green-900/30",
          href: "/remove-pdf-page",
          isNew: true,
          apiToolId: "remove", // Mapped to the API tool ID
        },
      ],
    },
    {
      id: "security",
      label: t("pdfTools.categories.pdfSecurity"),
      tools: [
        {
          id: "unlock-pdf",
          name: "Unlock PDF",
          description: t("toolDescriptions.unlockPdf"),
          icon: <LockIcon className="h-6 w-6 text-blue-500" />,
          iconBg: "bg-blue-100 dark:bg-blue-900/30",
          href: "/unlock-pdf",
          apiToolId: "unlock", // Mapped to the API tool ID
        },
        {
          id: "protect-pdf",
          name: "Protect PDF",
          description: t("toolDescriptions.protectPdf"),
          icon: <ShieldIcon className="h-6 w-6 text-blue-500" />,
          iconBg: "bg-blue-100 dark:bg-blue-900/30",
          href: "/protect-pdf",
          apiToolId: "protect", // Mapped to the API tool ID
        },
        {
          id: "sign-pdf",
          name: t("popular.signPdf"),
          href: "/sign-pdf",
          icon: <PenLineIcon className="h-5 w-5 text-red-500" />,
          description: t("signPdf.description"),
          iconBg: "bg-purple-100 dark:bg-yellow-900/30",
          isNew: true,
          apiToolId: "sign", // Mapped to the API tool ID
        },
        {
          id: "pageNumber-pdf",
          name: t("pageNumber.title") || "Add Page Numbers", // New tool - Add Page Numbers
          description:
            t("pageNumber.shortDescription") ||
            "Add customizable page numbers to your PDF documents",
          href: "/page-numbers-pdf",
          icon: <DiamondIcon className="w-6 h-6 text-violet-500" />,
          backgroundColor: "bg-violet-50 dark:bg-violet-950/20",
          iconBg: "bg-green-100 dark:bg-blue-900/30",
          new: true, // Mark as new
          apiToolId: "pagenumber", // Mapped to the API tool ID
        },
      ],
    },
  ];

  // Check if a tool is enabled
  const isToolEnabled = (tool: any) => {
    // If we're still loading, return true to avoid flickering
    if (loading) return true;
    // If the tool doesn't have an API tool ID mapping, default to enabled
    if (!tool.apiToolId) return true;
    // Check if the tool is enabled in the status map
    return toolStatus[tool.apiToolId] !== false;
  };

  return (
    <div className="container max-w-6xl py-8 mx-auto">
      <div className="space-y-8">
        {pdfTools.map((category) => {
          // Filter tools that are enabled
          const enabledTools = category.tools.filter(isToolEnabled);

          // Skip rendering the category if no tools are enabled
          if (enabledTools.length === 0) return null;

          return (
            <div key={category.id} className="space-y-4">
              <h2 className="text-xl font-bold">{category.label}</h2>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {enabledTools.map((tool) => (
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
          );
        })}
      </div>

      {/* Display a message if no tools are enabled */}
      {Object.values(toolStatus).every((status) => status === false) &&
        !loading && (
          <div className="flex flex-col items-center justify-center p-8 mt-8 border rounded-lg">
            <AlertCircleIcon className="h-10 w-10 text-yellow-500 mb-4" />
            <h3 className="text-xl font-medium mb-2">
              Tools Temporarily Unavailable
            </h3>
            <p className="text-center text-muted-foreground max-w-md">
              Our PDF tools are currently undergoing maintenance. Please check
              back later or contact support if you need assistance.
            </p>
          </div>
        )}
    </div>
  );
}
