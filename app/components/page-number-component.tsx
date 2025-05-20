"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  ArrowDownIcon,
  CheckIcon,
  FileTextIcon,
  DownloadIcon,
  XIcon,
  RefreshCwIcon,
  EyeIcon,
} from "lucide-react";
import { useLanguageStore } from "@/src/store/store";
import { FileDropzone } from "@/components/dropzone";

export function PdfPageNumberer() {
  const { t } = useLanguageStore();

  // File state
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [numberedPdfUrl, setNumberedPdfUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [numberedPages, setNumberedPages] = useState<number>(0);

  // Get format from URL if provided
  const [initialFormat, setInitialFormat] = useState<string>("numeric");

  // Page numbering options
  const [options, setOptions] = useState({
    format: "numeric",
    position: "bottom-center",
    fontFamily: "Helvetica",
    fontSize: 12,
    color: "#000000",
    startNumber: 1,
    prefix: "",
    suffix: "",
    marginX: 40,
    marginY: 30,
    selectedPages: "",
    skipFirstPage: false,
  });

  // Initialize from URL params on component mount
  useEffect(() => {
    // Get format from URL params if available
    const urlParams = new URLSearchParams(window.location.search);
    const format = urlParams.get("format");

    if (format && ["numeric", "roman", "alphabetic"].includes(format)) {
      setInitialFormat(format);
      setOptions((prev) => ({ ...prev, format }));
    }
  }, []);

  // Get the Go API URL from env
  const goApiUrl = process.env.NEXT_PUBLIC_API_URL || "";

  const handleOptionChange = (key: string, value: any) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  // Apply page numbering using Go API
  const applyPageNumbering = async () => {
    if (!file) {
      toast.error(
        t("pageNumber.messages.noFile") || "Please upload a PDF file first"
      );
      return;
    }

    setIsUploading(true);
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setTotalPages(0);
    setNumberedPages(0);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Add all options to the form data
      Object.entries(options).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      // Use the Go API URL instead of Next.js API
      const apiUrl = `${goApiUrl}/api/pdf/pagenumber`;
      console.log("Submitting to Go API URL:", apiUrl);

      // Create a new XHR request to track upload progress
      const xhr = new XMLHttpRequest();
      xhr.open("POST", apiUrl);

      // Add API key if available
      const apiKey =
        localStorage.getItem("apiKey") ||
        "sk_d6c1daa54dbc95956b281fa02c544e7273ed10df60b211fe";
      if (apiKey) {
        xhr.setRequestHeader("x-api-key", apiKey);
      }

      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          // Update progress for upload phase (0–50%)
          setProgress(percentComplete / 2);
        }
      };

      // Handle completion
      xhr.onload = function () {
        setIsUploading(false);

        if (xhr.status >= 200 && xhr.status < 300) {
          // Success - parse the response
          try {
            const response = JSON.parse(xhr.responseText);
            console.log("API response:", response);

            // Update progress to complete
            setProgress(100);
            setIsProcessing(false);

            // Set page count information
            if (response.totalPages) {
              setTotalPages(response.totalPages);
            }

            if (response.numberedPages) {
              setNumberedPages(response.numberedPages);
            }

            // Format file URL to include Go API base URL if needed
            const fileUrl = response.fileUrl.startsWith("/")
              ? `${goApiUrl}${response.fileUrl}`
              : response.fileUrl;

            setNumberedPdfUrl(fileUrl);

            toast.success(
              t("pageNumber.messages.success") ||
                "Page numbers added successfully!"
            );
          } catch (parseError) {
            console.error("Error parsing response:", parseError);
            setError("Error parsing server response");
            setIsProcessing(false);

            toast.error(
              t("pageNumber.messages.error") || "Error processing PDF"
            );
          }
        } else {
          // Error
          setIsProcessing(false);
          setProgress(0);

          try {
            const errorData = JSON.parse(xhr.responseText);
            setError(errorData.error || "Unknown error");

            toast.error(
              errorData.error ||
                t("pageNumber.messages.error") ||
                "Error adding page numbers"
            );
          } catch (e) {
            setError("Server error");
            toast.error(
              t("pageNumber.messages.error") || "Error adding page numbers"
            );
          }
        }
      };

      // Handle network errors
      xhr.onerror = function () {
        setIsUploading(false);
        setIsProcessing(false);
        setProgress(0);
        setError("Network error");

        toast.error(
          t("pageNumber.messages.networkError") ||
            "Network error. Please try again."
        );
      };

      // Send the request
      xhr.send(formData);
    } catch (error) {
      console.error("Error adding page numbers:", error);
      setIsUploading(false);
      setIsProcessing(false);
      setProgress(0);
      setError(error instanceof Error ? error.message : "Unknown error");

      toast.error(
        t("pageNumber.messages.error") || "Error adding page numbers"
      );
    }
  };

  // Reset form
  const resetForm = () => {
    setFile(null);
    setNumberedPdfUrl("");
    setError(null);
    setProgress(0);
    setIsUploading(false);
    setIsProcessing(false);
    setTotalPages(0);
    setNumberedPages(0);
  };

  // Check if form is being submitted
  const isSubmitting = isUploading || isProcessing;

  // Format preview label
  const getFormatPreview = () => {
    let formattedNumber = "";

    switch (options.format) {
      case "roman":
        formattedNumber = "IV"; // Example roman numeral
        break;
      case "alphabetic":
        formattedNumber = "D"; // Example alphabetic character
        break;
      case "numeric":
      default:
        formattedNumber = "4"; // Example number
    }

    return `${options.prefix}${formattedNumber}${options.suffix}`;
  };

  return (
    <div className="w-full">
      {!numberedPdfUrl ? (
        <Card className="w-full border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <EyeIcon className="h-5 w-5 text-primary" />
              {t("pageNumber.title") || "Add Page Numbers to PDF"}
            </CardTitle>
            <CardDescription>
              {t("pageNumber.description") ||
                "Add customizable page numbers to your PDF document"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!file ? (
              // File Upload Section
              <FileDropzone
                onFileAccepted={(files) => {
                  if (files.length > 0) {
                    setFile(files[0]);
                    setNumberedPdfUrl("");
                    setError(null);
                  }
                }}
                acceptedFileTypes={{ "application/pdf": [".pdf"] }}
                maxSize={15 * 1024 * 1024} // 15MB
                title={t("pageNumber.uploadTitle") || "Upload Your PDF"}
                description={
                  t("pageNumber.uploadDesc") ||
                  "Upload a PDF file to add page numbers. Your file will be processed securely."
                }
                browseButtonText={t("pageNumber.ui.browse") || "Browse Files"}
                securityText={
                  t("pageNumber.ui.filesSecurity") ||
                  "Your files are secure and never stored permanently"
                }
              />
            ) : (
              // Options Section
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileTextIcon className="h-10 w-10 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={resetForm}
                    disabled={isSubmitting}
                  >
                    <XIcon className="h-5 w-5" />
                  </Button>
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md border border-red-200 dark:border-red-800">
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                {isSubmitting && (
                  <div className="w-full bg-muted rounded-full h-2 mb-4">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      {isUploading
                        ? t("pageNumber.ui.uploading") || "Uploading..."
                        : t("pageNumber.ui.processing") || "Processing..."}
                      {progress > 0 && ` (${Math.round(progress)}%)`}
                    </p>
                  </div>
                )}

                <div className="space-y-6 mt-6">
                  <h3 className="text-lg font-semibold">
                    {t("pageNumber.ui.settingsTitle") || "Page Number Settings"}
                  </h3>

                  {/* Number Format */}
                  <div className="space-y-2">
                    <Label>
                      {t("pageNumber.ui.numberFormat") || "Number Format"}
                    </Label>
                    <Tabs
                      defaultValue={options.format}
                      value={options.format}
                      onValueChange={(value) =>
                        handleOptionChange("format", value)
                      }
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="numeric">1, 2, 3...</TabsTrigger>
                        <TabsTrigger value="roman">I, II, III...</TabsTrigger>
                        <TabsTrigger value="alphabetic">A, B, C...</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {/* Position */}
                  <div className="space-y-2">
                    <Label>{t("pageNumber.ui.position") || "Position"}</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        type="button"
                        variant={
                          options.position === "top-left"
                            ? "default"
                            : "outline"
                        }
                        className="h-20 flex-col gap-1"
                        onClick={() =>
                          handleOptionChange("position", "top-left")
                        }
                        disabled={isSubmitting}
                      >
                        <div className="w-5 h-5 border rounded flex items-center justify-center">
                          <span className="text-[8px]">1</span>
                        </div>
                        <span className="text-xs">
                          {t("pageNumber.ui.topLeft") || "Top Left"}
                        </span>
                      </Button>
                      <Button
                        type="button"
                        variant={
                          options.position === "top-center"
                            ? "default"
                            : "outline"
                        }
                        className="h-20 flex-col gap-1"
                        onClick={() =>
                          handleOptionChange("position", "top-center")
                        }
                        disabled={isSubmitting}
                      >
                        <div className="w-5 h-5 border rounded flex items-center justify-center">
                          <span className="text-[8px]">1</span>
                        </div>
                        <span className="text-xs">
                          {t("pageNumber.ui.topCenter") || "Top Center"}
                        </span>
                      </Button>
                      <Button
                        type="button"
                        variant={
                          options.position === "top-right"
                            ? "default"
                            : "outline"
                        }
                        className="h-20 flex-col gap-1"
                        onClick={() =>
                          handleOptionChange("position", "top-right")
                        }
                        disabled={isSubmitting}
                      >
                        <div className="w-5 h-5 border rounded flex items-center justify-center">
                          <span className="text-[8px]">1</span>
                        </div>
                        <span className="text-xs">
                          {t("pageNumber.ui.topRight") || "Top Right"}
                        </span>
                      </Button>
                      <Button
                        type="button"
                        variant={
                          options.position === "bottom-left"
                            ? "default"
                            : "outline"
                        }
                        className="h-20 flex-col gap-1"
                        onClick={() =>
                          handleOptionChange("position", "bottom-left")
                        }
                        disabled={isSubmitting}
                      >
                        <div className="w-5 h-5 border rounded flex items-center justify-center">
                          <span className="text-[8px]">1</span>
                        </div>
                        <span className="text-xs">
                          {t("pageNumber.ui.bottomLeft") || "Bottom Left"}
                        </span>
                      </Button>
                      <Button
                        type="button"
                        variant={
                          options.position === "bottom-center"
                            ? "default"
                            : "outline"
                        }
                        className="h-20 flex-col gap-1"
                        onClick={() =>
                          handleOptionChange("position", "bottom-center")
                        }
                        disabled={isSubmitting}
                      >
                        <div className="w-5 h-5 border rounded flex items-center justify-center">
                          <span className="text-[8px]">1</span>
                        </div>
                        <span className="text-xs">
                          {t("pageNumber.ui.bottomCenter") || "Bottom Center"}
                        </span>
                      </Button>
                      <Button
                        type="button"
                        variant={
                          options.position === "bottom-right"
                            ? "default"
                            : "outline"
                        }
                        className="h-20 flex-col gap-1"
                        onClick={() =>
                          handleOptionChange("position", "bottom-right")
                        }
                        disabled={isSubmitting}
                      >
                        <div className="w-5 h-5 border rounded flex items-center justify-center">
                          <span className="text-[8px]">1</span>
                        </div>
                        <span className="text-xs">
                          {t("pageNumber.ui.bottomRight") || "Bottom Right"}
                        </span>
                      </Button>
                    </div>
                  </div>

                  {/* Font Settings */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fontFamily">
                        {t("pageNumber.ui.fontFamily") || "Font Family"}
                      </Label>
                      <select
                        id="fontFamily"
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none"
                        value={options.fontFamily}
                        onChange={(e) =>
                          handleOptionChange("fontFamily", e.target.value)
                        }
                        disabled={isSubmitting}
                      >
                        <option value="Helvetica">Helvetica</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Courier">Courier</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fontSize">
                        {t("pageNumber.ui.fontSize") || "Font Size"}
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="fontSize"
                          type="number"
                          min="6"
                          max="72"
                          value={options.fontSize}
                          onChange={(e) =>
                            handleOptionChange(
                              "fontSize",
                              parseInt(e.target.value) || 12
                            )
                          }
                          className="w-full"
                          disabled={isSubmitting}
                        />
                        <span className="text-sm">pt</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="color">
                        {t("pageNumber.ui.color") || "Color"}
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="color"
                          type="color"
                          value={options.color}
                          onChange={(e) =>
                            handleOptionChange("color", e.target.value)
                          }
                          className="w-12 h-10 p-1"
                          disabled={isSubmitting}
                        />
                        <span className="text-sm">{options.color}</span>
                      </div>
                    </div>
                  </div>

                  {/* Number Customization */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startNumber">
                        {t("pageNumber.ui.startFrom") || "Start From"}
                      </Label>
                      <Input
                        id="startNumber"
                        type="number"
                        min="1"
                        value={options.startNumber}
                        onChange={(e) =>
                          handleOptionChange(
                            "startNumber",
                            parseInt(e.target.value) || 1
                          )
                        }
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prefix">
                        {t("pageNumber.ui.prefix") || "Prefix"}
                      </Label>
                      <Input
                        id="prefix"
                        type="text"
                        value={options.prefix}
                        onChange={(e) =>
                          handleOptionChange("prefix", e.target.value)
                        }
                        placeholder="e.g., 'Page '"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="suffix">
                        {t("pageNumber.ui.suffix") || "Suffix"}
                      </Label>
                      <Input
                        id="suffix"
                        type="text"
                        value={options.suffix}
                        onChange={(e) =>
                          handleOptionChange("suffix", e.target.value)
                        }
                        placeholder="e.g., ' of 10'"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Margins */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="marginX">
                        {t("pageNumber.ui.horizontalMargin") ||
                          "Horizontal Margin (px)"}
                      </Label>
                      <div className="pt-2 px-2">
                        <Slider
                          id="marginX"
                          min={10}
                          max={100}
                          step={1}
                          value={[options.marginX]}
                          onValueChange={(value) =>
                            handleOptionChange("marginX", value[0])
                          }
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="text-center text-sm">
                        {options.marginX}px
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="marginY">
                        {t("pageNumber.ui.verticalMargin") ||
                          "Vertical Margin (px)"}
                      </Label>
                      <div className="pt-2 px-2">
                        <Slider
                          id="marginY"
                          min={10}
                          max={100}
                          step={1}
                          value={[options.marginY]}
                          onValueChange={(value) =>
                            handleOptionChange("marginY", value[0])
                          }
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="text-center text-sm">
                        {options.marginY}px
                      </div>
                    </div>
                  </div>

                  {/* Page Selection Options */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="selectedPages">
                        {t("pageNumber.ui.pagesToNumber") || "Pages to Number"}
                      </Label>
                      <div className="text-sm text-muted-foreground">
                        (
                        {t("pageNumber.ui.pagesHint") ||
                          "Leave blank for all pages"}
                        )
                      </div>
                    </div>
                    <Input
                      id="selectedPages"
                      type="text"
                      value={options.selectedPages}
                      onChange={(e) =>
                        handleOptionChange("selectedPages", e.target.value)
                      }
                      placeholder="e.g., 1,3,5-10"
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-muted-foreground">
                      {t("pageNumber.ui.pagesExample") ||
                        "Use commas for individual pages and hyphens for ranges (e.g., 1,3,5-10)"}
                    </p>
                  </div>

                  {/* Skip First Page Option */}
                  <div className="flex items-center justify-between space-y-0 pb-2">
                    <Label htmlFor="skipFirstPage" className="cursor-pointer">
                      {t("pageNumber.ui.skipFirstPage") ||
                        "Skip first page (e.g., for cover pages)"}
                    </Label>
                    <Switch
                      id="skipFirstPage"
                      checked={options.skipFirstPage}
                      onCheckedChange={(checked) =>
                        handleOptionChange("skipFirstPage", checked)
                      }
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Preview */}
                  <div className="mt-6 border rounded-lg p-4 bg-muted/20">
                    <h4 className="text-sm font-medium mb-2">
                      {t("pageNumber.ui.preview") || "Preview:"}
                    </h4>
                    <div className="flex items-center justify-center bg-background p-4 rounded-lg border relative">
                      <div className="w-64 h-32 bg-white/50 dark:bg-gray-800/50 rounded border flex items-center justify-center relative">
                        {/* Simulate page number based on position */}
                        <div
                          className={`absolute text-sm px-1 py-0.5 rounded ${
                            options.position.includes("top")
                              ? "top-2"
                              : options.position.includes("bottom")
                              ? "bottom-2"
                              : "top-1/2 -translate-y-1/2"
                          } ${
                            options.position.includes("left")
                              ? "left-2"
                              : options.position.includes("right")
                              ? "right-2"
                              : options.position.includes("center")
                              ? "left-1/2 -translate-x-1/2"
                              : ""
                          }`}
                          style={{
                            fontFamily: options.fontFamily,
                            fontSize: `${options.fontSize * 0.8}px`,
                            color: options.color,
                          }}
                        >
                          {getFormatPreview()}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {t("pageNumber.ui.pagePreview") || "Page preview"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            {file && (
              <>
                <Button
                  variant="outline"
                  onClick={resetForm}
                  disabled={isSubmitting}
                >
                  <XIcon className="h-4 w-4 mr-2" />
                  {t("pageNumber.ui.cancel") || "Cancel"}
                </Button>
                <Button onClick={applyPageNumbering} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <RefreshCwIcon className="h-4 w-4 mr-2 animate-spin" />
                      {t("pageNumber.ui.processingProgress")?.replace(
                        "{progress}",
                        Math.round(progress).toString()
                      ) || `Processing... (${Math.round(progress)}%)`}
                    </>
                  ) : (
                    <>
                      <EyeIcon className="h-4 w-4 mr-2" />
                      {t("pageNumber.ui.addPageNumbers") || "Add Page Numbers"}
                    </>
                  )}
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      ) : (
        // Success Section
        <Card className="w-full border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckIcon className="h-5 w-5" />
              {t("pageNumber.ui.successTitle") ||
                "Page Numbers Added Successfully"}
            </CardTitle>
            <CardDescription>
              {t("pageNumber.ui.successDesc") ||
                "Your PDF has been processed and is ready to download"}
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col items-center justify-center text-center py-6">
            <div className="mb-6 p-4 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 mx-auto w-20 h-20 flex items-center justify-center">
              <CheckIcon className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {t("pageNumber.ui.readyMessage") || "Your PDF is ready!"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              {t("pageNumber.ui.readyDesc") ||
                "Your PDF file has been processed and page numbers have been added according to your settings."}
            </p>

            {/* Stats about the processed PDF */}
            {(totalPages > 0 || numberedPages > 0) && (
              <div className="bg-muted/30 rounded-lg p-4 mb-6 w-full max-w-xs">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {totalPages > 0 && (
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Total Pages</span>
                      <span className="font-medium text-lg">{totalPages}</span>
                    </div>
                  )}
                  {numberedPages > 0 && (
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">
                        Pages Numbered
                      </span>
                      <span className="font-medium text-lg">
                        {numberedPages}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <Button
              size="lg"
              className="px-8"
              onClick={() => {
                if (numberedPdfUrl) {
                  window.location.href = numberedPdfUrl;
                }
              }}
            >
              <DownloadIcon className="h-4 w-4 mr-2" />
              {t("pageNumber.ui.download") || "Download PDF"}
            </Button>
          </CardContent>

          <CardFooter className="flex justify-center border-t bg-muted/20 py-4">
            <Button variant="ghost" onClick={resetForm}>
              <ArrowDownIcon className="h-4 w-4 mr-2" />
              {t("pageNumber.ui.processAnother") || "Process Another PDF"}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
