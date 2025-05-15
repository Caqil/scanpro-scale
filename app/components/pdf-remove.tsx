"use client";

import React, { useState, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useLanguageStore } from "@/src/store/store";
import {
  CheckIcon,
  LoaderIcon,
  DownloadIcon,
  RefreshCwIcon,
  XCircleIcon,
  ZoomInIcon,
  ZoomOutIcon,
  EyeIcon,
  SaveIcon,
  Trash2Icon,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileDropzone } from "./dropzone";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface PdfPage {
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
}

export function PdfRemove() {
  const { t } = useLanguageStore();
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PdfPage[]>([]);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [processing, setProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [processedPdfUrl, setProcessedPdfUrl] = useState<string>("");
  const [previewPage, setPreviewPage] = useState<number | null>(null);
  const [previewScale, setPreviewScale] = useState<number>(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processPdf = async (pdfFile: File) => {
    setProcessing(true);
    setProgress(0);

    try {
      const fileUrl = URL.createObjectURL(pdfFile);
      const pdf = await pdfjs.getDocument(fileUrl).promise;
      const numPages = pdf.numPages;
      const newPages: PdfPage[] = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1 });

        newPages.push({
          width: viewport.width,
          height: viewport.height,
          originalWidth: viewport.width,
          originalHeight: viewport.height,
        });

        setProgress(Math.floor((i / numPages) * 100));
      }

      setPages(newPages);
      setProgress(100);
      URL.revokeObjectURL(fileUrl);
    } catch (error) {
      console.error("Error processing PDF:", error);
      toast.error(t("removePdf.messages.error") || "Error processing PDF");
    } finally {
      setProcessing(false);
    }
  };

  const handlePageSelect = (event: React.MouseEvent, pageNumber: number) => {
    event.stopPropagation();
    const newSelectedPages = new Set(selectedPages);
    if (newSelectedPages.has(pageNumber)) {
      newSelectedPages.delete(pageNumber);
    } else {
      // Don't allow selecting all pages
      if (newSelectedPages.size >= pages.length - 1) {
        toast.error(t("removePdf.messages.cannotRemoveAll") || "Cannot remove all pages");
        return;
      }
      newSelectedPages.add(pageNumber);
    }
    setSelectedPages(newSelectedPages);
  };

  const handlePageClick = (pageNumber: number) => {
    setPreviewPage(pageNumber);
    setPreviewScale(1);
  };

  const handleSelectAll = () => {
    if (selectedPages.size === pages.length - 1) {
      // If already at max, clear all
      setSelectedPages(new Set());
    } else {
      // Select all except one
      const newSelection = new Set<number>();
      for (let i = 0; i < pages.length - 1; i++) {
        newSelection.add(i);
      }
      setSelectedPages(newSelection);
    }
  };

  const handleSaveDocument = async () => {
    if (!file || selectedPages.size === 0) return;

    setProcessing(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);
      // Convert 0-indexed to 1-indexed for API
      const pagesToRemove = Array.from(selectedPages).map((page) => page + 1);
      formData.append("pagesToRemove", JSON.stringify(pagesToRemove));

      const response = await fetch("/api/pdf/remove", {
        method: "POST",
        body: formData,
      });

      setProgress(50);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("removePdf.messages.error"));
      }

      const result = await response.json();

      if (result.success) {
        setProcessedPdfUrl(result.fileUrl);
        setProgress(100);
        toast.success(t("removePdf.messages.success") || "Pages removed successfully!");
      } else {
        throw new Error(result.error || t("removePdf.messages.error"));
      }
    } catch (error) {
      console.error("Error removing pages:", error);
      toast.error(
        error instanceof Error ? error.message : t("removePdf.messages.error") || "Error removing pages"
      );
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  const reset = () => {
    setFile(null);
    setSelectedPages(new Set());
    setProcessedPdfUrl("");
    setPages([]);
    setPreviewPage(null);
    setPreviewScale(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const renderPageThumbnails = () => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {pages.map((_, index) => {
          const isSelected = selectedPages.has(index);
          return (
            <div
              key={index}
              className={`relative cursor-pointer transition-all duration-200 ${
                isSelected ? "opacity-50" : ""
              }`}
              onClick={() => handlePageClick(index)}
            >
              <div className="border rounded-lg overflow-hidden shadow-sm bg-white hover:shadow-md transition-shadow">
                <Document file={file}>
                  <Page
                    pageNumber={index + 1}
                    width={150}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </Document>
                <div className="absolute top-2 right-2 z-10">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => {}}
                    onClick={(e) => handlePageSelect(e, index)}
                    className="bg-white border-gray-400"
                  />
                </div>
                {isSelected && (
                  <div className="absolute inset-0 bg-red-500 bg-opacity-20 flex items-center justify-center pointer-events-none">
                    <XCircleIcon className="h-12 w-12 text-red-500" />
                  </div>
                )}
              </div>
              <div className="text-center mt-2 text-sm font-medium">
                {t("removePdf.page") || "Page"} {index + 1}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const getRemainingPages = () => {
    const remaining = [];
    for (let i = 0; i < pages.length; i++) {
      if (!selectedPages.has(i)) {
        remaining.push(i + 1);
      }
    }
    return remaining;
  };

  return (
    <div className="bg-muted/30 rounded-lg p-4 w-full">
      <div className="flex flex-col min-h-[600px] bg-background rounded-lg border shadow-sm">
        {/* File Upload Section */}
        {!file && (
          <div className="flex-1 flex items-center justify-center p-6">
            <FileDropzone
              multiple={false}
              maxFiles={1}
              acceptedFileTypes={{ "application/pdf": [".pdf"] }}
              disabled={processing}
              onFileAccepted={(acceptedFiles) => {
                if (acceptedFiles.length > 0) {
                  const uploadedFile = acceptedFiles[0];
                  setFile(uploadedFile);
                  setSelectedPages(new Set());
                  setProcessedPdfUrl("");
                  processPdf(uploadedFile);
                }
              }}
              title={t("removePdf.uploadTitle") || "Upload Your PDF"}
              description={t("removePdf.uploadDesc") || "Upload a PDF file to remove pages. Your file will be processed securely."}
              browseButtonText={t("ui.browse") || "Browse Files"}
              browseButtonVariant="default"
              securityText={t("ui.filesSecurity") || "Your files are secure and never stored permanently"}
            />
          </div>
        )}

        {/* Page Selection Section */}
        {file && !processing && !processedPdfUrl && pages.length > 0 && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold">
                  {t("removePdf.selectPages") || "Select Pages to Remove"}
                </h3>
                <p className="text-muted-foreground">
                  {t("removePdf.selectPagesDesc") || "Click on pages to mark them for removal"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedPages.size} {t("removePdf.pagesSelected") || "pages selected"} ·{" "}
                  {getRemainingPages().length} {t("removePdf.pagesRemaining") || "pages remaining"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => reset()}>
                  <RefreshCwIcon className="h-4 w-4 mr-2" />
                  {t("ui.clearAll") || "Clear All"}
                </Button>
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  <CheckIcon className="h-4 w-4 mr-2" />
                  {selectedPages.size === pages.length - 1
                    ? t("removePdf.clearSelection") || "Clear Selection"
                    : t("removePdf.selectMax") || "Select Max"}
                </Button>
                {selectedPages.size > 0 && (
                  <Button size="sm" onClick={handleSaveDocument}>
                    <SaveIcon className="h-4 w-4 mr-2" />
                    {t("removePdf.saveDocument") || "Save Document"}
                  </Button>
                )}
              </div>
            </div>

            {renderPageThumbnails()}
          </div>
        )}

        {/* Processing Section */}
        {file && processing && !processedPdfUrl && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="bg-background rounded-lg p-8 shadow-sm border w-96 text-center">
              <LoaderIcon className="h-16 w-16 animate-spin text-primary mb-6 mx-auto" />
              <h3 className="text-xl font-semibold mb-3">
                {t("removePdf.processing") || "Processing PDF..."}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t("removePdf.messages.processing") || "Please wait while we process your PDF."}
              </p>
              <Progress value={progress} className="w-full h-2" />
            </div>
          </div>
        )}

        {/* Success Section */}
        {file && !processing && processedPdfUrl && (
          <div className="flex-1 flex items-center justify-center p-6">
            <Card className="w-full max-w-md">
              <CardContent className="p-8 text-center">
                <div className="mb-6 p-4 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 mx-auto w-20 h-20 flex items-center justify-center">
                  <CheckIcon className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">
                  {t("removePdf.messages.success") || "Pages Removed Successfully!"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {t("removePdf.messages.downloadReady") || "Your processed PDF is ready for download."}
                </p>
                <div className="flex gap-4 justify-center">
                  <Button variant="outline" onClick={reset}>
                    <RefreshCwIcon className="h-4 w-4 mr-2" />
                    {t("ui.startOver") || "Start Over"}
                  </Button>
                  <Button
                    onClick={() => window.open(processedPdfUrl, "_blank")}
                  >
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    {t("ui.download") || "Download"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Page Preview Modal */}
      <Dialog
        open={previewPage !== null}
        onOpenChange={() => setPreviewPage(null)}
      >
        <DialogContent className="w-[90vw] max-w-6xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle>
              {t("removePdf.pagePreview") || "Page Preview"}{" "}
              {previewPage !== null ? previewPage + 1 : ""}
            </DialogTitle>
          </DialogHeader>

          {previewPage !== null && (
            <div className="flex flex-col flex-1 p-4 pt-0 gap-3">
              {/* Zoom Controls */}
              <div className="flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPreviewScale((prev) => Math.max(prev - 0.2, 0.5))
                    }
                    disabled={previewScale <= 0.5}
                  >
                    <ZoomOutIcon className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium min-w-[60px] text-center">
                    {Math.round(previewScale * 100)}%
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPreviewScale((prev) => Math.min(prev + 0.2, 3))
                    }
                    disabled={previewScale >= 3}
                  >
                    <ZoomInIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewScale(1)}
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    Fit
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  {selectedPages.has(previewPage) ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => handlePageSelect(e, previewPage)}
                    >
                      <XCircleIcon className="h-4 w-4 mr-2" />
                      {t("removePdf.removeFromDocument") || "Remove from Document"}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handlePageSelect(e, previewPage)}
                      disabled={selectedPages.size >= pages.length - 1}
                    >
                      <Trash2Icon className="h-4 w-4 mr-2" />
                      {t("removePdf.markForRemoval") || "Mark for Removal"}
                    </Button>
                  )}
                </div>
              </div>

              {/* Page Display */}
              <div className="flex-1 border rounded-lg bg-gray-50 overflow-auto min-h-0">
                <div className="p-4 flex items-center justify-center min-h-full">
                  <div
                    style={{
                      transform: `scale(${previewScale})`,
                      transformOrigin: "center",
                    }}
                  >
                    <Document file={file}>
                      <Page
                        pageNumber={previewPage + 1}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        height={window.innerHeight * 0.6}
                      />
                    </Document>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPreviewPage((prev) => Math.max(0, prev! - 1))
                  }
                  disabled={previewPage === 0}
                >
                  Previous Page
                </Button>
                <span className="text-sm font-medium">
                  Page {previewPage + 1} of {pages.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPreviewPage((prev) =>
                      Math.min(pages.length - 1, prev! + 1)
                    )
                  }
                  disabled={previewPage === pages.length - 1}
                >
                  Next Page
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}