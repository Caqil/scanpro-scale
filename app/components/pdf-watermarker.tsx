"use client";

import React, { useState, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useLanguageStore } from "@/src/store/store";
import {
  CheckIcon,
  LoaderIcon,
  DownloadIcon,
  RefreshCwIcon,
  FileTextIcon,
  XCircleIcon,
} from "lucide-react";
import { FileDropzone } from "./dropzone";
import { useAuth } from "@/src/context/auth-context";

// Interfaces for type safety
interface Position {
  value: string;
  label: string;
}

interface Alignment {
  value: string;
  label: string;
}

interface RenderMode {
  value: string;
  label: string;
}

// List of font names available in pdfcpu
const FONT_NAMES = ["Helvetica", "Courier", "Times", "Symbol", "ZapfDingbats"];

// Positions for anchoring watermarks
const POSITIONS = [
  { value: "c", label: "Center" },
  { value: "tl", label: "Top Left" },
  { value: "tc", label: "Top Center" },
  { value: "tr", label: "Top Right" },
  { value: "l", label: "Left" },
  { value: "r", label: "Right" },
  { value: "bl", label: "Bottom Left" },
  { value: "bc", label: "Bottom Center" },
  { value: "br", label: "Bottom Right" },
];

// Text alignment options
const TEXT_ALIGNMENTS = [
  { value: "l", label: "Left" },
  { value: "c", label: "Center" },
  { value: "r", label: "Right" },
  { value: "j", label: "Justified" },
];

// Render modes
const RENDER_MODES = [
  { value: "0", label: "Fill" },
  { value: "1", label: "Stroke" },
  { value: "2", label: "Fill & Stroke" },
];

export function WatermarkPDF() {
  const { t } = useLanguageStore();
  const { isAuthenticated } = useAuth();

  // Main file state
  const [file, setFile] = useState<File | null>(null);

  // Processing state
  const [processing, setProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [processedPdfUrl, setProcessedPdfUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [insufficientBalance, setInsufficientBalance] =
    useState<boolean>(false);

  // Watermark type and mode
  const [activeTab, setActiveTab] = useState<string>("text");

  // Watermark content
  const [textWatermark, setTextWatermark] = useState<string>("CONFIDENTIAL");
  const [svgWatermark, setSvgWatermark] = useState<string>("");

  // Page selection
  const [pageSelection, setPageSelection] = useState<string>("");

  // Common watermark parameters
  const [position, setPosition] = useState<string>("c");
  const [opacity, setOpacity] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [diagonal, setDiagonal] = useState<number>(0);
  const [scale, setScale] = useState<number>(50);
  const [useOffset, setUseOffset] = useState<boolean>(false);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);

  // Text-specific parameters
  const [fontName, setFontName] = useState<string>("Helvetica");
  const [fontSize, setFontSize] = useState<number>(24);
  const [fillColor, setFillColor] = useState<string>("#808080");
  const [strokeColor, setStrokeColor] = useState<string>("#808080");
  const [renderMode, setRenderMode] = useState<string>("0");
  const [textAlignment, setTextAlignment] = useState<string>("c");

  // Background and border parameters
  const [bgColor, setBgColor] = useState<string>("");
  const [useBgColor, setUseBgColor] = useState<boolean>(false);
  const [borderWidth, setBorderWidth] = useState<number>(0);
  const [roundedCorners, setRoundedCorners] = useState<boolean>(false);
  const [borderColor, setBorderColor] = useState<string>("#000000");
  const [margins, setMargins] = useState<string>("0");

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const svgPreviewRef = useRef<SVGSVGElement>(null);

  // Handle file upload
  const handleFileUpload = (acceptedFiles: File[]): void => {
    if (acceptedFiles.length > 0) {
      const uploadedFile = acceptedFiles[0];
      setFile(uploadedFile);
      setProcessedPdfUrl("");
      setError(null);
    }
  };

  // Handle SVG watermark upload
  const handleSvgWatermarkUpload = (acceptedFiles: File[]): void => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setSvgWatermark(result);
      };
      reader.onerror = () => {
        toast.error(
          t("watermarkPdf.messages.svgReadError") || "Failed to read SVG file"
        );
      };
      reader.readAsText(file);
    }
  };

  // Update SVG preview
  useEffect(() => {
    if (svgPreviewRef.current && activeTab === "svg") {
      const svg = svgPreviewRef.current;
      const watermarkGroup = svg.querySelector("#watermark-group");
      if (watermarkGroup && svgWatermark) {
        watermarkGroup.innerHTML = svgWatermark
          .replace(/<\?xml[^>]*\>/, "")
          .replace(/<!DOCTYPE[^>]*\>/, "");
      }
    }
  }, [svgWatermark, activeTab]);

  // Calculate SVG watermark position with A4 dimensions
  const getSvgTransform = (): string => {
    const pageWidth = 595; // A4 width in points
    const pageHeight = 842; // A4 height in points
    let x = 0;
    let y = 0;
    const scaleFactor = scale / 100;

    // Map position to coordinates (adjusted for A4)
    const posMap: { [key: string]: { x: number; y: number } } = {
      c: { x: pageWidth / 2, y: pageHeight / 2 },
      tl: { x: 10, y: 10 },
      tc: { x: pageWidth / 2, y: 10 },
      tr: { x: pageWidth - 10, y: 10 },
      l: { x: 10, y: pageHeight / 2 },
      r: { x: pageWidth - 10, y: pageHeight / 2 },
      bl: { x: 10, y: pageHeight - 10 },
      bc: { x: pageWidth / 2, y: pageHeight - 10 },
      br: { x: pageWidth - 10, y: pageHeight - 10 },
    };

    const pos = posMap[position] || posMap.c;
    x = pos.x + (useOffset ? offsetX : 0);
    y = pos.y + (useOffset ? offsetY : 0);

    let transform = `translate(${x}, ${y}) scale(${scaleFactor})`;
    if (diagonal === 1) {
      transform += ` rotate(45, ${x}, ${y})`;
    } else if (diagonal === 2) {
      transform += ` rotate(-45, ${x}, ${y})`;
    } else if (rotation !== 0) {
      transform += ` rotate(${rotation}, ${x}, ${y})`;
    }

    return transform;
  };

  // Build the watermark description string with improved validation
  const buildWatermarkDescription = (): string => {
    const parts: string[] = [];

    // Common parameters
    if (position !== "c") parts.push(`pos:${position}`);

    if (useOffset && (offsetX !== 0 || offsetY !== 0)) {
      parts.push(`off:${offsetX} ${offsetY}`);
    }

    if (scale !== 50) {
      const scaleValue = scale / 100;
      parts.push(`scale:${scaleValue.toFixed(2)}`);
    }

    if (opacity !== 100) {
      const opacityValue = opacity / 100;
      parts.push(`op:${opacityValue.toFixed(2)}`);
    }

    // Handle diagonal and rotation
    if (diagonal > 0) {
      parts.push(`d:${diagonal}`);
    } else if (rotation !== 0) {
      parts.push(`rot:${rotation}`);
    }

    // Text-specific parameters
    if (activeTab === "text") {
      if (fontName && !FONT_NAMES.includes(fontName)) {
        setFontName("Helvetica"); // Fallback to default if invalid
      }
      if (fontName !== "Helvetica") parts.push(`fontname:${fontName}`);

      if (fontSize < 8 || fontSize > 72) {
        setFontSize(24); // Clamp to valid range
      }
      if (fontSize !== 24) parts.push(`points:${fontSize}`);

      // Validate text alignment
      const validAlignments = ["l", "c", "r", "j"];
      if (!validAlignments.includes(textAlignment)) {
        setTextAlignment("c"); // Fallback to center
      }
      if (textAlignment !== "c") parts.push(`align:${textAlignment}`);

      if (fillColor !== "#808080") {
        const r = parseInt(fillColor.slice(1, 3), 16) / 255;
        const g = parseInt(fillColor.slice(3, 5), 16) / 255;
        const b = parseInt(fillColor.slice(5, 7), 16) / 255;
        parts.push(`fillc:${r.toFixed(2)} ${g.toFixed(2)} ${b.toFixed(2)}`);
      }

      if (strokeColor !== "#808080" && renderMode !== "0") {
        const r = parseInt(strokeColor.slice(1, 3), 16) / 255;
        const g = parseInt(strokeColor.slice(3, 5), 16) / 255;
        const b = parseInt(strokeColor.slice(5, 7), 16) / 255;
        parts.push(`strokec:${r.toFixed(2)} ${g.toFixed(2)} ${b.toFixed(2)}`);
      }

      if (renderMode !== "0" && !["0", "1", "2"].includes(renderMode)) {
        setRenderMode("0"); // Fallback to fill
      }
      if (renderMode !== "0") parts.push(`mo:${renderMode}`);

      if (useBgColor && bgColor) {
        const r = parseInt(bgColor.slice(1, 3), 16) / 255;
        const g = parseInt(bgColor.slice(3, 5), 16) / 255;
        const b = parseInt(bgColor.slice(5, 7), 16) / 255;
        parts.push(`bgcolor:${r.toFixed(2)} ${g.toFixed(2)} ${b.toFixed(2)}`);

        if (margins !== "0") parts.push(`ma:${margins}`);

        if (borderWidth > 0) {
          let borderStr = `bo:${borderWidth}`;
          if (roundedCorners) borderStr += " round";
          if (borderColor !== "#000000") {
            const r = parseInt(borderColor.slice(1, 3), 16) / 255;
            const g = parseInt(borderColor.slice(3, 5), 16) / 255;
            const b = parseInt(borderColor.slice(5, 7), 16) / 255;
            borderStr += ` ${r.toFixed(2)} ${g.toFixed(2)} ${b.toFixed(2)}`;
          }
          parts.push(borderStr);
        }
      }
    }

    return parts.join(", ");
  };

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        resolve(base64String.split(",")[1]);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Apply watermark to PDF
  const applyWatermark = async (): Promise<void> => {
    if (!file) {
      toast.error(
        t("watermarkPdf.messages.noFile") || "Please upload a PDF file"
      );
      return;
    }

    if (activeTab === "text" && !textWatermark.trim()) {
      toast.error(
        t("watermarkPdf.messages.noText") || "Please enter watermark text"
      );
      return;
    }

    if (activeTab === "svg" && !svgWatermark) {
      toast.error(
        t("watermarkPdf.messages.noSvg") || "Please upload an SVG watermark"
      );
      return;
    }

    // Validate page selection
    if (
      pageSelection &&
      !/^((\d+-\d+|\d+|even|odd)(,\s*(\d+-\d+|\d+|even|odd))*)?$/i.test(
        pageSelection
      )
    ) {
      toast.error(
        t("watermarkPdf.messages.invalidPageSelection") ||
          "Invalid page selection format"
      );
      return;
    }

    setProcessing(true);
    setProgress(0);
    setError(null);
    setInsufficientBalance(false);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("watermarkType", activeTab);

      const description = buildWatermarkDescription();
      formData.append("description", description);

      if (pageSelection) {
        formData.append("pageSelection", pageSelection);
      }

      if (activeTab === "text") {
        formData.append("content", textWatermark);
      } else if (activeTab === "svg" && svgWatermark) {
        const blob = new Blob([svgWatermark], { type: "image/svg+xml" });
        formData.append("content", blob, "watermark.svg");
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/pdf/watermark`;

      const xhr = new XMLHttpRequest();
      xhr.open("POST", apiUrl);
      if (isAuthenticated) {
        xhr.withCredentials = true;
      }

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setProgress(percentComplete / 2);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            setProgress(100);
            setProcessedPdfUrl(data.fileUrl);
            setProcessing(false);
            toast.success(
              t("watermarkPdf.messages.success") ||
                "Watermark applied successfully!"
            );
          } catch (parseError) {
            handleError("Failed to parse server response");
          }
        } else if (xhr.status === 402) {
          handleInsufficientBalanceError();
        } else {
          let errorMessage = "Operation failed";
          try {
            const errorData = JSON.parse(xhr.responseText);
            errorMessage = errorData.error || errorMessage;
          } catch (jsonError) {
            console.error("Failed to parse error response:", jsonError);
          }
          errorMessage = `${errorMessage} (Status: ${xhr.status})`;
          handleError(errorMessage);
        }
      };

      xhr.onerror = () => handleError("A network error occurred");
      xhr.send(formData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      handleError(errorMessage);
    }
  };

  const handleError = (message: string): void => {
    setError(message);
    setProgress(0);
    setProcessing(false);
    toast.error(t("watermarkPdf.messages.error") || "Operation Failed", {
      description: message,
    });
  };

  const handleInsufficientBalanceError = (): void => {
    setInsufficientBalance(true);
    setProgress(0);
    setProcessing(false);
    toast.error(t("common.insufficientBalance") || "Insufficient Balance", {
      description:
        t("common.insufficientBalanceDesc") ||
        "You don't have enough balance to perform this operation",
    });
  };

  const reset = (): void => {
    setFile(null);
    setProcessedPdfUrl("");
    setError(null);
    setInsufficientBalance(false);
    setSvgWatermark("");
    setTextWatermark("CONFIDENTIAL");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Render UI for insufficient balance
  if (insufficientBalance) {
    return (
      <div className="bg-muted/30 rounded-lg p-4 w-full">
        <div className="flex flex-col min-h-[600px] bg-background rounded-lg border shadow-sm">
          <div className="flex-1 flex items-center justify-center p-6">
            <Card className="w-full max-w-md">
              <CardContent className="p-8 text-center">
                <div className="mb-6 p-4 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 mx-auto w-20 h-20 flex items-center justify-center">
                  <XCircleIcon className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">
                  {t("common.insufficientBalance") || "Insufficient Balance"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {t("common.insufficientBalanceDesc") ||
                    "You don't have enough balance to perform this operation. Please add funds to your account."}
                </p>
                <div className="flex gap-4 justify-center">
                  <Button variant="outline" onClick={reset}>
                    <RefreshCwIcon className="h-4 w-4 mr-2" />
                    {t("ui.reupload") || "Start Over"}
                  </Button>
                  <Button
                    onClick={() =>
                      (window.location.href = "/dashboard/billing")
                    }
                  >
                    {t("common.addFunds") || "Add Funds"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Render UI for successful processing
  if (processedPdfUrl) {
    return (
      <div className="bg-muted/30 rounded-lg p-4 w-full">
        <div className="flex flex-col min-h-[600px] bg-background rounded-lg border shadow-sm">
          <div className="flex-1 flex items-center justify-center p-6">
            <Card className="w-full max-w-md">
              <CardContent className="p-8 text-center">
                <div className="mb-6 p-4 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 mx-auto w-20 h-20 flex items-center justify-center">
                  <CheckIcon className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">
                  {t("watermarkPdf.messages.success") ||
                    "Watermark Applied Successfully!"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {t("watermarkPdf.messages.downloadReady") ||
                    "Your watermarked PDF is now ready for download."}
                </p>
                <div className="flex gap-4 justify-center">
                  <Button variant="outline" onClick={reset}>
                    <RefreshCwIcon className="h-4 w-4 mr-2" />
                    {t("ui.reupload") || "Start Over"}
                  </Button>
                  <Button
                    onClick={() =>
                      window.open(
                        `${process.env.NEXT_PUBLIC_API_URL}${processedPdfUrl}`,
                        "_blank"
                      )
                    }
                  >
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    {t("ui.download") || "Download"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Render UI for processing
  if (processing) {
    return (
      <div className="bg-muted/30 rounded-lg p-4 w-full">
        <div className="flex flex-col min-h-[600px] bg-background rounded-lg border shadow-sm">
          <div className="flex-1 flex items-center justify-center p-6">
            <Card className="w-full max-w-md">
              <CardContent className="p-8 text-center">
                <div className="mb-6 p-4 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 mx-auto w-20 h-20 flex items-center justify-center">
                  <LoaderIcon className="h-10 w-10 animate-spin" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">
                  {t("watermarkPdf.processing") || "Processing PDF..."}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {t("watermarkPdf.messages.processing") ||
                    "Please wait while we apply the watermark to your PDF."}
                </p>
                <Progress value={progress} className="w-full h-2" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Main UI for watermark configuration
  return (
    <div className="bg-muted/30 rounded-lg p-4 w-full">
      <div className="flex flex-col min-h-[600px] bg-background rounded-lg border shadow-sm">
        {!file ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <FileDropzone
              multiple={false}
              maxFiles={1}
              acceptedFileTypes={{ "application/pdf": [".pdf"] }}
              disabled={processing}
              onFileAccepted={handleFileUpload}
              title={t("watermarkPdf.uploadTitle") || "Upload Your PDF"}
              description={
                t("watermarkPdf.uploadDesc") ||
                "Upload a PDF file to add a watermark"
              }
              browseButtonText={t("ui.browse") || "Browse Files"}
              browseButtonVariant="default"
              securityText={
                t("ui.filesSecurity") ||
                "Your files are secure and never stored permanently"
              }
            />
          </div>
        ) : (
          <div className="flex-1 p-6 flex flex-col md:flex-row gap-6">
            {/* Configuration Panel */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-semibold">
                    {t("watermarkPdf.configureWatermark") ||
                      "Configure Watermark"}
                  </h2>
                  <p className="text-muted-foreground">
                    {t("watermarkPdf.configureWatermarkDesc") ||
                      "Select the type of watermark and customize its appearance"}
                  </p>
                </div>
                <Button variant="outline" onClick={reset}>
                  <RefreshCwIcon className="h-4 w-4 mr-2" />
                  {t("ui.reupload") || "Upload Different File"}
                </Button>
              </div>

              <Tabs
                defaultValue="text"
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-6"
              >
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="text" className="flex items-center gap-2">
                    <FileTextIcon className="h-4 w-4" />
                    {t("watermarkPdf.types.text.title") || "Text Watermark"}
                  </TabsTrigger>
                  <TabsTrigger value="svg" className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                      <polyline points="13 2 13 9 20 9" />
                    </svg>
                    {t("watermarkPdf.types.svg.title") || "SVG Watermark"}
                  </TabsTrigger>
                </TabsList>

                {/* Text Watermark Tab */}
                <TabsContent value="text" className="space-y-6">
                  <div>
                    <Label htmlFor="textWatermark">
                      {t("watermarkPdf.text") || "Watermark Text"}
                    </Label>
                    <Textarea
                      id="textWatermark"
                      placeholder={
                        t("watermarkPdf.textPlaceholder") ||
                        "Enter text for the watermark"
                      }
                      value={textWatermark}
                      onChange={(e) => setTextWatermark(e.target.value)}
                      className="mt-1"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="fontName">
                          {t("watermarkPdf.fontName") || "Font Name"}
                        </Label>
                        <Select value={fontName} onValueChange={setFontName}>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                t("watermarkPdf.selectFont") || "Select Font"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {FONT_NAMES.map((font) => (
                              <SelectItem key={font} value={font}>
                                {font}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="fontSize">
                          {t("watermarkPdf.fontSize") || "Font Size"} (
                          {fontSize})
                        </Label>
                        <Slider
                          id="fontSize"
                          min={8}
                          max={72}
                          step={1}
                          value={[fontSize]}
                          onValueChange={(values) => setFontSize(values[0])}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="textAlignment">
                          {t("watermarkPdf.textAlignment") || "Text Alignment"}
                        </Label>
                        <Select
                          value={textAlignment}
                          onValueChange={setTextAlignment}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                t("watermarkPdf.selectAlignment") ||
                                "Select Alignment"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {TEXT_ALIGNMENTS.map((alignment) => (
                              <SelectItem
                                key={alignment.value}
                                value={alignment.value}
                              >
                                {alignment.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="renderMode">
                          {t("watermarkPdf.renderMode") || "Render Mode"}
                        </Label>
                        <Select
                          value={renderMode}
                          onValueChange={setRenderMode}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                t("watermarkPdf.selectRenderMode") ||
                                "Select Mode"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {RENDER_MODES.map((mode) => (
                              <SelectItem key={mode.value} value={mode.value}>
                                {mode.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="fillColor">
                            {t("watermarkPdf.fillColor") || "Fill Color"}
                          </Label>
                          <div className="flex items-center mt-1 gap-2">
                            <div
                              className="w-6 h-6 rounded-full border"
                              style={{ backgroundColor: fillColor }}
                            />
                            <Input
                              id="fillColor"
                              type="color"
                              value={fillColor}
                              onChange={(e) => setFillColor(e.target.value)}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="strokeColor">
                            {t("watermarkPdf.strokeColor") || "Stroke Color"}
                          </Label>
                          <div className="flex items-center mt-1 gap-2">
                            <div
                              className="w-6 h-6 rounded-full border"
                              style={{ backgroundColor: strokeColor }}
                            />
                            <Input
                              id="strokeColor"
                              type="color"
                              value={strokeColor}
                              onChange={(e) => setStrokeColor(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="bgColor">
                          {t("watermarkPdf.bgColor") || "Background Color"}
                        </Label>
                        <div className="flex items-center mt-1 gap-2">
                          <Switch
                            id="useBgColor"
                            checked={useBgColor}
                            onCheckedChange={setUseBgColor}
                          />
                          <div className="flex-1 flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-full border"
                              style={{
                                backgroundColor: useBgColor
                                  ? bgColor
                                  : "transparent",
                              }}
                            />
                            <Input
                              id="bgColor"
                              type="color"
                              value={bgColor}
                              onChange={(e) => setBgColor(e.target.value)}
                              disabled={!useBgColor}
                            />
                          </div>
                        </div>
                      </div>

                      {useBgColor && (
                        <>
                          <div>
                            <Label htmlFor="margins">
                              {t("watermarkPdf.margins") || "Margins"}
                            </Label>
                            <Input
                              id="margins"
                              placeholder="0 or space-separated values (e.g., '5' or '5 10' or '5 10 5 10')"
                              value={margins}
                              onChange={(e) => setMargins(e.target.value)}
                            />
                          </div>

                          <div>
                            <Label htmlFor="borderWidth">
                              {t("watermarkPdf.borderWidth") || "Border Width"}{" "}
                              ({borderWidth})
                            </Label>
                            <Slider
                              id="borderWidth"
                              min={0}
                              max={10}
                              step={1}
                              value={[borderWidth]}
                              onValueChange={(values) =>
                                setBorderWidth(values[0])
                              }
                              className="mt-2"
                            />
                          </div>

                          {borderWidth > 0 && (
                            <>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id="roundedCorners"
                                  checked={roundedCorners}
                                  onCheckedChange={setRoundedCorners}
                                />
                                <Label htmlFor="roundedCorners">
                                  {t("watermarkPdf.roundedCorners") ||
                                    "Rounded Corners"}
                                </Label>
                              </div>

                              <div>
                                <Label htmlFor="borderColor">
                                  {t("watermarkPdf.borderColor") ||
                                    "Border Color"}
                                </Label>
                                <div className="flex items-center mt-1 gap-2">
                                  <div
                                    className="w-6 h-6 rounded-full border"
                                    style={{ backgroundColor: borderColor }}
                                  />
                                  <Input
                                    id="borderColor"
                                    type="color"
                                    value={borderColor}
                                    onChange={(e) =>
                                      setBorderColor(e.target.value)
                                    }
                                  />
                                </div>
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* SVG Watermark Tab */}
                <TabsContent value="svg" className="space-y-6">
                  <div className="border rounded-lg p-6">
                    <Label className="block mb-2">
                      {t("watermarkPdf.selectSvg") ||
                        "Select SVG for Watermark"}
                    </Label>
                    <FileDropzone
                      multiple={false}
                      maxFiles={1}
                      acceptedFileTypes={{ "image/svg+xml": [".svg"] }}
                      disabled={processing}
                      onFileAccepted={handleSvgWatermarkUpload}
                      title={
                        svgWatermark
                          ? t("watermarkPdf.svgSelected") || "SVG Selected"
                          : t("watermarkPdf.uploadSvgTitle") || "Upload an SVG"
                      }
                      description={
                        t("watermarkPdf.uploadSvgDesc") ||
                        "Select an SVG file to use as a watermark (max. 2MB)"
                      }
                      browseButtonText={t("ui.browse") || "Browse Files"}
                      browseButtonVariant="outline"
                      className="h-48"
                    />
                  </div>

                  {svgWatermark && (
                    <div className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4 text-green-500" />
                      <span className="text-green-500 font-medium">
                        {t("watermarkPdf.svgSelected") || "SVG selected"}
                      </span>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              {/* Common Watermark Options */}
              <div className="mt-6 border-t pt-6 space-y-6">
                <h3 className="text-lg font-medium">
                  {t("watermarkPdf.commonOptions") || "Watermark Options"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="pageSelection">
                        {t("watermarkPdf.pageSelection") || "Page Selection"}
                      </Label>
                      <Input
                        id="pageSelection"
                        placeholder={
                          t("watermarkPdf.pageSelectionPlaceholder") ||
                          "e.g., 1-3,5,7-9 (leave empty for all pages)"
                        }
                        value={pageSelection}
                        onChange={(e) => setPageSelection(e.target.value)}
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {t("watermarkPdf.pageSelectionHelp") ||
                          "You can also use 'even' or 'odd' to select even or odd pages"}
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="position">
                        {t("watermarkPdf.position") || "Position"}
                      </Label>
                      <Select value={position} onValueChange={setPosition}>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              t("watermarkPdf.selectPosition") ||
                              "Select Position"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {POSITIONS.map((pos) => (
                            <SelectItem key={pos.value} value={pos.value}>
                              {pos.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="useOffset"
                        checked={useOffset}
                        onCheckedChange={setUseOffset}
                      />
                      <Label htmlFor="useOffset">
                        {t("watermarkPdf.useOffset") || "Use Offset"}
                      </Label>
                    </div>

                    {useOffset && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="offsetX">
                            {t("watermarkPdf.offsetX") || "Offset X"}
                          </Label>
                          <Input
                            id="offsetX"
                            type="number"
                            value={offsetX}
                            onChange={(e) => setOffsetX(Number(e.target.value))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="offsetY">
                            {t("watermarkPdf.offsetY") || "Offset Y"}
                          </Label>
                          <Input
                            id="offsetY"
                            type="number"
                            value={offsetY}
                            onChange={(e) => setOffsetY(Number(e.target.value))}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>
                        {t("watermarkPdf.opacity") || "Opacity"} ({opacity}%)
                      </Label>
                      <Slider
                        min={0}
                        max={100}
                        step={5}
                        value={[opacity]}
                        onValueChange={(values) => setOpacity(values[0])}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label>
                        {t("watermarkPdf.scale") || "Scale"} ({scale}%)
                      </Label>
                      <Slider
                        min={10}
                        max={100}
                        step={5}
                        value={[scale]}
                        onValueChange={(values) => setScale(values[0])}
                        className="mt-2"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>{t("watermarkPdf.rotation") || "Rotation"}</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="useDiagonal"
                            checked={diagonal > 0}
                            onChange={() => {
                              setDiagonal(1);
                              setRotation(0);
                            }}
                            className="h-4 w-4"
                          />
                          <Label htmlFor="useDiagonal" className="font-normal">
                            {t("watermarkPdf.diagonal") || "Diagonal"}
                          </Label>
                        </div>

                        {diagonal > 0 && (
                          <div className="pl-6">
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="diagonal1"
                                checked={diagonal === 1}
                                onChange={() => setDiagonal(1)}
                                className="h-4 w-4"
                              />
                              <Label
                                htmlFor="diagonal1"
                                className="font-normal"
                              >
                                {t("watermarkPdf.diagonal1") ||
                                  "Lower left to upper right"}
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="diagonal2"
                                checked={diagonal === 2}
                                onChange={() => setDiagonal(2)}
                                className="h-4 w-4"
                              />
                              <Label
                                htmlFor="diagonal2"
                                className="font-normal"
                              >
                                {t("watermarkPdf.diagonal2") ||
                                  "Upper left to lower right"}
                              </Label>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="useRotation"
                            checked={diagonal === 0}
                            onChange={() => setDiagonal(0)}
                            className="h-4 w-4"
                          />
                          <Label htmlFor="useRotation" className="font-normal">
                            {t("watermarkPdf.customRotation") ||
                              "Custom Rotation"}
                          </Label>
                        </div>

                        {diagonal === 0 && (
                          <div className="pl-6">
                            <Label>
                              {t("watermarkPdf.rotationAngle") ||
                                "Rotation Angle"}{" "}
                              ({rotation}°)
                            </Label>
                            <Slider
                              min={-180}
                              max={180}
                              step={5}
                              value={[rotation]}
                              onValueChange={(values) => setRotation(values[0])}
                              className="mt-2"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Button onClick={applyWatermark} disabled={processing}>
                  {t("watermarkPdf.applyWatermark") || "Apply Watermark"}
                </Button>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="w-full md:w-1/3">
              <Card>
                <CardContent className="p-4">
                  <div className="border rounded-lg overflow-hidden">
                    <svg
                      ref={svgPreviewRef}
                      width="595"
                      height="842"
                      viewBox="0 0 595 842"
                      className="bg-white"
                    >
                      {/* Mock PDF page */}
                      <rect
                        x="0"
                        y="0"
                        width="595"
                        height="842"
                        fill="#fff"
                        stroke="#ccc"
                        strokeWidth="1"
                      />
                      {/* Watermark */}
                      <g
                        id="watermark-group"
                        transform={getSvgTransform()}
                        opacity={opacity / 100}
                      >
                        {activeTab === "text" ? (
                          <text
                            x="0"
                            y="0"
                            fontFamily={fontName}
                            fontSize={fontSize}
                            fill={fillColor}
                            stroke={renderMode !== "0" ? strokeColor : "none"}
                            strokeWidth={renderMode !== "0" ? 1 : 0}
                            textAnchor={
                              textAlignment === "l"
                                ? "start"
                                : textAlignment === "r"
                                ? "end"
                                : textAlignment === "j"
                                ? "middle" // Fallback for justified in preview
                                : "middle"
                            }
                          >
                            {textWatermark}
                          </text>
                        ) : (
                          svgWatermark && (
                            <g
                              dangerouslySetInnerHTML={{ __html: svgWatermark }}
                            />
                          )
                        )}
                      </g>
                    </svg>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
