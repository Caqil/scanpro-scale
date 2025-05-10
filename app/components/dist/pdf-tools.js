// components/pdf-tools.tsx
"use client";
"use strict";
exports.__esModule = true;
exports.PdfTools = void 0;
var pdf_tool_card_1 = require("@/components/pdf-tool-card");
var store_1 = require("@/src/store/store");
var react_icons_1 = require("@radix-ui/react-icons");
var lucide_react_1 = require("lucide-react");
function PdfTools() {
    var t = store_1.useLanguageStore().t;
    // Define the tool categories and items with localized text
    var pdfTools = [
        {
            id: "convert",
            label: t("pdfTools.categories.convertFromPdf"),
            tools: [
                {
                    id: "pdf-to-word",
                    name: t("popular.pdfToWord"),
                    description: t("toolDescriptions.pdfToWord"),
                    icon: (React.createElement("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" },
                        React.createElement("rect", { width: "24", height: "24", rx: "6", fill: "#DBEAFE" }),
                        React.createElement("path", { d: "M6 4H18C19.1 4 20 4.9 20 6V18C20 19.1 19.1 20 18 20H6C4.9 20 4 19.1 4 18V6C4 4.9 4.9 4 6 4Z", fill: "#3B82F6" }),
                        React.createElement("path", { d: "M8 8V16M10 8L12 12L14 8M14 16V8M16 8V16", stroke: "white", "stroke-width": "1.5", "stroke-linecap": "round" }))),
                    iconBg: "bg-blue-100 dark:bg-blue-900/30",
                    href: "/convert/pdf-to-docx"
                },
                {
                    id: "pdf-to-powerpoint",
                    name: t("popular.pdfToPowerPoint"),
                    description: t("toolDescriptions.pdfToPowerpoint"),
                    icon: (React.createElement("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" },
                        React.createElement("rect", { width: "24", height: "24", rx: "6", fill: "#FFEDD5" }),
                        React.createElement("path", { d: "M6 4H18C19.1 4 20 4.9 20 6V18C20 19.1 19.1 20 18 20H6C4.9 20 4 19.1 4 18V6C4 4.9 4.9 4 6 4Z", fill: "#F97316" }),
                        React.createElement("path", { d: "M8 8H16V10H8V8ZM8 12H14V14H8V12Z", fill: "white" }))),
                    iconBg: "bg-orange-100 dark:bg-orange-900/30",
                    href: "/convert/pdf-to-pptx"
                },
                {
                    id: "pdf-to-excel",
                    name: t("popular.pdfToExcel"),
                    description: t("toolDescriptions.pdfToExcel"),
                    icon: React.createElement(lucide_react_1.TableIcon, { className: "h-6 w-6 text-green-500" }),
                    iconBg: "bg-green-100 dark:bg-green-900/30",
                    href: "/convert/pdf-to-xlsx"
                },
                {
                    id: "pdf-to-jpg",
                    name: t("popular.pdfToJpg"),
                    description: t("toolDescriptions.pdfToJpg"),
                    icon: React.createElement(lucide_react_1.ImageIcon, { className: "h-6 w-6 text-yellow-500" }),
                    iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
                    href: "/convert/pdf-to-jpg"
                },
                {
                    id: "pdf-to-png",
                    name: t("popular.pdfToPng"),
                    description: t("toolDescriptions.pdfToPng"),
                    icon: React.createElement(lucide_react_1.ImageIcon, { className: "h-6 w-6 text-yellow-500" }),
                    iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
                    href: "/convert/pdf-to-png"
                },
                {
                    id: "pdf-to-html",
                    name: t("popular.pdfToPng"),
                    description: t("toolDescriptions.pdfToHtml"),
                    icon: React.createElement(lucide_react_1.LayoutIcon, { className: "h-6 w-6 text-amber-500" }),
                    iconBg: "bg-amber-100 dark:bg-amber-900/30",
                    href: "/convert/pdf-to-html"
                },
            ]
        },
        {
            id: "convert-to",
            label: t("pdfTools.categories.convertToPdf"),
            tools: [
                {
                    id: "word-to-pdf",
                    name: t("popular.wordToPdf"),
                    description: t("toolDescriptions.wordToPdf"),
                    icon: React.createElement(lucide_react_1.FileTextIcon, { className: "h-6 w-6 text-blue-500" }),
                    iconBg: "bg-blue-100 dark:bg-blue-900/30",
                    href: "/convert/docx-to-pdf"
                },
                {
                    id: "powerpoint-to-pdf",
                    name: t("popular.powerPointToPdf"),
                    description: t("toolDescriptions.powerpointToPdf"),
                    icon: React.createElement(lucide_react_1.FileTextIcon, { className: "h-6 w-6 text-orange-500" }),
                    iconBg: "bg-orange-100 dark:bg-orange-900/30",
                    href: "/convert/pptx-to-pdf"
                },
                {
                    id: "excel-to-pdf",
                    name: t("popular.excelToPdf"),
                    description: t("toolDescriptions.excelToPdf"),
                    icon: React.createElement(lucide_react_1.TableIcon, { className: "h-6 w-6 text-green-500" }),
                    iconBg: "bg-green-100 dark:bg-green-900/30",
                    href: "/convert/xlsx-to-pdf"
                },
                {
                    id: "jpg-to-pdf",
                    name: t("popular.jpgToPdf"),
                    description: t("toolDescriptions.jpgToPdf"),
                    icon: React.createElement(lucide_react_1.ImageIcon, { className: "h-6 w-6 text-yellow-500" }),
                    iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
                    href: "/convert/jpg-to-pdf"
                },
                {
                    id: "png-to-pdf",
                    name: t("popular.pngToPdf"),
                    description: t("toolDescriptions.pngToPdf"),
                    icon: React.createElement(lucide_react_1.ImageIcon, { className: "h-6 w-6 text-yellow-500" }),
                    iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
                    href: "/convert/png-to-pdf"
                },
                {
                    id: "html-to-pdf",
                    name: t("popular.htmlToPdf"),
                    description: t("toolDescriptions.htmlToPdf"),
                    icon: React.createElement(lucide_react_1.LayoutIcon, { className: "h-6 w-6 text-amber-500" }),
                    iconBg: "bg-amber-100 dark:bg-amber-900/30",
                    href: "/convert/html-to-pdf"
                },
            ]
        },
        {
            id: "modify",
            label: t("pdfTools.categories.basicTools"),
            tools: [
                {
                    id: "merge-pdf",
                    name: t("popular.mergePdf"),
                    description: t("toolDescriptions.mergePdf"),
                    icon: React.createElement(lucide_react_1.ArrowRightIcon, { className: "h-6 w-6 text-red-500" }),
                    iconBg: "bg-red-100 dark:bg-red-900/30",
                    href: "/merge-pdf"
                },
                {
                    id: "compress-pdf",
                    name: t("popular.compressPdf"),
                    description: t("toolDescriptions.compressPdf"),
                    icon: React.createElement(lucide_react_1.ArrowDownIcon, { className: "h-6 w-6 text-green-500" }),
                    iconBg: "bg-green-100 dark:bg-green-900/30",
                    href: "/compress-pdf"
                },
                {
                    id: "repair",
                    name: t("repairPdf.title") || "Repair PDF",
                    description: t("repairPdf.description") ||
                        "Fix corrupted PDF files and recover content",
                    href: "/repair-pdf",
                    icon: React.createElement(lucide_react_1.ReplaceAllIcon, { className: "h-8 w-8" }),
                    iconBg: "bg-blue-100 dark:bg-blue-900/30"
                },
                {
                    id: "compress-file",
                    name: t("compressPdf.compressAll"),
                    description: t("compressPdf.description"),
                    icon: React.createElement(lucide_react_1.FileBadge2Icon, { className: "h-6 w-6 text-green-500" }),
                    iconBg: "bg-green-100 dark:bg-green-900/30",
                    href: "/compress-files"
                },
                {
                    id: "split-pdf",
                    name: t("popular.splitPdf"),
                    description: t("splitPdf.description"),
                    icon: React.createElement(lucide_react_1.SplitIcon, { className: "h-6 w-6 text-green-500" }),
                    iconBg: "bg-green-100 dark:bg-green-900/30",
                    href: "/split-pdf"
                },
                {
                    id: "ocr",
                    name: t("popular.ocr"),
                    href: "/ocr",
                    icon: React.createElement(lucide_react_1.FileCheck2, { className: "h-5 w-5 text-blue-500" }),
                    description: t("toolDescriptions.ocr"),
                    iconBg: "bg-green-100 dark:bg-yellow-900/30"
                },
            ]
        },
        {
            id: "organize",
            label: t("pdfTools.categories.organizePdf"),
            tools: [
                {
                    id: "rotate-pdf",
                    name: t("popular.rotatePdf"),
                    description: t("toolDescriptions.rotatePdf"),
                    icon: React.createElement(lucide_react_1.RotateCcwIcon, { className: "h-6 w-6 text-purple-500" }),
                    iconBg: "bg-purple-100 dark:bg-purple-900/30",
                    href: "/rotate-pdf"
                },
                {
                    id: "watermark",
                    name: t("popular.watermark"),
                    description: t("toolDescriptions.watermark"),
                    icon: React.createElement(lucide_react_1.Edit2Icon, { className: "h-6 w-6 text-purple-500" }),
                    iconBg: "bg-purple-100 dark:bg-purple-900/30",
                    href: "/watermark-pdf"
                },
                {
                    id: "remove-pdf-pages",
                    name: t("removePdf.title"),
                    description: t("toolDescriptions.compressPdf"),
                    icon: React.createElement(react_icons_1.TrashIcon, { className: "h-6 w-6 text-green-500" }),
                    iconBg: "bg-green-100 dark:bg-green-900/30",
                    href: "/compress-pdf",
                    isNew: true
                },
            ]
        },
        {
            id: "security",
            label: t("pdfTools.categories.pdfSecurity"),
            tools: [
                {
                    id: "unlock-pdf",
                    name: "Unlock PDF",
                    description: t("toolDescriptions.unlockPdf"),
                    icon: React.createElement(lucide_react_1.LockIcon, { className: "h-6 w-6 text-blue-500" }),
                    iconBg: "bg-blue-100 dark:bg-blue-900/30",
                    href: "/unlock-pdf"
                },
                {
                    id: "protect-pdf",
                    name: "Protect PDF",
                    description: t("toolDescriptions.protectPdf"),
                    icon: React.createElement(lucide_react_1.ShieldIcon, { className: "h-6 w-6 text-blue-500" }),
                    iconBg: "bg-blue-100 dark:bg-blue-900/30",
                    href: "/protect-pdf"
                },
                {
                    id: "sign-pdf",
                    name: t("popular.signPdf"),
                    href: "/sign-pdf",
                    icon: React.createElement(lucide_react_1.PenLineIcon, { className: "h-5 w-5 text-red-500" }),
                    description: t("toolDescriptions.ocr"),
                    iconBg: "bg-purple-100 dark:bg-yellow-900/30",
                    isNew: true
                },
                {
                    id: "repair-pdf",
                    name: t("repairPdf.title"),
                    description: t("repairPdf.shortDescription"),
                    href: "/repair-pdf",
                    icon: React.createElement(lucide_react_1.FileCog, { className: "w-6 h-6 text-indigo-500" }),
                    backgroundColor: "bg-indigo-50 dark:bg-indigo-950/20",
                    iconBg: "bg-green-100 dark:bg-blue-900/30"
                },
                {
                    id: "pageNumber-pdf",
                    name: t("pageNumber.title") || "Add Page Numbers",
                    description: t("pageNumber.shortDescription") ||
                        "Add customizable page numbers to your PDF documents",
                    href: "/page-numbers-pdf",
                    icon: React.createElement(lucide_react_1.DiamondIcon, { className: "w-6 h-6 text-violet-500" }),
                    backgroundColor: "bg-violet-50 dark:bg-violet-950/20",
                    iconBg: "bg-green-100 dark:bg-blue-900/30",
                    "new": true
                },
            ]
        },
    ];
    return (React.createElement("div", { className: "container max-w-6xl py-8 mx-auto" },
        React.createElement("div", { className: "space-y-8" }, pdfTools.map(function (category) { return (React.createElement("div", { key: category.id, className: "space-y-4" },
            React.createElement("h2", { className: "text-xl font-bold" }, category.label),
            React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4" }, category.tools.map(function (tool) { return (React.createElement(pdf_tool_card_1.PdfToolCard, { key: tool.id, id: tool.id, name: tool.name, description: tool.description, icon: tool.icon, iconBg: tool.iconBg, href: tool.href, isNew: tool.isNew })); })))); }))));
}
exports.PdfTools = PdfTools;
