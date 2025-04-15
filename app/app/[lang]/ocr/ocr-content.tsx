"use client";

import { useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { 
  FileText, 
  Upload, 
  Download, 
  Loader2, 
  FileSearch, 
  Check, 
  Copy, 
  Eye,
  Languages,
  FileCode,
  Layout,
  Image,
  Settings,
  CheckCircle,
  X,
  XCircle,
  Info,
  MergeIcon,
  LightbulbIcon,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLanguageStore } from "@/src/store/store";
import { LanguageLink } from "@/components/language-link";

export function OcrContent() {
  const { t } = useLanguageStore();

  // File state
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("eng");
  const [preserveLayout, setPreserveLayout] = useState(true);
  const [pageRange, setPageRange] = useState("all");
  const [pages, setPages] = useState("");
  
  // Progress state
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");
  
  // Result state
  const [result, setResult] = useState<{
    success: boolean;
    text?: string;
    fileUrl?: string;
    pagesProcessed?: number;
    totalPages?: number;
    wordCount?: number;
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
        toast.error(t('ocr.invalidFile') || "Invalid file type", {
          description: t('ocr.invalidFileDesc') || "Please select a PDF file"
        });
        return;
      }
      
      if (selectedFile.size > 50 * 1024 * 1024) { // 50MB limit
        toast.error(t('ocr.fileTooLarge') || "File too large", {
          description: t('ocr.fileTooLargeDesc') || "Maximum file size is 50MB"
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };
  
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!file) {
    toast.error(t('ocr.noFile') || "No file selected", {
      description: t('ocr.noFileDesc') || "Please select a PDF file to process"
    });
    return;
  }
  
  try {
    setIsProcessing(true);
    setProgress(0);
    setStage(t('ocr.analyzing') || "Analyzing document");
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language);
    formData.append('preserveLayout', String(preserveLayout));
    formData.append('pageRange', pageRange);
    
    if (pageRange === 'specific' && pages) {
      formData.append('pages', pages);
    }
    
    // Set up a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setIsProcessing(false);
      toast.error(t('ocr.processingTimeout') || "Processing timed out", {
        description: t('ocr.processingTimeoutDesc') || "The OCR process is taking longer than expected. The operation may still complete in the background."
      });
    }, 180000); // 3 minutes timeout
    
    // Simulate progress (in reality this would be from a progress event)
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        
        // Update stage based on progress
        if (prev === 20) setStage(t('ocr.preprocessing') || "Preprocessing pages");
        if (prev === 40) setStage(t('ocr.recognizing') || "Recognizing text");
        if (prev === 60) setStage(t('ocr.extracting') || "Extracting content");
        if (prev === 80) setStage(t('ocr.finalizing') || "Finalizing results");
        
        return prev + 5;
      });
    }, 300);
    
    console.log("Sending OCR request to /api/ocr/extract");
    
    // Send request to API
    const response = await fetch('/api/ocr/extract', {
      method: 'POST',
      body: formData
    });
    
    clearInterval(progressInterval);
    clearTimeout(timeoutId); // Clear the timeout since we got a response
    setProgress(100);
    setStage(t('ocr.finishing') || "Finishing up");
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || t('ocr.extractionFailed') || 'Failed to extract text');
    }
    
    const data = await response.json();
    console.log("OCR API response received:", data);
    
    // Set result - Using the correct properties from the API response
    setResult({
      success: true,
      text: data.text, // Direct text from the response
      fileUrl: data.fileUrl,
      pagesProcessed: data.pagesProcessed || 0,
      totalPages: data.totalPages || 0,
      wordCount: data.wordCount || 0
    });
    
    console.log("OCR process completed, exiting processing state");
    
    toast.success(t('ocr.extractionComplete') || "Text extraction complete", {
      description: t('ocr.extractionCompleteDesc') || "Your text has been successfully extracted from the PDF"
    });
  } catch (error) {
    console.error('Error extracting text:', error);
    toast.error(t('ocr.extractionError') || "Text extraction failed", {
      description: error instanceof Error ? error.message : t('ocr.unknownError') || "An unknown error occurred"
    });
  } finally {
    // Ensure we're exiting the processing state
    setIsProcessing(false);
    setProgress(100); // Make sure progress is complete
  }
};
  
  // Handle copy to clipboard
  const copyToClipboard = () => {
    if (result?.text) {
      navigator.clipboard.writeText(result.text)
        .then(() => {
          toast.success(t('ocr.textCopied') || "Text copied to clipboard");
        })
        .catch(() => {
          toast.error(t('ocr.copyFailed') || "Failed to copy text");
        });
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      const droppedFile = droppedFiles[0];
      if (droppedFile.type === 'application/pdf' || droppedFile.name.toLowerCase().endsWith('.pdf')) {
        if (droppedFile.size <= 50 * 1024 * 1024) {
          setFile(droppedFile);
        } else {
          toast.error(t('ocr.fileTooLarge') || "File too large", {
            description: t('ocr.fileTooLargeDesc') || "Maximum file size is 50MB"
          });
        }
      } else {
        toast.error(t('ocr.invalidFile') || "Invalid file type", {
          description: t('ocr.invalidFileDesc') || "Please select a PDF file"
        });
      }
    }
  };
  
  // Format metadata for languages
  const languageOptions = [
    { value: "eng", label: "English" },
    { value: "deu", label: "German (Deutsch)" },
    { value: "fra", label: "French (Français)" },
    { value: "spa", label: "Spanish (Español)" },
    { value: "ita", label: "Italian (Italiano)" },
    { value: "por", label: "Portuguese (Português)" },
    { value: "nld", label: "Dutch (Nederlands)" },
    { value: "rus", label: "Russian (Русский)" },
    { value: "jpn", label: "Japanese (日本語)" },
    { value: "chi_sim", label: "Chinese Simplified (简体中文)" },
    { value: "chi_tra", label: "Chinese Traditional (繁體中文)" },
    { value: "kor", label: "Korean (한국어)" },
    { value: "ara", label: "Arabic (العربية)" },
    { value: "hin", label: "Hindi (हिन्दी)" },
    { value: "tur", label: "Turkish (Türkçe)" }
  ];
  
  const renderUploadArea = () => (
    <div 
      className="border-2 border-dashed rounded-lg p-8 text-center"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <FileSearch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-2">{t('ocr.uploadPdf') || "Upload PDF for Text Extraction"}</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {t('ocr.dragDrop') || "Drag and drop your PDF file here, or click to browse"}
      </p>
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
      />
      <Button 
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {t('ocr.uploading') || "Uploading..."}
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            {t('ocr.selectPdf') || "Select PDF File"}
          </>
        )}
      </Button>
      <p className="text-xs text-muted-foreground mt-4">
        {t('ocr.maxFileSize') || "Maximum file size: 50MB"}
      </p>
    </div>
  );
  
  const renderExtractionOptions = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">{file?.name}</h3>
          <p className="text-sm text-muted-foreground">
            {(file?.size && (file.size / (1024 * 1024)).toFixed(2))} MB
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            setFile(null);
            setResult(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }}
        >
          {t('ocr.changeFile') || "Change File"}
        </Button>
      </div>
      
      <div className="space-y-2">
        <Label>{t('ocr.languageLabel') || "Document Language"}</Label>
        <Select
          value={language}
          onValueChange={setLanguage}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('ocr.selectLanguage') || "Select language"} />
          </SelectTrigger>
          <SelectContent>
            {languageOptions.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label>{t('ocr.pageRange') || "Page Range"}</Label>
        <RadioGroup 
          value={pageRange} 
          onValueChange={setPageRange} 
          className="flex flex-col space-y-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="all" />
            <Label htmlFor="all">{t('ocr.allPages') || "All Pages"}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="specific" id="specific" />
            <Label htmlFor="specific">{t('ocr.specificPages') || "Specific Pages"}</Label>
          </div>
        </RadioGroup>
        
        {pageRange === 'specific' && (
          <div className="pt-2">
            <Input
              placeholder={t('ocr.pageRangeExample') || "e.g., 1-3, 5, 7-9"}
              value={pages}
              onChange={(e) => setPages(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t('ocr.pageRangeInfo') || "Enter individual pages or ranges separated by commas"}
            </p>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="preserveLayout" 
          checked={preserveLayout}
          onCheckedChange={(checked) => setPreserveLayout(!!checked)}
        />
        <div>
          <Label htmlFor="preserveLayout" className="font-medium">
            {t('ocr.preserveLayout') || "Preserve Layout"}
          </Label>
          <p className="text-xs text-muted-foreground">
            {t('ocr.preserveLayoutDesc') || "Attempt to maintain document structure and formatting"}
          </p>
        </div>
      </div>
      
      <Button 
        onClick={handleSubmit} 
        className="w-full"
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {t('ocr.extractingText') || "Extracting Text..."}
          </>
        ) : (
          <>
            <FileText className="h-4 w-4 mr-2" />
            {t('ocr.extractText') || "Extract Text"}
          </>
        )}
      </Button>
    </div>
  );
  
  const renderProcessingState = () => (
    <div className="space-y-4 py-4">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">{t('ocr.processingPdf') || "Processing your PDF"}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {stage}
        </p>
      </div>
      
      <div className="space-y-1">
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-right text-muted-foreground">{progress}%</p>
      </div>
      
      <p className="text-xs text-center text-muted-foreground">
        {t('ocr.processingInfo') || "This may take a few minutes depending on the file size and complexity."}
      </p>
    </div>
  );
  
  const renderResult = () => {
    if (!result) return null;
    
    return (
      <div className="space-y-6">
       
        
        <Tabs defaultValue="preview">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview">
              <Eye className="h-4 w-4 mr-2" />
              {t('ocr.textPreview') || "Text Preview"}
            </TabsTrigger>
            <TabsTrigger value="code">
              <FileCode className="h-4 w-4 mr-2" />
              {t('ocr.rawText') || "Raw Text"}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{t('ocr.extractedText') || "Extracted Text"}</CardTitle>
                <CardDescription>
                  {t('ocr.previewDesc') || "Preview of the extracted text with formatting"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 p-4 rounded-md max-h-96 overflow-y-auto whitespace-pre-line">
                  {result.text || t('ocr.noTextFound') || "No text found in the document"}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="code" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{t('ocr.rawTextOutput') || "Raw Text Output"}</CardTitle>
                <CardDescription>
                  {t('ocr.rawTextDesc') || "Plain text without formatting"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 p-4 rounded-md max-h-96 overflow-y-auto font-mono text-sm">
                  {result.text || t('ocr.noTextFound') || "No text found in the document"}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex gap-4">
          <Button className="flex-1" onClick={copyToClipboard}>
            <Copy className="h-4 w-4 mr-2" />
            {t('ocr.copyText') || "Copy Text"}
          </Button>
          
          {result.fileUrl && (
            <Button variant="secondary" className="flex-1" asChild>
              <a href={result.fileUrl} download>
                <Download className="h-4 w-4 mr-2" />
                {t('watermarkPdf.download') || "Download PDF"}
              </a>
            </Button>
          )}
        </div>
        
        <div className="flex justify-center mt-4">
          <Button 
            variant="outline" 
            onClick={() => {
              setFile(null);
              setResult(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
          >
            <Upload className="h-4 w-4 mr-2" />
            {t('ocr.processAnother') || "Process Another PDF"}
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="container max-w-5xl py-12 mx-auto">
      {/* Header Section */}
      <div className="mx-auto flex flex-col items-center text-center mb-8">
        <div className="mb-4 p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
          <FileSearch className="h-8 w-8 text-blue-500" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {t('ocr.title') || "OCR Text Extraction"}
        </h1>
        <p className="mt-4 text-xl text-muted-foreground max-w-[700px]">
          {t('ocr.description') || "Extract text from scanned PDFs and images using optical character recognition"}
        </p>
      </div>

      {/* Main Tool Card */}
      <Card className="mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {t('ocr.ocrTool') || "OCR Text Extraction Tool"}
          </CardTitle>
          <CardDescription>
            {t('ocr.ocrToolDesc') || "Convert scanned documents and images to editable text"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isProcessing ? (
            renderProcessingState()
          ) : result ? (
            renderResult()
          ) : file ? (
            renderExtractionOptions()
          ) : (
            renderUploadArea()
          )}
        </CardContent>
        {!result && !isProcessing && (
          <CardFooter className="border-t px-6 py-4">
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Languages className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>
                {t('ocr.supportedLanguages') || "Supports 15+ languages including English, Spanish, French, German, Chinese, Japanese, and more. Select the appropriate language for better accuracy."}
              </p>
            </div>
          </CardFooter>
        )}
      </Card>

{/* How-to Section */}
<section className="mt-12">
  <h2 className="text-2xl font-bold mb-6 text-center">{t('ocr.howTo.title')}</h2>
  <div className="grid md:grid-cols-3 gap-8">
    <div className="flex flex-col items-center text-center">
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-4">
        <span className="font-bold">1</span>
      </div>
      <h3 className="text-lg font-medium mb-2">{t('ocr.howTo.step1.title')}</h3>
      <p className="text-sm text-muted-foreground">
        {t('ocr.howTo.step1.description')}
      </p>
    </div>
    
    <div className="flex flex-col items-center text-center">
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-4">
        <span className="font-bold">2</span>
      </div>
      <h3 className="text-lg font-medium mb-2">{t('ocr.howTo.step2.title')}</h3>
      <p className="text-sm text-muted-foreground">
        {t('ocr.howTo.step2.description')}
      </p>
    </div>
    
    <div className="flex flex-col items-center text-center">
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-4">
        <span className="font-bold">3</span>
      </div>
      <h3 className="text-lg font-medium mb-2">{t('ocr.howTo.step3.title')}</h3>
      <p className="text-sm text-muted-foreground">
        {t('ocr.howTo.step3.description')}
      </p>
    </div>
  </div>
</section>

{/* What is OCR Section */}
<section className="mt-12 bg-muted/30 p-6 rounded-lg">
  <h2 className="text-2xl font-bold mb-6 text-center">{t('ocr.whatIsOcr.title')}</h2>
  <p className="mb-4 text-center max-w-3xl mx-auto">
    {t('ocr.whatIsOcr.description')}
  </p>
  <p className="mb-6 text-center max-w-3xl mx-auto">
    {t('ocr.whatIsOcr.explanation')}
  </p>
  
  <div className="bg-background p-4 rounded-md">
    <h3 className="font-medium mb-3">OCR can extract text from:</h3>
    <ul className="space-y-2">
      <li className="flex gap-2 items-center">
        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
        <span>{t('ocr.whatIsOcr.extractionList.scannedPdfs')}</span>
      </li>
      <li className="flex gap-2 items-center">
        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
        <span>{t('ocr.whatIsOcr.extractionList.imageOnlyPdfs')}</span>
      </li>
      <li className="flex gap-2 items-center">
        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
        <span>{t('ocr.whatIsOcr.extractionList.embeddedImages')}</span>
      </li>
      <li className="flex gap-2 items-center">
        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
        <span>{t('ocr.whatIsOcr.extractionList.textCopyingIssues')}</span>
      </li>
    </ul>
  </div>
</section>

{/* When to Use Section */}
<section className="mt-12">
  <h2 className="text-2xl font-bold mb-6 text-center">{t('ocr.whenToUse.title')}</h2>
  
  <div className="grid md:grid-cols-2 gap-6">
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Check className="h-5 w-5 text-green-500" />
          {t('ocr.whenToUse.idealFor')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          <li className="flex gap-2 items-center">
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span>{t('ocr.whenToUse.idealForList.scannedDocuments')}</span>
          </li>
          <li className="flex gap-2 items-center">
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span>{t('ocr.whenToUse.idealForList.oldDocuments')}</span>
          </li>
          <li className="flex gap-2 items-center">
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span>{t('ocr.whenToUse.idealForList.textSelectionIssues')}</span>
          </li>
          <li className="flex gap-2 items-center">
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span>{t('ocr.whenToUse.idealForList.textInImages')}</span>
          </li>
          <li className="flex gap-2 items-center">
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span>{t('ocr.whenToUse.idealForList.searchableArchives')}</span>
          </li>
        </ul>
      </CardContent>
    </Card>
    
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <X className="h-5 w-5 text-red-500" />
          {t('ocr.whenToUse.notNecessaryFor')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          <li className="flex gap-2 items-center">
            <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <span>{t('ocr.whenToUse.notNecessaryForList.digitalPdfs')}</span>
          </li>
          <li className="flex gap-2 items-center">
            <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <span>{t('ocr.whenToUse.notNecessaryForList.createdDigitally')}</span>
          </li>
          <li className="flex gap-2 items-center">
            <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <span>{t('ocr.whenToUse.notNecessaryForList.copyPasteAvailable')}</span>
          </li>
          <li className="flex gap-2 items-center">
            <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <span>{t('ocr.whenToUse.notNecessaryForList.formatPreservation')}</span>
          </li>
        </ul>
      </CardContent>
    </Card>
  </div>
</section>

{/* Limitations & Tips Section */}
<section className="mt-12 bg-muted/30 p-6 rounded-lg">
  <h2 className="text-2xl font-bold mb-6 text-center">{t('ocr.limitations.title')}</h2>
  <p className="mb-6 text-center">
    {t('ocr.limitations.description')}
  </p>
  
  <div className="grid md:grid-cols-2 gap-6">
    <div>
      <h3 className="font-medium mb-3 text-lg">{t('ocr.limitations.factorsAffecting')}</h3>
      <ul className="space-y-2">
        <li className="flex gap-2 items-center">
          <Info className="h-4 w-4 text-amber-500 flex-shrink-0" />
          <span>{t('ocr.limitations.factorsList.documentQuality')}</span>
        </li>
        <li className="flex gap-2 items-center">
          <Info className="h-4 w-4 text-amber-500 flex-shrink-0" />
          <span>{t('ocr.limitations.factorsList.complexLayouts')}</span>
        </li>
        <li className="flex gap-2 items-center">
          <Info className="h-4 w-4 text-amber-500 flex-shrink-0" />
          <span>{t('ocr.limitations.factorsList.handwrittenText')}</span>
        </li>
        <li className="flex gap-2 items-center">
          <Info className="h-4 w-4 text-amber-500 flex-shrink-0" />
          <span>{t('ocr.limitations.factorsList.specialCharacters')}</span>
        </li>
        <li className="flex gap-2 items-center">
          <Info className="h-4 w-4 text-amber-500 flex-shrink-0" />
          <span>{t('ocr.limitations.factorsList.multipleLanguages')}</span>
        </li>
      </ul>
    </div>
    
    <div>
      <h3 className="font-medium mb-3 text-lg">{t('ocr.limitations.tipsForBest')}</h3>
      <ul className="space-y-2">
        <li className="flex gap-2 items-center">
          <LightbulbIcon className="h-4 w-4 text-yellow-500 flex-shrink-0" />
          <span>{t('ocr.limitations.tipsList.highQualityScans')}</span>
        </li>
        <li className="flex gap-2 items-center">
          <LightbulbIcon className="h-4 w-4 text-yellow-500 flex-shrink-0" />
          <span>{t('ocr.limitations.tipsList.correctLanguage')}</span>
        </li>
        <li className="flex gap-2 items-center">
          <LightbulbIcon className="h-4 w-4 text-yellow-500 flex-shrink-0" />
          <span>{t('ocr.limitations.tipsList.enhanceScannedImages')}</span>
        </li>
        <li className="flex gap-2 items-center">
          <LightbulbIcon className="h-4 w-4 text-yellow-500 flex-shrink-0" />
          <span>{t('ocr.limitations.tipsList.smallerPageRanges')}</span>
        </li>
        <li className="flex gap-2 items-center">
          <LightbulbIcon className="h-4 w-4 text-yellow-500 flex-shrink-0" />
          <span>{t('ocr.limitations.tipsList.reviewText')}</span>
        </li>
      </ul>
    </div>
  </div>
</section>

{/* FAQ Section */}
<section className="mt-12">
  <h2 className="text-2xl font-bold mb-6 text-center">{t('ocr.faq.title')}</h2>
  <div className="space-y-4">
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="accuracy">
        <AccordionTrigger>
          {t('ocr.faq.questions.accuracy.question')}
        </AccordionTrigger>
        <AccordionContent>
          <p className="text-muted-foreground">
            {t('ocr.faq.questions.accuracy.answer')}
          </p>
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="languages">
        <AccordionTrigger>
          {t('ocr.faq.questions.languages.question')}
        </AccordionTrigger>
        <AccordionContent>
          <p className="text-muted-foreground">
            {t('ocr.faq.questions.languages.answer')}
          </p>
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="recognition">
        <AccordionTrigger>
          {t('ocr.faq.questions.recognition.question')}
        </AccordionTrigger>
        <AccordionContent>
          <p className="text-muted-foreground">
            {t('ocr.faq.questions.recognition.answer')}
          </p>
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="pageLimit">
        <AccordionTrigger>
          {t('ocr.faq.questions.pageLimit.question')}
        </AccordionTrigger>
        <AccordionContent>
          <p className="text-muted-foreground">
            {t('ocr.faq.questions.pageLimit.answer')}
          </p>
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="security">
        <AccordionTrigger>
          {t('ocr.faq.questions.security.question')}
        </AccordionTrigger>
        <AccordionContent>
          <p className="text-muted-foreground">
            {t('ocr.faq.questions.security.answer')}
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
</section>

{/* Related Tools Section */}
<section className="mt-12">
  <h2 className="text-2xl font-bold mb-6 text-center">{t('ocr.relatedTools')}</h2>
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <LanguageLink href="/convert/pdf-to-docx" className="border rounded-lg p-4 text-center hover:border-primary transition-colors">
      <div className="flex flex-col items-center">
        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-2">
          <FileText className="h-5 w-5 text-blue-500" />
        </div>
        <span className="text-sm font-medium">PDF to Word</span>
      </div>
    </LanguageLink>
    
    <LanguageLink href="/compress-pdf" className="border rounded-lg p-4 text-center hover:border-primary transition-colors">
      <div className="flex flex-col items-center">
        <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30 mb-2">
          <Download className="h-5 w-5 text-green-500" />
        </div>
        <span className="text-sm font-medium">Compress PDF</span>
      </div>
    </LanguageLink>
    
    <LanguageLink href="/merge-pdf" className="border rounded-lg p-4 text-center hover:border-primary transition-colors">
      <div className="flex flex-col items-center">
        <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30 mb-2">
          <MergeIcon className="h-5 w-5 text-red-500" />
        </div>
        <span className="text-sm font-medium">Merge PDFs</span>
      </div>
    </LanguageLink>
    
    <LanguageLink href="/pdf-tools" className="border rounded-lg p-4 text-center hover:border-primary transition-colors">
      <div className="flex flex-col items-center">
        <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-2">
          <Settings className="h-5 w-5 text-purple-500" />
        </div>
        <span className="text-sm font-medium">All Tools</span>
      </div>
    </LanguageLink>
  </div>
</section>
    </div>
  );
}