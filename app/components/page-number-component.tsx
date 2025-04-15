"use client";

import React, { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowDownIcon, CheckIcon, UploadIcon, FileTextIcon, DownloadIcon, XIcon, RefreshCwIcon, EyeIcon } from "lucide-react";
import { useLanguageStore } from "@/src/store/store";

export function PdfPageNumberer() {
  const { t } = useLanguageStore();
  
  // File state
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [numberedPdfUrl, setNumberedPdfUrl] = useState<string>("");
  const [previewPage, setPreviewPage] = useState<HTMLCanvasElement | null>(null);
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
    skipFirstPage: false
  });
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const uploadedFile = files[0];
    if (uploadedFile.type !== "application/pdf") {
      toast.error(t("pageNumber.ui.error") || "Invalid file type. Please upload a PDF.");
      return;
    }

    setFile(uploadedFile);
    setNumberedPdfUrl("");
  };
  
  // Handle file drop
  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer.files;
    if (!files || files.length === 0) return;
    
    const uploadedFile = files[0];
    if (uploadedFile.type !== "application/pdf") {
      toast.error(t("pageNumber.ui.error") || "Invalid file type. Please upload a PDF.");
      return;
    }
    
    setFile(uploadedFile);
    setNumberedPdfUrl("");
  };
  
  // Handle option changes
  const handleOptionChange = (key: string, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };
  
  // Apply page numbering
  const applyPageNumbering = async () => {
    if (!file) {
      toast.error(t("pageNumber.messages.noFile") || "Please upload a PDF file first");
      return;
    }

    setProcessing(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);
      
      // Add all options to the form data
      Object.entries(options).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      // Progress simulation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 300);

      const response = await fetch("/api/pdf/pagenumber", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add page numbers");
      }

      const result = await response.json();

      if (result.success) {
        setNumberedPdfUrl(result.fileUrl);
        setProgress(100);
        toast.success(t("pageNumber.messages.success") || "Page numbers added successfully!");
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error adding page numbers:", error);
      toast.error((error instanceof Error ? error.message : "Error adding page numbers") || 
                  t("pageNumber.messages.error") || "Error adding page numbers");
      setProgress(0);
    } finally {
      setProcessing(false);
    }
  };
  
  // Reset form
  const resetForm = () => {
    setFile(null);
    setNumberedPdfUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  // Check if form is being submitted
  const isSubmitting = processing;
  
  // Format preview label
  const getFormatPreview = () => {
    let formattedNumber = '';
    
    switch(options.format) {
      case 'roman':
        formattedNumber = 'IV'; // Example roman numeral
        break;
      case 'alphabetic':
        formattedNumber = 'D'; // Example alphabetic character
        break;
      case 'numeric':
      default:
        formattedNumber = '4'; // Example number
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
              {t("pageNumber.description") || "Add customizable page numbers to your PDF document"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {!file ? (
              // File Upload Section
              <div 
                className="border-2 border-dashed rounded-lg p-12 text-center transition-colors hover:bg-muted/10"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={handleFileDrop}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".pdf"
                  onChange={handleFileUpload}
                />
                <div className="mb-6 p-4 rounded-full bg-primary/10 mx-auto w-20 h-20 flex items-center justify-center">
                  <UploadIcon className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">
                  {t("pageNumber.uploadTitle") || "Upload Your PDF"}
                </h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  {t("pageNumber.uploadDesc") || "Upload a PDF file to add page numbers. Your file will be processed securely."}
                </p>
                <Button
                  size="lg"
                  className="px-8"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {t("pageNumber.ui.browse") || "Browse Files"}
                </Button>
                <p className="mt-6 text-sm text-muted-foreground">
                  {t("pageNumber.ui.filesSecurity") || "Your files are secure and never stored permanently"}
                </p>
              </div>
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
                  <Button variant="ghost" size="icon" onClick={resetForm}>
                    <XIcon className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="space-y-6 mt-6">
                  <h3 className="text-lg font-semibold">{t("pageNumber.ui.settingsTitle") || "Page Number Settings"}</h3>
                
                  {/* Number Format */}
                  <div className="space-y-2">
                    <Label>{t("pageNumber.ui.numberFormat") || "Number Format"}</Label>
                    <Tabs 
                      defaultValue={options.format} 
                      onValueChange={(value) => handleOptionChange("format", value)}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="numeric">
                          1, 2, 3...
                        </TabsTrigger>
                        <TabsTrigger value="roman">
                          I, II, III...
                        </TabsTrigger>
                        <TabsTrigger value="alphabetic">
                          A, B, C...
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  
                  {/* Position */}
                  <div className="space-y-2">
                    <Label>{t("pageNumber.ui.position") || "Position"}</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        type="button"
                        variant={options.position === "top-left" ? "default" : "outline"}
                        className="h-20 flex-col gap-1"
                        onClick={() => handleOptionChange("position", "top-left")}
                      >
                        <div className="w-5 h-5 border rounded flex items-center justify-center">
                          <span className="text-[8px]">1</span>
                        </div>
                        <span className="text-xs">{t("pageNumber.ui.topLeft") || "Top Left"}</span>
                      </Button>
                      <Button
                        type="button"
                        variant={options.position === "top-center" ? "default" : "outline"}
                        className="h-20 flex-col gap-1"
                        onClick={() => handleOptionChange("position", "top-center")}
                      >
                        <div className="w-5 h-5 border rounded flex items-center justify-center">
                          <span className="text-[8px]">1</span>
                        </div>
                        <span className="text-xs">{t("pageNumber.ui.topCenter") || "Top Center"}</span>
                      </Button>
                      <Button
                        type="button"
                        variant={options.position === "top-right" ? "default" : "outline"}
                        className="h-20 flex-col gap-1"
                        onClick={() => handleOptionChange("position", "top-right")}
                      >
                        <div className="w-5 h-5 border rounded flex items-center justify-center">
                          <span className="text-[8px]">1</span>
                        </div>
                        <span className="text-xs">{t("pageNumber.ui.topRight") || "Top Right"}</span>
                      </Button>
                      <Button
                        type="button"
                        variant={options.position === "bottom-left" ? "default" : "outline"}
                        className="h-20 flex-col gap-1"
                        onClick={() => handleOptionChange("position", "bottom-left")}
                      >
                        <div className="w-5 h-5 border rounded flex items-center justify-center">
                          <span className="text-[8px]">1</span>
                        </div>
                        <span className="text-xs">{t("pageNumber.ui.bottomLeft") || "Bottom Left"}</span>
                      </Button>
                      <Button
                        type="button"
                        variant={options.position === "bottom-center" ? "default" : "outline"}
                        className="h-20 flex-col gap-1"
                        onClick={() => handleOptionChange("position", "bottom-center")}
                      >
                        <div className="w-5 h-5 border rounded flex items-center justify-center">
                          <span className="text-[8px]">1</span>
                        </div>
                        <span className="text-xs">{t("pageNumber.ui.bottomCenter") || "Bottom Center"}</span>
                      </Button>
                      <Button
                        type="button"
                        variant={options.position === "bottom-right" ? "default" : "outline"}
                        className="h-20 flex-col gap-1"
                        onClick={() => handleOptionChange("position", "bottom-right")}
                      >
                        <div className="w-5 h-5 border rounded flex items-center justify-center">
                          <span className="text-[8px]">1</span>
                        </div>
                        <span className="text-xs">{t("pageNumber.ui.bottomRight") || "Bottom Right"}</span>
                      </Button>
                    </div>
                  </div>
                  
                  {/* Font Settings */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fontFamily">{t("pageNumber.ui.fontFamily") || "Font Family"}</Label>
                      <select
                        id="fontFamily"
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none"
                        value={options.fontFamily}
                        onChange={(e) => handleOptionChange("fontFamily", e.target.value)}
                      >
                        <option value="Helvetica">Helvetica</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Courier">Courier</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fontSize">{t("pageNumber.ui.fontSize") || "Font Size"}</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="fontSize"
                          type="number"
                          min="6"
                          max="72"
                          value={options.fontSize}
                          onChange={(e) => handleOptionChange("fontSize", parseInt(e.target.value))}
                          className="w-full"
                        />
                        <span className="text-sm">pt</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="color">{t("pageNumber.ui.color") || "Color"}</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="color"
                          type="color"
                          value={options.color}
                          onChange={(e) => handleOptionChange("color", e.target.value)}
                          className="w-12 h-10 p-1"
                        />
                        <span className="text-sm">{options.color}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Number Customization */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startNumber">{t("pageNumber.ui.startFrom") || "Start From"}</Label>
                      <Input
                        id="startNumber"
                        type="number"
                        min="1"
                        value={options.startNumber}
                        onChange={(e) => handleOptionChange("startNumber", parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prefix">{t("pageNumber.ui.prefix") || "Prefix"}</Label>
                      <Input
                        id="prefix"
                        type="text"
                        value={options.prefix}
                        onChange={(e) => handleOptionChange("prefix", e.target.value)}
                        placeholder="e.g., 'Page '"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="suffix">{t("pageNumber.ui.suffix") || "Suffix"}</Label>
                      <Input
                        id="suffix"
                        type="text"
                        value={options.suffix}
                        onChange={(e) => handleOptionChange("suffix", e.target.value)}
                        placeholder="e.g., ' of 10'"
                      />
                    </div>
                  </div>
                  
                  {/* Margins */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="marginX">{t("pageNumber.ui.horizontalMargin") || "Horizontal Margin (px)"}</Label>
                      <div className="pt-2 px-2">
                        <Slider
                          id="marginX"
                          min={10}
                          max={100}
                          step={1}
                          value={[options.marginY]}
                          onValueChange={(value) => handleOptionChange("marginY", value[0])}
                        />
                      </div>
                      <div className="text-center text-sm">{options.marginY}px</div>
                    </div>
                  </div>
                  
                  {/* Page Selection Options */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="selectedPages">{t("pageNumber.ui.pagesToNumber") || "Pages to Number"}</Label>
                      <div className="text-sm text-muted-foreground">({t("pageNumber.ui.pagesHint") || "Leave blank for all pages"})</div>
                    </div>
                    <Input
                      id="selectedPages"
                      type="text"
                      value={options.selectedPages}
                      onChange={(e) => handleOptionChange("selectedPages", e.target.value)}
                      placeholder="e.g., 1,3,5-10"
                    />
                    <p className="text-xs text-muted-foreground">
                      {t("pageNumber.ui.pagesExample") || "Use commas for individual pages and hyphens for ranges (e.g., 1,3,5-10)"}
                    </p>
                  </div>
                  
                  {/* Skip First Page Option */}
                  <div className="flex items-center justify-between space-y-0 pb-2">
                    <Label htmlFor="skipFirstPage" className="cursor-pointer">{t("pageNumber.ui.skipFirstPage") || "Skip first page (e.g., for cover pages)"}</Label>
                    <Switch
                      id="skipFirstPage"
                      checked={options.skipFirstPage}
                      onCheckedChange={(checked) => handleOptionChange("skipFirstPage", checked)}
                    />
                  </div>
                  
                  {/* Preview */}
                  <div className="mt-6 border rounded-lg p-4 bg-muted/20">
  <h4 className="text-sm font-medium mb-2">{t("pageNumber.ui.preview") || "Preview:"}</h4>
  <div className="flex items-center justify-center bg-background p-4 rounded-lg border relative">
    <div className="w-64 h-32 bg-white/50 dark:bg-gray-800/50 rounded border flex items-center justify-center relative">
      {/* Simulate page number based on position */}
      <div
        className={`absolute text-sm px-1 py-0.5 rounded ${
          options.position.includes("top") ? "top-2" : 
          options.position.includes("bottom") ? "bottom-2" : "top-1/2 -translate-y-1/2"
        } ${
          options.position.includes("left") ? "left-2" : 
          options.position.includes("right") ? "right-2" : 
          options.position.includes("center") ? "left-1/2 -translate-x-1/2" : ""
        }`}
        style={{
          fontFamily: options.fontFamily,
          fontSize: `${options.fontSize * 1}px`,
          color: options.color
        }}
      >
        {getFormatPreview()}
      </div>
      <span className="text-xs text-muted-foreground">{t("pageNumber.ui.pagePreview") || "Page preview"}</span>
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
                <Button
                  onClick={applyPageNumbering}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCwIcon className="h-4 w-4 mr-2 animate-spin" />
                      {t("pageNumber.ui.processingProgress")?.replace("{progress}", Math.round(progress).toString()) || `Processing... (${Math.round(progress)}%)`}
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
              {t("pageNumber.ui.successTitle") || "Page Numbers Added Successfully"}
            </CardTitle>
            <CardDescription>
              {t("pageNumber.ui.successDesc") || "Your PDF has been processed and is ready to download"}
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
              {t("pageNumber.ui.readyDesc") || "Your PDF file has been processed and page numbers have been added according to your settings."}
            </p>
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
            <Button
              variant="ghost"
              onClick={resetForm}
            >
              <ArrowDownIcon className="h-4 w-4 mr-2" />
              {t("pageNumber.ui.processAnother") || "Process Another PDF"}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}