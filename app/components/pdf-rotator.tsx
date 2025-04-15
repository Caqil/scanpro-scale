"use client";

import { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useLanguageStore } from "@/src/store/store";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Upload,
  Download,
  RotateCw,
  RotateCcw,
  Trash,
  Loader2,
  Check,
  Info,
  FileText,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ListFilter,
} from "lucide-react";
import useFileUpload from "@/hooks/useFileUpload";
import { UploadProgress } from "./ui/upload-progress";

// Initialize pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PageRotation {
  pageNumber: number;
  angle: number;
  original: number;
}

export function PdfRotator() {
  const { t } = useLanguageStore();
  const [file, setFile] = useState<File | null>(null);
  const [rotationMode, setRotationMode] = useState<string>("individual");
  const [fileUrl, setFileUrl] = useState<string>("");
  const [numPages, setNumPages] = useState<number>(0);
  const [pageRotations, setPageRotations] = useState<PageRotation[]>([]);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [processedFileUrl, setProcessedFileUrl] = useState<string>("");
  const [isPagesLoading, setIsPagesLoading] = useState<boolean>(false);
  const [pageFormat, setPageFormat] = useState<string>("all");
  const [customRange, setCustomRange] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [showPageSelector, setShowPageSelector] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const {
    isUploading,
    progress: uploadProgress,
    error: uploadError,
    uploadFile,
    resetUpload,
    uploadStats,
  } = useFileUpload();
  useEffect(() => {
    return () => {
      // Clean up the object URL when component unmounts
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const selectedFile = files[0];
    if (selectedFile.type !== "application/pdf") {
      toast.error(
        t("rotatePdf.errors.invalidType") || "Please select a valid PDF file"
      );
      return;
    }

    processSelectedFile(selectedFile);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);

    const files = event.dataTransfer.files;
    if (!files || files.length === 0) return;

    const droppedFile = files[0];
    if (droppedFile.type !== "application/pdf") {
      toast.error(
        t("rotatePdf.errors.invalidType") || "Please select a valid PDF file"
      );
      return;
    }

    processSelectedFile(droppedFile);
  };

  const processSelectedFile = (selectedFile: File) => {
    setFile(selectedFile);
    setFileUrl(URL.createObjectURL(selectedFile));
    setCurrentPage(1);
    setSelectedPages([]);
    setPageRotations([]);
    setProcessedFileUrl("");
    setProgress(0);
  };

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsPagesLoading(false);

    // Initialize rotations for all pages
    const initialRotations = Array.from({ length: numPages }, (_, i) => ({
      pageNumber: i + 1,
      angle: 0,
      original: 0,
    }));

    setPageRotations(initialRotations);

    // By default, select all pages
    if (pageFormat === "all") {
      setSelectedPages(Array.from({ length: numPages }, (_, i) => i + 1));
    }
  };

  const handlePageSelect = (pageNumber: number) => {
    // Toggle page selection
    if (selectedPages.includes(pageNumber)) {
      setSelectedPages(selectedPages.filter((p) => p !== pageNumber));
    } else {
      setSelectedPages([...selectedPages, pageNumber].sort((a, b) => a - b));
    }
  };

  const handleSelectAll = () => {
    if (selectedPages.length === numPages) {
      // Deselect all
      setSelectedPages([]);
    } else {
      // Select all
      setSelectedPages(Array.from({ length: numPages }, (_, i) => i + 1));
    }
  };

  const handleRotatePage = (
    pageNumber: number,
    direction: "clockwise" | "counterclockwise"
  ) => {
    setPageRotations((prevRotations) => {
      return prevRotations.map((rotation) => {
        if (rotation.pageNumber === pageNumber) {
          // Calculate new angle
          const change = direction === "clockwise" ? 90 : -90;
          let newAngle = (rotation.angle + change) % 360;
          if (newAngle < 0) newAngle += 360;

          return {
            ...rotation,
            angle: newAngle,
          };
        }
        return rotation;
      });
    });
  };

  const handleRotateSelected = (
    direction: "clockwise" | "counterclockwise"
  ) => {
    if (selectedPages.length === 0) {
      toast.error(
        t("rotatePdf.errors.noSelection") ||
          "Please select at least one page to rotate"
      );
      return;
    }

    setPageRotations((prevRotations) => {
      return prevRotations.map((rotation) => {
        if (selectedPages.includes(rotation.pageNumber)) {
          // Calculate new angle
          const change = direction === "clockwise" ? 90 : -90;
          let newAngle = (rotation.angle + change) % 360;
          if (newAngle < 0) newAngle += 360;

          return {
            ...rotation,
            angle: newAngle,
          };
        }
        return rotation;
      });
    });
  };

  const handleProcessPdf = async () => {
    if (!file) return;

    if (pageRotations.every((rotation) => rotation.angle === 0)) {
      toast.error(
        t("rotatePdf.errors.noRotation") ||
          "Please rotate at least one page before processing"
      );
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("rotations", JSON.stringify(pageRotations));

    try {
      await uploadFile(file, formData, {
        url: "/api/pdf/rotate",
        onProgress: (progress) => {
          setProgress(progress);
        },
        onSuccess: (result) => {
          setProgress(100);
          setProcessedFileUrl(result.fileUrl);
          toast.success(
            t("rotatePdf.messages.success") || "PDF rotated successfully!"
          );
        },
        onError: (err) => {
          console.error("Error processing PDF:", err);
          toast.error(
            t("rotatePdf.errors.processingError") ||
              "An error occurred while processing your PDF. Please try again."
          );
        },
      });
    } catch (error) {
      console.error("Error processing PDF:", error);
      toast.error(
        t("rotatePdf.errors.processingError") ||
          "An error occurred while processing your PDF. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (processedFileUrl) {
      const link = document.createElement("a");
      link.href = processedFileUrl;
      link.download = file
        ? file.name.replace(".pdf", "_rotated.pdf")
        : "rotated.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleReset = () => {
    setFile(null);
    setFileUrl("");
    setNumPages(0);
    setPageRotations([]);
    setSelectedPages([]);
    setCurrentPage(1);
    setProcessedFileUrl("");
    setProgress(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePageFormatChange = (format: string) => {
    setPageFormat(format);

    // Reset selections based on the format
    if (format === "all") {
      setSelectedPages(Array.from({ length: numPages }, (_, i) => i + 1));
    } else if (format === "none") {
      setSelectedPages([]);
    } else if (format === "even") {
      setSelectedPages(
        Array.from({ length: numPages }, (_, i) => i + 1).filter(
          (p) => p % 2 === 0
        )
      );
    } else if (format === "odd") {
      setSelectedPages(
        Array.from({ length: numPages }, (_, i) => i + 1).filter(
          (p) => p % 2 === 1
        )
      );
    } else if (format === "custom") {
      // Keep the current selection for custom format
    }
  };

  const parseCustomRange = () => {
    if (!customRange.trim()) return;

    const ranges = customRange.split(",").map((r) => r.trim());
    const newSelectedPages: number[] = [];

    for (const range of ranges) {
      if (range.includes("-")) {
        // Range like "1-5"
        const [start, end] = range.split("-").map(Number);
        if (
          !isNaN(start) &&
          !isNaN(end) &&
          start > 0 &&
          end <= numPages &&
          start <= end
        ) {
          for (let i = start; i <= end; i++) {
            if (!newSelectedPages.includes(i)) {
              newSelectedPages.push(i);
            }
          }
        }
      } else {
        // Single page like "3"
        const page = Number(range);
        if (
          !isNaN(page) &&
          page > 0 &&
          page <= numPages &&
          !newSelectedPages.includes(page)
        ) {
          newSelectedPages.push(page);
        }
      }
    }

    setSelectedPages(newSelectedPages.sort((a, b) => a - b));
  };

  const renderPageSelector = () => (
    <div className="border rounded-lg mb-4 bg-muted/10">
      <div className="p-4 border-b">
        <h3 className="font-medium mb-3">
          {t("rotatePdf.form.selectPages") || "Select Pages"}
        </h3>

        <div className="mb-4">
          <Tabs value={pageFormat} onValueChange={handlePageFormatChange}>
            <TabsList className="grid grid-cols-4 h-8 text-xs">
              <TabsTrigger value="all">
                {t("rotatePdf.form.rotateAll") || "All"}
              </TabsTrigger>
              <TabsTrigger value="even">
                {t("rotatePdf.form.rotateEven") || "Even"}
              </TabsTrigger>
              <TabsTrigger value="odd">
                {t("rotatePdf.form.rotateOdd") || "Odd"}
              </TabsTrigger>
              <TabsTrigger value="custom">
                {t("rotatePdf.form.rotateSelected") || "Custom"}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {pageFormat === "custom" && (
          <div className="flex gap-2 mb-4">
            <Input
              className="h-8 text-xs"
              placeholder="e.g. 1-3, 5, 7-9"
              value={customRange}
              onChange={(e) => setCustomRange(e.target.value)}
            />
            <Button
              variant="secondary"
              className="h-8 text-xs px-2"
              onClick={parseCustomRange}
            >
              {t("ui.apply") || "Apply"}
            </Button>
          </div>
        )}

        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="selectAll"
              checked={selectedPages.length === numPages && numPages > 0}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="selectAll" className="text-xs">
              {t("rotatePdf.messages.selectAll") || "Select All"}
            </Label>
          </div>
          <span className="text-xs text-muted-foreground">
            {selectedPages.length}/{numPages}{" "}
            {t("rotatePdf.messages.pageOf") || "selected"}
          </span>
        </div>
      </div>

      <div className="p-3 max-h-40 overflow-y-auto grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
        {isPagesLoading ? (
          <div className="flex justify-center p-4 col-span-full">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          Array.from(new Array(numPages), (_, index) => (
            <div
              key={index}
              className={cn(
                "flex flex-col items-center p-2 rounded-md cursor-pointer border",
                selectedPages.includes(index + 1) &&
                  "bg-primary/10 border-primary",
                index + 1 === currentPage && "ring-1 ring-primary"
              )}
              onClick={() => setCurrentPage(index + 1)}
            >
              <span className="text-xs font-medium mb-1">{index + 1}</span>
              <Checkbox
                checked={selectedPages.includes(index + 1)}
                onCheckedChange={() => handlePageSelect(index + 1)}
                onClick={(e) => e.stopPropagation()}
                className="mt-1"
              />
              {pageRotations.find((r) => r.pageNumber === index + 1)?.angle !==
                0 && (
                <span className="text-xs text-primary font-medium mt-1">
                  {pageRotations.find((r) => r.pageNumber === index + 1)?.angle}
                  °
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderUploadSection = () => (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-12 text-center transition-colors",
        isDragOver
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/20"
      )}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".pdf"
        onChange={handleFileChange}
      />
      <div className="mb-6 p-4 rounded-full bg-primary/10 mx-auto w-20 h-20 flex items-center justify-center">
        <Upload className="h-10 w-10 text-primary" />
      </div>
      <h3 className="text-2xl font-semibold mb-3">
        {t("rotatePdf.form.uploadTitle") || "Upload PDF to Rotate"}
      </h3>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        {t("rotatePdf.form.uploadDesc") ||
          "Upload your PDF file to rotate pages. You can rotate individual pages or apply rotation to multiple pages at once."}
      </p>
      <Button
        size="lg"
        className="px-8"
        onClick={() => fileInputRef.current?.click()}
      >
        {t("ui.browse") || "Browse Files"}
      </Button>
      <p className="mt-6 text-sm text-muted-foreground">
        {t("ui.filesSecurity") ||
          "Your files are processed securely. All uploads are automatically deleted after processing."}
      </p>
    </div>
  );

  const renderProcessingSection = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="bg-background rounded-lg p-8 shadow-sm border w-96 text-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-6 mx-auto" />
        <h3 className="text-xl font-semibold mb-3">
          {t("rotatePdf.processing") || "Processing PDF..."}
        </h3>
        <p className="text-muted-foreground mb-6">
          {t("rotatePdf.messages.processing") ||
            "Please wait while we rotate your PDF pages..."}
        </p>
        <Progress value={progress} className="w-full h-2" />
      </div>
    </div>
  );

  const renderSuccessSection = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="bg-background rounded-lg p-8 shadow-sm border w-96 text-center">
        <div className="mb-6 p-4 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 mx-auto w-20 h-20 flex items-center justify-center">
          <Check className="h-10 w-10" />
        </div>
        <h3 className="text-xl font-semibold mb-3">
          {t("rotatePdf.success") || "PDF Rotated Successfully!"}
        </h3>
        <p className="text-muted-foreground mb-6">
          {t("rotatePdf.messages.downloadReady") ||
            "Your PDF has been processed and is ready to download."}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            {t("ocr.processAnother") || "New File"}
          </Button>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            {t("ui.download") || "Download"}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderEditorSection = () => (
    <div className="flex flex-col">
      {/* Page selector toggle button */}
      <div className="mb-3 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPageSelector(!showPageSelector)}
          className="flex items-center gap-1"
        >
          <ListFilter className="h-4 w-4" />
          {showPageSelector
            ? t("rotatePdf.form.hideSelector") || "Hide Page Selector"
            : t("rotatePdf.form.showSelector") || "Select Pages"}
        </Button>
      </div>

      {/* Page selector panel */}
      {showPageSelector && renderPageSelector()}

      {/* Main PDF preview */}
      <div className="border rounded-lg flex-1 overflow-hidden flex flex-col">
        <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
          <h3 className="font-medium">
            {t("ui.preview") || "Preview"}: {file?.name}
          </h3>
          <div className="flex items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRotateSelected("counterclockwise")}
              disabled={selectedPages.length === 0}
              className="mr-2"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              {t("rotatePdf.form.counterClockwise90") || "Rotate Left"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRotateSelected("clockwise")}
              disabled={selectedPages.length === 0}
            >
              <RotateCw className="h-4 w-4 mr-1" />
              {t("rotatePdf.form.clockwise90") || "Rotate Right"}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-muted/10 flex items-center justify-center p-6 min-h-[500px]">
          {isPagesLoading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="shadow-lg">
              <Document
                file={fileUrl}
                onLoadSuccess={handleDocumentLoadSuccess}
                onLoadStart={() => setIsPagesLoading(true)}
                loading={<Loader2 className="h-8 w-8 animate-spin" />}
                error={
                  <div className="text-center p-4">
                    <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <p>
                      {t("rotatePdf.errors.loadFailed") ||
                        "Failed to load PDF. Please try a different file."}
                    </p>
                  </div>
                }
              >
                {numPages > 0 && (
                  <div className="relative">
                    <Page
                      pageNumber={currentPage}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      width={500}
                      rotate={
                        pageRotations.find((r) => r.pageNumber === currentPage)
                          ?.angle || 0
                      }
                    />
                    {/* Selection indicator */}
                    {selectedPages.includes(currentPage) && (
                      <div className="absolute inset-0 border-4 border-primary/50"></div>
                    )}

                    {/* Page rotation controls */}
                    <div className="absolute top-2 right-2 bg-background/80 p-1 rounded-md shadow-sm flex">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          handleRotatePage(currentPage, "counterclockwise")
                        }
                        title={
                          t("rotatePdf.form.counterClockwise90") ||
                          "90° Counterclockwise"
                        }
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          handleRotatePage(currentPage, "clockwise")
                        }
                        title={
                          t("rotatePdf.form.clockwise90") || "90° Clockwise"
                        }
                      >
                        <RotateCw className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Selection checkbox */}
                    <div className="absolute top-2 left-2 bg-background/80 p-1 rounded-md shadow-sm">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`select-page-${currentPage}`}
                          checked={selectedPages.includes(currentPage)}
                          onCheckedChange={() => handlePageSelect(currentPage)}
                        />
                        <Label
                          htmlFor={`select-page-${currentPage}`}
                          className="text-xs"
                        >
                          {t("rotatePdf.form.selectThisPage") || "Select"}
                        </Label>
                      </div>
                    </div>
                  </div>
                )}
              </Document>
            </div>
          )}
        </div>

        {/* Page navigation */}
        <div className="p-3 border-t bg-muted/30 flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t("ui.previous") || "Previous"}
          </Button>

          <span className="text-sm">
            {`Page ${currentPage} of ${numPages}`}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, numPages))
            }
            disabled={currentPage === numPages}
          >
            {t("ui.next") || "Next"}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
      {(isUploading || isProcessing) && (
        <UploadProgress
          progress={progress}
          isUploading={isUploading}
          isProcessing={isProcessing}
          processingProgress={progress}
          error={uploadError}
          label={
            isUploading ? t("watermarkPdf.uploading") : t("splitPdf.splitting")
          }
          uploadStats={uploadStats}
        />
      )}
      <div className="mt-4 flex justify-center">
        <Button variant="outline" className="mr-2" onClick={handleReset}>
          <Trash className="h-4 w-4 mr-2" />
          {t("rotatePdf.form.reset") || "Reset"}
        </Button>
        <Button
          onClick={handleProcessPdf}
          disabled={isProcessing || pageRotations.every((r) => r.angle === 0)}
        >
          <RotateCw className="h-4 w-4 mr-2" />
          {t("rotatePdf.form.apply") || "Rotate PDF"}
        </Button>
      </div>
    </div>
  );

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RotateCw className="h-5 w-5 text-primary" />
          {t("rotatePdf.title") || "Rotate PDF Pages"}
        </CardTitle>
        <CardDescription>
          {t("rotatePdf.description") ||
            "Easily rotate pages in your PDF document to the correct orientation."}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {!file && renderUploadSection()}
        {file && isProcessing && renderProcessingSection()}
        {file && !isProcessing && processedFileUrl && renderSuccessSection()}
        {file && !isProcessing && !processedFileUrl && renderEditorSection()}
      </CardContent>

      <CardFooter className="border-t px-6 py-4">
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>
            {t("ui.filesSecurity") ||
              "Your files are processed securely. All uploads are automatically deleted after processing to ensure privacy."}
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
