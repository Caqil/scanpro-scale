"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Check, FileText, Download, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLanguageStore } from "@/src/store/store";

// Define supported languages for OCR
const LANGUAGES = [
  { code: "eng", name: "English" },
  { code: "fra", name: "French" },
  { code: "deu", name: "German" },
  { code: "spa", name: "Spanish" },
  { code: "chi_sim", name: "Chinese (Simplified)" },
  { code: "chi_tra", name: "Chinese (Traditional)" },
  { code: "jpn", name: "Japanese" },
  { code: "kor", name: "Korean" },
  { code: "ara", name: "Arabic" },
  { code: "rus", name: "Russian" },
  { code: "ita", name: "Italian" },
  { code: "por", name: "Portuguese" },
  { code: "hin", name: "Hindi" },
  { code: "dut", name: "Dutch" },
  { code: "tur", name: "Turkish" },
];

export function PdfOcr() {
  const { t } = useLanguageStore();
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [language, setLanguage] = useState<string>("eng");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [enhanceScanned, setEnhanceScanned] = useState<boolean>(true);
  const [preserveLayout, setPreserveLayout] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulated progress for better UX
  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 95) {
          clearInterval(interval);
          return prevProgress;
        }
        return prevProgress + 5;
      });
    }, 500);
    return interval;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      
      // Validate file type
      if (!selectedFile.name.toLowerCase().endsWith(".pdf")) {
        setError(t("ocr.invalidFile"));
        setFile(null);
        setFileName("");
        return;
      }
      
      // Validate file size (max 50MB)
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError(t("ocr.fileTooLarge"));
        setFile(null);
        setFileName("");
        return;
      }
      
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setError(null);
      setSuccess(false);
      setDownloadUrl("");
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      const droppedFile = files[0];
      
      // Validate file type
      if (!droppedFile.name.toLowerCase().endsWith(".pdf")) {
        setError(t("ocr.invalidFile"));
        setFile(null);
        setFileName("");
        return;
      }
      
      // Validate file size (max 50MB)
      if (droppedFile.size > 50 * 1024 * 1024) {
        setError(t("ocr.fileTooLarge"));
        setFile(null);
        setFileName("");
        return;
      }
      
      setFile(droppedFile);
      setFileName(droppedFile.name);
      setError(null);
      setSuccess(false);
      setDownloadUrl("");
    }
  };

  const processPdf = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!file) {
      setError(t("ocr.noFile"));
      return;
    }
    
    setIsLoading(true);
    setError(null);
    const progressInterval = simulateProgress();
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("language", language);
      formData.append("enhanceScanned", enhanceScanned.toString());
      formData.append("preserveLayout", preserveLayout.toString());
      
      const response = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        throw new Error(data.error || t("ocr.extractionFailed"));
      }
      
      setProgress(100);
      setSuccess(true);
      setDownloadUrl(data.searchablePdfUrl);
      
    } catch (error) {
      clearInterval(progressInterval);
      setError(error instanceof Error ? error.message : t("ocr.unknownError"));
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setFileName("");
    setSuccess(false);
    setError(null);
    setDownloadUrl("");
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">{t("ocr.title")}</CardTitle>
        <CardDescription>{t("ocr.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        {!success ? (
          <form onSubmit={processPdf}>
            {!file ? (
              <div
                className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-10 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">{t("ocr.uploadPdf")}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("ocr.dragDrop")}
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  className="mt-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  {t("ocr.selectPdf")}
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf"
                  className="hidden"
                />
                <p className="mt-4 text-xs text-muted-foreground">
                  {t("ocr.maxFileSize")}
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-4 p-4 border rounded-lg mb-6">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="flex-1 space-y-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">{fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      PDF • {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={resetForm}
                  >
                    {t("ocr.changeFile")}
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Language Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="language">{t("ocr.languageLabel")}</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger id="language">
                        <SelectValue placeholder={t("ocr.selectLanguage")} />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* OCR Options */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="enhance-scanned"
                        checked={enhanceScanned}
                        onCheckedChange={(checked) => setEnhanceScanned(checked as boolean)}
                      />
                      <Label htmlFor="enhance-scanned" className="text-sm font-normal">
                        {t("ocr.options.enhanceScanned")}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="preserve-layout"
                        checked={preserveLayout}
                        onCheckedChange={(checked) => setPreserveLayout(checked as boolean)}
                      />
                      <Label htmlFor="preserve-layout" className="text-sm font-normal">
                        {t("ocr.options.preserveLayout")}
                      </Label>
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || !file}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("ocr.extractingText")}
                      </>
                    ) : (
                      t("ocr.extractText")
                    )}
                  </Button>
                </div>
              </>
            )}
          </form>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600 dark:text-green-300" />
              </div>
              <h3 className="text-xl font-semibold">{t("ocr.extractionComplete")}</h3>
              <p className="text-muted-foreground">
                {t("ocr.extractionCompleteDesc")}
              </p>
            </div>

            <Button
              className="w-full"
              onClick={() => {
                if (downloadUrl) window.location.href = downloadUrl;
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              {t("ui.download")}
            </Button>

            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={resetForm}
            >
              {t("ocr.processAnother")}
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t("ocr.processingPdf")}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
            <p className="text-xs text-muted-foreground mt-2">
              {progress < 30
                ? t("ocr.analyzing")
                : progress < 60
                ? t("ocr.preprocessing")
                : progress < 90
                ? t("ocr.recognizing")
                : t("ocr.finishing")}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <p className="text-xs text-muted-foreground">
          {t("ui.filesSecurity")}
        </p>
      </CardFooter>
    </Card>
  );
}