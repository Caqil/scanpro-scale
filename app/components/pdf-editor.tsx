"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileIcon,
  Cross2Icon,
  CheckCircledIcon,
  DownloadIcon,
  Pencil1Icon,
  ResetIcon,
} from "@radix-ui/react-icons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Save } from "lucide-react";
import { useLanguageStore } from "@/src/store/store";
import { UploadProgress } from "@/components/ui/upload-progress";
import { FileDropzone } from "./dropzone";
import useFileUpload from "@/hooks/useFileUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VisualTextBlockEditor } from "./text-block-editor";

interface TextBlock {
  text: string;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  font: string;
  size: number;
  color: number;
}

interface PDFPage {
  page_number: number;
  width: number;
  height: number;
  texts: TextBlock[];
}

interface PDFTextData {
  pages: PDFPage[];
}

export function PdfTextEditor() {
  const { t } = useLanguageStore();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<PDFTextData | null>(null);
  const [originalData, setOriginalData] = useState<PDFTextData | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [editedFileUrl, setEditedFileUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedTextBlock, setSelectedTextBlock] = useState<number | null>(
    null
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const {
    progress: uploadProgress,
    error: uploadError,
    uploadFile,
    resetUpload,
    uploadStats,
  } = useFileUpload();

  // Format file size for display
  const formatFileSize = (sizeInBytes: number): string => {
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`;
    } else if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(2)} KB`;
    } else {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
    }
  };

  // Reset everything to start over
  const handleStartOver = () => {
    setFile(null);
    setExtractedData(null);
    setOriginalData(null);
    setSessionId(null);
    setEditedFileUrl(null);
    setError(null);
    setCurrentPage(0);
    setSelectedTextBlock(null);
    setHasUnsavedChanges(false);
    setIsProcessing(false);
    setIsUploading(false);
    setProgress(0);
    resetUpload();
  };

  // Automatically extract text when PDF is uploaded
  const handleFileUpload = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const pdfFile = acceptedFiles[0];
    setFile(pdfFile);
    setError(null);
    setEditedFileUrl(null);
    resetUpload();

    // Start automatic extraction
    setIsProcessing(true);
    setIsUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", pdfFile);

    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/pdf/extract-text`;

    try {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", apiUrl);
      xhr.setRequestHeader(
        "x-api-key",
        "sk_d6c1daa54dbc95956b281fa02c544e7273ed10df60b211fe"
      );

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 50; // Upload is 50% of total
          setProgress(percentComplete);
        }
      };

      xhr.onload = function () {
        setIsUploading(false);

        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText);

          // Simulate processing progress
          const processingInterval = setInterval(() => {
            setProgress((prev) => {
              if (prev >= 100) {
                clearInterval(processingInterval);
                setIsProcessing(false);

                // Set the extracted data
                setExtractedData(data.extractedData);
                setOriginalData(data.extractedData); // Keep original for reset
                setSessionId(data.sessionId);

                toast.success(
                  t("pdfTextEditor.extractSuccess") ||
                    "Text extracted successfully",
                  {
                    description:
                      t("pdfTextEditor.readyToEdit") ||
                      "Your PDF is ready for editing",
                  }
                );

                return 100;
              }
              return prev + 2;
            });
          }, 50);
        } else {
          setIsProcessing(false);
          setProgress(0);

          try {
            const errorData = JSON.parse(xhr.responseText);
            setError(errorData.error);
            toast.error(
              t("pdfTextEditor.extractFailed") || "Text extraction failed",
              {
                description: errorData.error,
              }
            );
          } catch (e) {
            setError(
              t("pdfTextEditor.unknownError") || "Unknown error occurred"
            );
            toast.error(
              t("pdfTextEditor.extractFailed") || "Text extraction failed"
            );
          }
        }
      };

      xhr.onerror = function () {
        setIsUploading(false);
        setIsProcessing(false);
        setProgress(0);
        setError(t("pdfTextEditor.networkError") || "Network error occurred");
        toast.error(
          t("pdfTextEditor.networkError") || "Network error occurred"
        );
      };

      xhr.send(formData);
    } catch (err) {
      setIsUploading(false);
      setIsProcessing(false);
      setProgress(0);
      setError(t("pdfTextEditor.unknownError") || "Unknown error occurred");
      toast.error(t("pdfTextEditor.extractFailed") || "Text extraction failed");
    }
  };

  // Save edited PDF
  const handleSaveEditedPDF = async () => {
    if (!extractedData || !sessionId) {
      toast.error(t("pdfTextEditor.noDataToSave") || "No data to save");
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("sessionId", sessionId);
    formData.append("editedData", JSON.stringify(extractedData));

    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/pdf/save-edited-text`;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "x-api-key": "sk_d6c1daa54dbc95956b281fa02c544e7273ed10df60b211fe",
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setProgress(100);
        setEditedFileUrl(data.filename);
        setHasUnsavedChanges(false);
        setIsProcessing(false);

        toast.success(
          t("pdfTextEditor.saveSuccess") || "PDF saved successfully",
          {
            description: data.message,
          }
        );
      } else {
        setIsProcessing(false);
        setProgress(0);
        setError(data.error);
        toast.error(t("pdfTextEditor.saveFailed") || "Save failed", {
          description: data.error,
        });
      }
    } catch (err) {
      setIsProcessing(false);
      setProgress(0);
      setError(t("pdfTextEditor.unknownError") || "Unknown error occurred");
      toast.error(t("pdfTextEditor.saveFailed") || "Save failed");
    }
  };

  // Update text block
  const updateTextBlock = useCallback(
    (pageIndex: number, textIndex: number, newText: string) => {
      if (!extractedData) return;

      const newData = { ...extractedData };
      newData.pages[pageIndex].texts[textIndex].text = newText;
      setExtractedData(newData);
      setHasUnsavedChanges(true);
    },
    [extractedData]
  );

  // Reset to original
  const handleReset = () => {
    if (originalData) {
      setExtractedData({ ...originalData });
      setHasUnsavedChanges(false);
      setSelectedTextBlock(null);
      toast.success(t("pdfTextEditor.resetSuccess") || "Reset to original");
    }
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pencil1Icon className="h-5 w-5" />
          {t("pdfTextEditor.title") || "PDF Text Editor"}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* File Upload Section - Only show when no extracted data */}
        {!extractedData && !isProcessing && (
          <div className="space-y-4">
            <FileDropzone
              multiple={false}
              maxFiles={1}
              acceptedFileTypes={{ "application/pdf": [".pdf"] }}
              disabled={isProcessing}
              onFileAccepted={handleFileUpload}
              title={
                t("pdfTextEditor.dragAndDrop") || "Drag & drop your PDF file"
              }
              description={`${
                t("pdfTextEditor.dropHereDesc") ||
                "Drop your PDF file here or click to browse. Text will be extracted automatically."
              } ${t("fileUploader.maxSize") || "Maximum size is 50MB."}`}
              browseButtonText={t("fileUploader.browse") || "Browse Files"}
              browseButtonVariant="default"
              securityText={
                t("fileUploader.filesSecurity") ||
                "Your files are processed securely."
              }
            />
          </div>
        )}

        {/* Processing Section */}
        {(isUploading || isProcessing) && (
          <div className="space-y-4">
            {/* File info during processing */}
            {file && (
              <div className="border rounded-lg p-3 flex items-center gap-4">
                <div className="h-9 w-9 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <FileIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)} •{" "}
                    {t("pdfTextEditor.extractingText") || "Extracting text..."}
                  </p>
                </div>
              </div>
            )}

            <UploadProgress
              progress={progress}
              isUploading={isUploading}
              isProcessing={isProcessing}
              processingProgress={progress}
              error={uploadError}
              label={
                isUploading
                  ? t("pdfTextEditor.uploading") || "Uploading..."
                  : t("pdfTextEditor.extractingText") || "Extracting text..."
              }
              uploadStats={uploadStats}
            />
          </div>
        )}

        {/* Error message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={handleStartOver}>
                {t("pdfTextEditor.tryAgain") || "Try Again"}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Text Editor Interface */}
        {extractedData && (
          <div className="space-y-4">
            {/* Action Bar */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  📄 {extractedData.pages.length}{" "}
                  {t("pdfTextEditor.pages") || "pages"}
                </span>
                {file && (
                  <span className="text-sm text-muted-foreground">
                    {file.name} • {formatFileSize(file.size)}
                  </span>
                )}
                {hasUnsavedChanges && (
                  <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                    ● {t("pdfTextEditor.unsavedChanges") || "Unsaved Changes"}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  disabled={isProcessing || !hasUnsavedChanges}
                >
                  <ResetIcon className="h-4 w-4 mr-2" />
                  {t("pdfTextEditor.reset") || "Reset"}
                </Button>
                <Button
                  onClick={handleSaveEditedPDF}
                  disabled={isProcessing || !hasUnsavedChanges}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {t("pdfTextEditor.savePDF") || "Save PDF"}
                </Button>
                <Button variant="outline" size="sm" onClick={handleStartOver}>
                  <Cross2Icon className="h-4 w-4 mr-2" />
                  {t("pdfTextEditor.startOver") || "New PDF"}
                </Button>
              </div>
            </div>

            {/* Editing Instructions */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Pencil1Icon className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                    {t("pdfTextEditor.howToEdit") || "How to Edit Text"}
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {t("pdfTextEditor.editInstructions") ||
                      "Use the Visual Editor to see your text positioned on the page, or the List Editor to edit text in an organized list. Click any text block to select and edit it."}
                  </p>
                </div>
              </div>
            </div>

            {/* Page Navigation */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {t("pdfTextEditor.editingPage") || "Editing Page"}{" "}
                {currentPage + 1} of {extractedData.pages.length}
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                >
                  ← {t("pdfTextEditor.previousPage") || "Previous"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage(
                      Math.min(extractedData.pages.length - 1, currentPage + 1)
                    )
                  }
                  disabled={currentPage === extractedData.pages.length - 1}
                >
                  {t("pdfTextEditor.nextPage") || "Next"} →
                </Button>
              </div>
            </div>

            {/* Current Page Editor */}
            {extractedData.pages[currentPage] && (
              <div className="space-y-6">
                {/* Editor Mode Tabs */}
                <Tabs defaultValue="visual" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="visual">
                      🎯 {t("pdfTextEditor.visualEditor") || "Visual Editor"}
                    </TabsTrigger>
                    <TabsTrigger value="list">
                      📝 {t("pdfTextEditor.listEditor") || "List Editor"}
                    </TabsTrigger>
                  </TabsList>

                  {/* Visual Editor Tab */}
                  <TabsContent value="visual" className="space-y-4">
                    <VisualTextBlockEditor
                      textBlocks={extractedData.pages[currentPage].texts}
                      pageWidth={extractedData.pages[currentPage].width}
                      pageHeight={extractedData.pages[currentPage].height}
                      onTextBlockUpdate={(index, updatedBlock) => {
                        const newData = { ...extractedData };
                        newData.pages[currentPage].texts[index] = updatedBlock;
                        setExtractedData(newData);
                        setHasUnsavedChanges(true);
                      }}
                    />
                  </TabsContent>

                  {/* List Editor Tab */}
                  <TabsContent value="list" className="space-y-4">
                    <div className="border rounded-lg">
                      {/* Page Header */}
                      <div className="p-4 border-b bg-muted/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">
                              {t("pdfTextEditor.page") || "Page"}{" "}
                              {extractedData.pages[currentPage].page_number}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {extractedData.pages[currentPage].texts.length}{" "}
                              {t("pdfTextEditor.textBlocks") || "text blocks"} •
                              {Math.round(
                                extractedData.pages[currentPage].width
                              )}{" "}
                              ×{" "}
                              {Math.round(
                                extractedData.pages[currentPage].height
                              )}{" "}
                              px
                            </p>
                          </div>
                          {selectedTextBlock !== null && (
                            <div className="text-sm text-blue-600 dark:text-blue-400">
                              {t("pdfTextEditor.editingBlock") ||
                                "Editing block"}{" "}
                              {selectedTextBlock + 1}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Text Blocks List */}
                      <div className="p-4">
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {extractedData.pages[currentPage].texts.map(
                            (textBlock, textIndex) => (
                              <div
                                key={textIndex}
                                className={`group border rounded-lg transition-all duration-200 ${
                                  selectedTextBlock === textIndex
                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md"
                                    : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                                }`}
                              >
                                {/* Text Block Header */}
                                <div
                                  className="p-3 cursor-pointer"
                                  onClick={() =>
                                    setSelectedTextBlock(
                                      selectedTextBlock === textIndex
                                        ? null
                                        : textIndex
                                    )
                                  }
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <div
                                        className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${
                                          selectedTextBlock === textIndex
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-300 text-gray-600"
                                        }`}
                                      >
                                        {textIndex + 1}
                                      </div>
                                      <span className="text-sm font-medium">
                                        {textBlock.font} •{" "}
                                        {Math.round(textBlock.size)}px
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        ({Math.round(textBlock.x0)},{" "}
                                        {Math.round(textBlock.y0)})
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {selectedTextBlock === textIndex && (
                                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                          {t("pdfTextEditor.editing") ||
                                            "Editing"}
                                        </span>
                                      )}
                                      <Pencil1Icon
                                        className={`h-4 w-4 ${
                                          selectedTextBlock === textIndex
                                            ? "text-blue-600"
                                            : "text-gray-400"
                                        }`}
                                      />
                                    </div>
                                  </div>

                                  {/* Preview of original text when not editing */}
                                  {selectedTextBlock !== textIndex && (
                                    <div className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                      "{textBlock.text}"
                                    </div>
                                  )}
                                </div>

                                {/* Editable Text Area (shown when selected) */}
                                {selectedTextBlock === textIndex && (
                                  <div className="px-3 pb-3">
                                    <div className="space-y-2">
                                      <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                        {t("pdfTextEditor.editTextContent") ||
                                          "Edit Text Content:"}
                                      </label>
                                      <textarea
                                        className="w-full p-3 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={textBlock.text}
                                        onChange={(e) =>
                                          updateTextBlock(
                                            currentPage,
                                            textIndex,
                                            e.target.value
                                          )
                                        }
                                        rows={Math.max(
                                          2,
                                          Math.ceil(textBlock.text.length / 60)
                                        )}
                                        placeholder={
                                          t("pdfTextEditor.editText") ||
                                          "Edit text..."
                                        }
                                        autoFocus
                                      />
                                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>
                                          {textBlock.text.length} characters
                                        </span>
                                        <span>
                                          {t("pdfTextEditor.clickToClose") ||
                                            "Click header to close"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          )}
                        </div>

                        {/* No text blocks message */}
                        {extractedData.pages[currentPage].texts.length ===
                          0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            <FileIcon className="h-8 w-8 mx-auto mb-2" />
                            <p>
                              {t("pdfTextEditor.noTextBlocks") ||
                                "No text blocks found on this page"}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* Quick Page Navigation */}
            {extractedData.pages.length > 1 && (
              <div className="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium mr-2">
                  {t("pdfTextEditor.quickJump") || "Quick jump to page"}:
                </span>
                {extractedData.pages.map((_, index) => (
                  <Button
                    key={index}
                    variant={currentPage === index ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(index)}
                    className="w-10 h-8"
                  >
                    {index + 1}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Success Result */}
        {editedFileUrl && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/30">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <CheckCircledIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-green-600 dark:text-green-400">
                  {t("pdfTextEditor.saveSuccess") || "PDF Saved Successfully"}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 mb-3">
                  {t("pdfTextEditor.saveSuccessDesc") ||
                    "Your edited PDF has been generated and is ready for download."}
                </p>
                <div className="flex gap-2">
                  <Button
                    className="w-full sm:w-auto"
                    asChild
                    variant="default"
                  >
                    <a
                      href={`${
                        process.env.NEXT_PUBLIC_API_URL
                      }/api/file?folder=edited&filename=${encodeURIComponent(
                        editedFileUrl
                      )}`}
                      download
                    >
                      <DownloadIcon className="h-4 w-4 mr-2" />
                      {t("pdfTextEditor.downloadEdited") ||
                        "Download Edited PDF"}
                    </a>
                  </Button>
                  <Button variant="outline" onClick={handleStartOver}>
                    {t("pdfTextEditor.editAnother") || "Edit Another PDF"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
