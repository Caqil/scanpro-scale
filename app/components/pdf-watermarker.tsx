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

// Define position key type for type safety
type PositionKey = "c" | "tl" | "tc" | "tr" | "l" | "r" | "bl" | "bc" | "br";

// Positions for anchoring watermarks
const POSITIONS = [
  { value: "c" as PositionKey, label: "Center" },
  { value: "tl" as PositionKey, label: "Top Left" },
  { value: "tc" as PositionKey, label: "Top Center" },
  { value: "tr" as PositionKey, label: "Top Right" },
  { value: "l" as PositionKey, label: "Left" },
  { value: "r" as PositionKey, label: "Right" },
  { value: "bl" as PositionKey, label: "Bottom Left" },
  { value: "bc" as PositionKey, label: "Bottom Center" },
  { value: "br" as PositionKey, label: "Bottom Right" },
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
  const [imageWatermark, setImageWatermark] = useState<File | null>(null);

  // Page selection
  const [pageSelection, setPageSelection] = useState<string>("");

  // Common watermark parameters - simplified to match the backend
  const [position, setPosition] = useState<PositionKey>("c");
  const [opacity, setOpacity] = useState<number>(50);
  const [rotation, setRotation] = useState<number>(0);
  const [scale, setScale] = useState<number>(100);
  const [watermarkColor, setWatermarkColor] = useState<string>("#808080");

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload
  const handleFileUpload = (acceptedFiles: File[]): void => {
    if (acceptedFiles.length > 0) {
      const uploadedFile = acceptedFiles[0];
      setFile(uploadedFile);
      setProcessedPdfUrl("");
      setError(null);
    }
  };

  // Handle image watermark upload
  const handleImageWatermarkUpload = (acceptedFiles: File[]): void => {
    if (acceptedFiles.length > 0) {
      setImageWatermark(acceptedFiles[0]);
    }
  };

  // Calculate watermark position with A4 dimensions (for preview only)
  const getWatermarkPosition = () => {
    const pageWidth = 595; // A4 width in points
    const pageHeight = 842; // A4 height in points

    // Map position to coordinates (adjusted for A4)
    const posMap: Record<PositionKey, { x: number; y: number }> = {
      c: { x: pageWidth / 2, y: pageHeight / 2 },
      tl: { x: 50, y: 50 },
      tc: { x: pageWidth / 2, y: 50 },
      tr: { x: pageWidth - 50, y: 50 },
      l: { x: 50, y: pageHeight / 2 },
      r: { x: pageWidth - 50, y: pageHeight / 2 },
      bl: { x: 50, y: pageHeight - 50 },
      bc: { x: pageWidth / 2, y: pageHeight - 50 },
      br: { x: pageWidth - 50, y: pageHeight - 50 },
    };

    return posMap[position];
  };

  // Get text anchor based on position (for preview only)
  const getTextAnchor = (): string => {
    if (["tl", "l", "bl"].includes(position)) {
      return "start";
    } else if (["tr", "r", "br"].includes(position)) {
      return "end";
    } else {
      return "middle";
    }
  };

  // Get text dominant-baseline based on position (for preview only)
  const getTextBaseline = (): string => {
    if (["tl", "tc", "tr"].includes(position)) {
      return "hanging";
    } else if (["bl", "bc", "br"].includes(position)) {
      return "alphabetic";
    } else {
      return "middle";
    }
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

    if (activeTab === "image" && !imageWatermark) {
      toast.error(
        t("watermarkPdf.messages.noImage") ||
          "Please upload an image for the watermark"
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

      // Add content based on watermark type
      if (activeTab === "text") {
        formData.append("content", textWatermark);
      } else if (activeTab === "image" && imageWatermark) {
        formData.append("content", imageWatermark);
      }

      // Add all parameters individually
      // Important: Make sure the position code is sent exactly as is
      formData.append("position", position); // Send the position code (c, tl, tr, etc.) directly
      formData.append("opacity", opacity.toString());
      formData.append("rotation", rotation.toString());
      formData.append("scale", scale.toString());
      formData.append("textColor", watermarkColor);

      // Log what we're sending to help with debugging
      console.log("Sending position:", position);

      if (pageSelection) {
        formData.append("pages", "custom");
        formData.append("customPages", pageSelection);
      } else {
        formData.append("pages", "all");
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
    setImageWatermark(null);
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
                  <TabsTrigger
                    value="image"
                    className="flex items-center gap-2"
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                      <polyline points="13 2 13 9 20 9" />
                    </svg>
                    {t("watermarkPdf.imageWatermark") || "Image Watermark"}
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

                  <div>
                    <Label htmlFor="watermarkColor">
                      {t("watermarkPdf.color") || "Color"}
                    </Label>
                    <div className="flex items-center mt-1 gap-2">
                      <div
                        className="w-6 h-6 rounded-full border"
                        style={{ backgroundColor: watermarkColor }}
                      />
                      <Input
                        id="watermarkColor"
                        type="color"
                        value={watermarkColor}
                        onChange={(e) => setWatermarkColor(e.target.value)}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Image Watermark Tab */}
                <TabsContent value="image" className="space-y-6">
                  <div className="border rounded-lg p-6">
                    <Label className="block mb-2">
                      {t("watermarkPdf.selectImage") ||
                        "Select Image for Watermark"}
                    </Label>
                    <FileDropzone
                      multiple={false}
                      maxFiles={1}
                      acceptedFileTypes={{
                        "image/*": [".jpg", ".jpeg", ".png", ".gif", ".svg"],
                      }}
                      disabled={processing}
                      onFileAccepted={handleImageWatermarkUpload}
                      title={
                        imageWatermark
                          ? t("watermarkPdf.imageSelected") || "Image Selected"
                          : t("watermarkPdf.uploadImageTitle") ||
                            "Upload an Image"
                      }
                      description={
                        t("watermarkPdf.uploadImageDesc") ||
                        "Select an image file to use as a watermark (max. 2MB)"
                      }
                      browseButtonText={t("ui.browse") || "Browse Files"}
                      browseButtonVariant="outline"
                      className="h-48"
                    />
                  </div>

                  {imageWatermark && (
                    <div className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4 text-green-500" />
                      <span className="text-green-500 font-medium">
                        {t("watermarkPdf.imageSelected") || "Image selected"}
                      </span>
                      <span className="text-muted-foreground">
                        ({imageWatermark.name})
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
                    <Select
                      value={position}
                      onValueChange={(value) =>
                        setPosition(value as PositionKey)
                      }
                    >
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

                  <div>
                    <Label>
                      {t("watermarkPdf.opacity") || "Opacity"} ({opacity}%)
                    </Label>
                    <Slider
                      min={10}
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
                      max={200}
                      step={5}
                      value={[scale]}
                      onValueChange={(values) => setScale(values[0])}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>
                      {t("watermarkPdf.rotationAngle") || "Rotation"} (
                      {rotation}°)
                    </Label>
                    <Slider
                      min={-180}
                      max={180}
                      step={15}
                      value={[rotation]}
                      onValueChange={(values) => setRotation(values[0])}
                      className="mt-2"
                    />
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
                      width="295"
                      height="500"
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
                      {/* Preview Grid Lines - for better visualization */}
                      <line
                        x1="0"
                        y1="421"
                        x2="595"
                        y2="421"
                        stroke="#e0e0e0"
                        strokeDasharray="5,5"
                      />
                      <line
                        x1="297.5"
                        y1="0"
                        x2="297.5"
                        y2="842"
                        stroke="#e0e0e0"
                        strokeDasharray="5,5"
                      />

                      {/* Preview watermark */}
                      {activeTab === "text" && (
                        <g
                          transform={`
    translate(${getWatermarkPosition().x}, ${getWatermarkPosition().y})
    ${rotation !== 0 ? `rotate(${-rotation})` : ""}
    scale(${scale / 100})
  `}
                        >
                          {/* Text shadow/outline for better visibility */}
                          <text
                            x="0"
                            y="0"
                            fontFamily="Helvetica"
                            fontSize={24}
                            fill="rgba(255, 255, 255, 0.7)"
                            stroke="rgba(255, 255, 255, 0.7)"
                            strokeWidth={0.5}
                            textAnchor={getTextAnchor()}
                            dominantBaseline={getTextBaseline()}
                            opacity={opacity / 100}
                          >
                            {textWatermark}
                          </text>
                          <text
                            x="0"
                            y="0"
                            fontFamily="Helvetica"
                            fontSize={24}
                            fill={watermarkColor}
                            textAnchor={getTextAnchor()}
                            dominantBaseline={getTextBaseline()}
                            opacity={opacity / 100}
                          >
                            {textWatermark}
                          </text>
                        </g>
                      )}

                      {activeTab === "image" && imageWatermark && (
                        <g
                          transform={`
    translate(${getWatermarkPosition().x}, ${getWatermarkPosition().y})
    ${rotation !== 0 ? `rotate(${-rotation})` : ""}
    scale(${scale / 100})
  `}
                        >
                          <rect
                            x="-50"
                            y="-50"
                            width="100"
                            height="100"
                            fill={watermarkColor}
                            opacity={opacity / 100}
                          />
                          <text
                            x="0"
                            y="0"
                            fontFamily="Helvetica"
                            fontSize={14}
                            fill="#fff"
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            [Image]
                          </text>
                        </g>
                      )}
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
