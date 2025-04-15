"use client";

import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguageStore } from "@/src/store/store";
import { FileText, FolderOpen, Maximize2, MinusSquare, Lock, Key, PlusSquare, Download, Upload, Layers } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function EndpointsList() {
  const { t } = useLanguageStore();
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Define endpoints with their details
  const endpoints = [
    {
      id: "convert-pdf-to-word",
      name: "PDF to Word",
      endpoint: "/api/convert/pdf-to-docx",
      method: "POST",
      description: "Convert PDF documents to Word (DOCX) format",
      category: "conversion",
      params: [
        { name: "file", type: "File", required: true, description: "The PDF file to convert" }
      ],
      responses: {
        "200": {
          description: "Successful conversion",
          example: `{
  "success": true,
  "message": "PDF converted successfully",
  "fileUrl": "/api/file?folder=conversions&filename=abc123.docx",
  "filename": "abc123.docx"
}`
        },
        "400": {
          description: "Bad request (invalid file type, missing file)",
          example: `{
  "error": "No PDF file provided",
  "success": false
}`
        }
      }
    },
    {
      id: "convert-pdf-to-excel",
      name: "PDF to Excel",
      endpoint: "/api/convert/pdf-to-xlsx",
      method: "POST",
      description: "Convert PDF documents to Excel (XLSX) format",
      category: "conversion",
      params: [
        { name: "file", type: "File", required: true, description: "The PDF file to convert" }
      ],
      responses: {
        "200": {
          description: "Successful conversion",
          example: `{
  "success": true,
  "message": "PDF converted successfully",
  "fileUrl": "/api/file?folder=conversions&filename=abc123.xlsx",
  "filename": "abc123.xlsx"
}`
        },
        "400": {
          description: "Bad request",
          example: `{
  "error": "No PDF file provided",
  "success": false
}`
        }
      }
    },
    {
      id: "convert-pdf-to-jpg",
      name: "PDF to JPG",
      endpoint: "/api/convert/pdf-to-jpg",
      method: "POST",
      description: "Convert PDF pages to JPG images",
      category: "conversion",
      params: [
        { name: "file", type: "File", required: true, description: "The PDF file to convert" },
        { name: "quality", type: "number", required: false, description: "Image quality (1-100, default: 90)" }
      ],
      responses: {
        "200": {
          description: "Successful conversion",
          example: `{
  "success": true,
  "message": "PDF converted to images successfully",
  "pages": [
    {
      "pageNumber": 1,
      "fileUrl": "/api/file?folder=conversions&filename=abc123-page-1.jpg"
    }
  ]
}`
        }
      }
    },
    {
      id: "merge-pdf",
      name: "Merge PDFs",
      endpoint: "/api/pdf/merge",
      method: "POST",
      description: "Combine multiple PDF files into a single PDF",
      category: "manipulation",
      params: [
        { name: "files[]", type: "File[]", required: true, description: "Array of PDF files to merge" },
        { name: "order", type: "string", required: false, description: "Comma-separated indices defining merge order" }
      ],
      responses: {
        "200": {
          description: "Successful merge",
          example: `{
  "success": true,
  "message": "PDFs merged successfully",
  "fileUrl": "/api/file?folder=merges&filename=abc123-merged.pdf",
  "filename": "abc123-merged.pdf"
}`
        }
      }
    },
    {
      id: "split-pdf",
      name: "Split PDF",
      endpoint: "/api/pdf/split",
      method: "POST",
      description: "Split a PDF into multiple files by page ranges",
      category: "manipulation",
      params: [
        { name: "file", type: "File", required: true, description: "The PDF file to split" },
        { name: "splitMethod", type: "string", required: false, description: "Method: 'range', 'extract', 'every' (default: 'range')" },
        { name: "pageRanges", type: "string", required: false, description: "Page ranges (e.g., '1-3,5,7-9') when splitMethod is 'range'" },
        { name: "everyNPages", type: "number", required: false, description: "Split every N pages when splitMethod is 'every'" }
      ],
      responses: {
        "200": {
          description: "Successful split",
          example: `{
  "success": true,
  "message": "PDF split into 3 files",
  "splitParts": [
    {
      "fileUrl": "/api/file?folder=splits&filename=abc123-split-1.pdf",
      "filename": "abc123-split-1.pdf",
      "pages": [1, 2, 3],
      "pageCount": 3
    }
  ]
}`
        }
      }
    },
    {
      id: "compress-pdf",
      name: "Compress PDF",
      endpoint: "/api/pdf/compress",
      method: "POST",
      description: "Reduce PDF file size while maintaining reasonable quality",
      category: "manipulation",
      params: [
        { name: "file", type: "File", required: true, description: "The PDF file to compress" },
        { name: "quality", type: "string", required: false, description: "Compression level: 'low', 'medium', 'high' (default: 'medium')" }
      ],
      responses: {
        "200": {
          description: "Successful compression",
          example: `{
  "success": true,
  "message": "PDF compressed successfully",
  "fileUrl": "/api/file?folder=compressions&filename=abc123-compressed.pdf",
  "filename": "abc123-compressed.pdf",
  "originalSize": 1048576,
  "compressedSize": 524288,
  "reductionPercentage": 50
}`
        }
      }
    },
    {
      id: "add-watermark",
      name: "Add Watermark",
      endpoint: "/api/pdf/watermark",
      method: "POST",
      description: "Add text or image watermark to PDF pages",
      category: "security",
      params: [
        { name: "file", type: "File", required: true, description: "The PDF file to watermark" },
        { name: "watermarkType", type: "string", required: true, description: "Type of watermark: 'text' or 'image'" },
        { name: "text", type: "string", required: false, description: "Text to use as watermark (when type is 'text')" },
        { name: "watermarkImage", type: "File", required: false, description: "Image to use as watermark (when type is 'image')" },
        { name: "position", type: "string", required: false, description: "Position: 'center', 'tile', 'top-left', etc. (default: 'center')" },
        { name: "opacity", type: "number", required: false, description: "Opacity percentage (1-100, default: 30)" },
        { name: "rotation", type: "number", required: false, description: "Rotation angle in degrees (default: 45)" },
        { name: "pages", type: "string", required: false, description: "Pages to watermark: 'all', 'even', 'odd', 'custom' (default: 'all')" },
        { name: "customPages", type: "string", required: false, description: "Custom page ranges when pages is 'custom'" }
      ],
      responses: {
        "200": {
          description: "Successful watermarking",
          example: `{
  "success": true,
  "message": "PDF watermarked successfully",
  "fileUrl": "/api/file?folder=watermarks&filename=abc123-watermarked.pdf",
  "filename": "abc123-watermarked.pdf"
}`
        }
      }
    },
    {
      id: "protect-pdf",
      name: "Protect PDF",
      endpoint: "/api/pdf/protect",
      method: "POST",
      description: "Add password protection to PDF documents",
      category: "security",
      params: [
        { name: "file", type: "File", required: true, description: "The PDF file to protect" },
        { name: "password", type: "string", required: true, description: "Password to secure the PDF" },
        { name: "permission", type: "string", required: false, description: "Permission level: 'all', 'restricted' (default: 'restricted')" },
        { name: "allowPrinting", type: "boolean", required: false, description: "Allow printing (default: false)" },
        { name: "allowCopying", type: "boolean", required: false, description: "Allow text/image copying (default: false)" },
        { name: "allowEditing", type: "boolean", required: false, description: "Allow editing (default: false)" }
      ],
      responses: {
        "200": {
          description: "Successful protection",
          example: `{
  "success": true,
  "message": "PDF protected with password successfully",
  "fileUrl": "/api/file?folder=protected&filename=abc123-protected.pdf",
  "filename": "abc123-protected.pdf"
}`
        }
      }
    },
    {
      id: "unlock-pdf",
      name: "Unlock PDF",
      endpoint: "/api/pdf/unlock",
      method: "POST",
      description: "Remove password protection from PDF documents",
      category: "security",
      params: [
        { name: "file", type: "File", required: true, description: "The password-protected PDF file" },
        { name: "password", type: "string", required: true, description: "Current password of the PDF" }
      ],
      responses: {
        "200": {
          description: "Successful unlocking",
          example: `{
  "success": true,
  "message": "PDF unlocked successfully",
  "fileUrl": "/api/file?folder=unlocked&filename=abc123-unlocked.pdf",
  "filename": "abc123-unlocked.pdf"
}`
        },
        "400": {
          description: "Incorrect password",
          example: `{
  "error": "Incorrect password",
  "success": false
}`
        }
      }
    },
    {
      id: "ocr-extract",
      name: "OCR Text Extraction",
      endpoint: "/api/ocr/extract",
      method: "POST",
      description: "Extract text from PDF using Optical Character Recognition",
      category: "ocr",
      params: [
        { name: "file", type: "File", required: true, description: "The PDF file to process" },
        { name: "language", type: "string", required: false, description: "OCR language code (default: 'eng')" },
        { name: "pageRange", type: "string", required: false, description: "Page range type: 'all', 'specific' (default: 'all')" },
        { name: "pages", type: "string", required: false, description: "Specific pages to process when pageRange is 'specific'" }
      ],
      responses: {
        "200": {
          description: "Successful OCR extraction",
          example: `{
  "success": true,
  "message": "OCR text extraction completed successfully",
  "text": "Extracted text content...",
  "fileUrl": "/api/file?folder=ocr&filename=abc123-text.txt",
  "filename": "abc123-text.txt",
  "wordCount": 250
}`
        }
      }
    }
  ];

  // Filter endpoints based on selected category
  const filteredEndpoints = filterCategory === "all" 
    ? endpoints 
    : endpoints.filter(endpoint => endpoint.category === filterCategory);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('developer.endpoints.title') || "API Endpoints"}</CardTitle>
          <CardDescription>
            {t('developer.endpoints.subtitle') || "Complete reference for all available API endpoints"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" onValueChange={setFilterCategory} className="mb-6">
            <TabsList className="grid grid-cols-5 md:grid-cols-5 mb-4">
              <TabsTrigger value="all">
                <Layers className="h-4 w-4 mr-2 hidden md:inline-block" />
                {t('developer.endpoints.categories.all') || "All"}
              </TabsTrigger>
              <TabsTrigger value="conversion">
                <FileText className="h-4 w-4 mr-2 hidden md:inline-block" />
                {t('developer.endpoints.categories.conversion') || "Conversion"}
              </TabsTrigger>
              <TabsTrigger value="manipulation">
                <Maximize2 className="h-4 w-4 mr-2 hidden md:inline-block" />
                {t('developer.endpoints.categories.manipulation') || "Manipulation"}
              </TabsTrigger>
              <TabsTrigger value="security">
                <Lock className="h-4 w-4 mr-2 hidden md:inline-block" />
                {t('developer.endpoints.categories.security') || "Security"}
              </TabsTrigger>
              <TabsTrigger value="ocr">
                <FolderOpen className="h-4 w-4 mr-2 hidden md:inline-block" />
                {t('developer.endpoints.categories.ocr') || "OCR"}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Accordion type="single" collapsible className="w-full">
            {filteredEndpoints.map((endpoint) => (
              <AccordionItem key={endpoint.id} value={endpoint.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                      <Badge variant={endpoint.method === "GET" ? "outline" : "default"} className="uppercase">
                        {endpoint.method}
                      </Badge>
                      <span className="font-medium">{endpoint.name}</span>
                    </div>
                    <Badge variant="outline" className="hidden md:inline-flex">
                      {endpoint.endpoint}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                      <p className="text-sm font-mono mt-2 bg-muted p-2 rounded-md">{endpoint.endpoint}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">{t('developer.endpoints.parameters') || "Parameters"}</h4>
                      <div className="overflow-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-muted text-muted-foreground">
                            <tr>
                              <th className="text-left p-2 border">{t('developer.endpoints.paramName') || "Name"}</th>
                              <th className="text-left p-2 border">{t('developer.endpoints.type') || "Type"}</th>
                              <th className="text-left p-2 border">{t('developer.endpoints.required') || "Required"}</th>
                              <th className="text-left p-2 border">{t('developer.endpoints.description') || "Description"}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {endpoint.params.map((param, index) => (
                              <tr key={index}>
                                <td className="p-2 border font-mono">{param.name}</td>
                                <td className="p-2 border">{param.type}</td>
                                <td className="p-2 border">{param.required ? "Yes" : "No"}</td>
                                <td className="p-2 border">{param.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">{t('developer.endpoints.responses') || "Responses"}</h4>
                      <div className="space-y-4">
                        {Object.entries(endpoint.responses).map(([status, response]) => (
                          <div key={status} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant={status.startsWith("2") ? "default" : "destructive"}>
                                {status}
                              </Badge>
                              <span className="text-sm">{response.description}</span>
                            </div>
                            <pre className="bg-muted p-3 rounded-md overflow-auto text-xs">
                              <code>{response.example}</code>
                            </pre>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}