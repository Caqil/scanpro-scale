"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FileIcon,
  Cross2Icon,
  CheckCircledIcon,
  UploadIcon,
  DownloadIcon,
  CopyIcon,
} from "@radix-ui/react-icons";
import { AlertCircle, FileText, Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatedOcrText } from "./animated-ocr-text";
import { useLanguageStore } from "@/src/store/store";
import useFileUpload from "@/hooks/useFileUpload";
import { UploadProgress } from "./ui/upload-progress";

// Available languages for OCR
const OCR_LANGUAGES = [
  { value: "eng", label: "English" },
  { value: "fra", label: "French" },
  { value: "deu", label: "German" },
  { value: "spa", label: "Spanish" },
  { value: "ita", label: "Italian" },
  { value: "por", label: "Portuguese" },
  { value: "chi_sim", label: "Chinese (Simplified)" },
  { value: "chi_tra", label: "Chinese (Traditional)" },
  { value: "jpn", label: "Japanese" },
  { value: "kor", label: "Korean" },
  { value: "rus", label: "Russian" },
  { value: "ara", label: "Arabic" },
  { value: "hin", label: "Hindi" },
];

// Define form schema
const formSchema = z.object({
  language: z.string().default("eng"),
  pageRange: z.enum(["all", "specific"]).default("all"),
  pages: z.string().optional(),
  enhanceScanned: z.boolean().default(true),
  preserveLayout: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

export function PdfOcrExtractor() {
  const { t } = useLanguageStore();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [textFile, setTextFile] = useState<{
    url: string;
    filename: string;
  } | null>(null);
  const {
    isUploading,
    progress: uploadProgress,
    error: uploadError,
    uploadFile,
    resetUpload,
    uploadStats,
  } = useFileUpload();
  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      language: "eng",
      pageRange: "all",
      pages: "",
      enhanceScanned: true,
      preserveLayout: true,
    },
  });

  // Watch pageRange field for conditional rendering
  const pageRange = form.watch("pageRange");

  // Set up dropzone for PDF files only
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    maxFiles: 1,
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.file.size > 100 * 1024 * 1024) {
          setError(t("fileUploader.maxSize"));
        } else {
          setError(t("ui.error"));
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        setExtractedText(null);
        setTextFile(null);
        setError(null);
        resetUpload();
        const fileSizeInMB = acceptedFiles[0].size / (1024 * 1024);
        const estimatedPages = Math.max(1, Math.round(fileSizeInMB * 5));
        setTotalPages(estimatedPages);
      }
    },
  });

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

  // Handle file removal
  const handleRemoveFile = () => {
    setFile(null);
    setExtractedText(null);
    setTextFile(null);
    setError(null);
    setTotalPages(0);
  };

  // Copy extracted text to clipboard
  const copyToClipboard = () => {
    if (extractedText) {
      navigator.clipboard
        .writeText(extractedText)
        .then(() => {
          toast.success(t("ui.success"), {
            description: t("ocr.results.copy"),
          });
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
          toast.error(t("ui.error"));
        });
    }
  };

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    if (!file) {
      setError(t("compressPdf.error.noFiles"));
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setExtractedText(null);
    setTextFile(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("language", values.language);
    formData.append("pageRange", values.pageRange);

    if (values.pageRange === "specific" && values.pages) {
      formData.append("pages", values.pages);
    }

    formData.append("enhanceScanned", values.enhanceScanned.toString());
    formData.append("preserveLayout", values.preserveLayout.toString());

    try {
      await uploadFile(file, formData, {
        url: "/api/ocr/extract",
        onProgress: (progress) => {
          setProgress(progress);
        },
        onSuccess: (data) => {
          setProgress(100);
          if (data.text) {
            setExtractedText(data.text);
          }
          if (data.fileUrl && data.filename) {
            setTextFile({
              url: data.fileUrl,
              filename: data.filename,
            });
          }
          toast.success(t("ui.success"), {
            description: t("fileUploader.successDesc"),
          });
        },
        onError: (err) => {
          setError(err.message || t("compressPdf.error.unknown"));
          toast.error(t("ui.error"), {
            description: err.message || t("compressPdf.error.failed"),
          });
        },
      });
    } catch (err) {
      setError(t("compressPdf.error.unknown"));
      toast.error(t("ui.error"), {
        description: t("compressPdf.error.failed"),
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle>{t("ocr.title")}</CardTitle>
        <CardDescription>{t("ocr.description")}</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                isDragActive
                  ? "border-primary bg-primary/10"
                  : file
                  ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50",
                isProcessing && "pointer-events-none opacity-80"
              )}
            >
              <input {...getInputProps()} disabled={isProcessing} />

              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <FileIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)} • {t("compressPdf.files")}{" "}
                      {totalPages} {t("compressPdf.of")}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isProcessing}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile();
                    }}
                  >
                    <Cross2Icon className="h-4 w-4 mr-1" /> {t("ui.remove")}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <UploadIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="text-lg font-medium">
                    {isDragActive
                      ? t("fileUploader.dropHere")
                      : t("fileUploader.dragAndDrop")}
                  </div>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    {t("fileUploader.dropHereDesc")}
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="mt-2"
                  >
                    {t("ui.browse")}
                  </Button>
                </div>
              )}
            </div>

            {file && !extractedText && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("nav.selectLanguage")}</FormLabel>
                        <Select
                          disabled={isProcessing}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t("nav.selectLanguage")}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {OCR_LANGUAGES.map((lang) => (
                              <SelectItem key={lang.value} value={lang.value}>
                                {lang.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          {t("convert.options.ocrDescription")}
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pageRange"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("convert.options.pageOptions")}
                        </FormLabel>
                        <Select
                          disabled={isProcessing}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t("convert.options.pageOptions")}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">
                              {t("convert.options.allPages")}
                            </SelectItem>
                            <SelectItem value="specific">
                              {t("convert.options.selectedPages")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {pageRange === "specific" && (
                  <FormField
                    control={form.control}
                    name="pages"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("ocr.options.pages")}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t("convert.options.pageRangeExample")}
                            className="resize-none"
                            {...field}
                            disabled={isProcessing}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          {t("convert.options.pageRangeDescription")}
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">
                    {t("convert.options.title")}
                  </h3>

                  <FormField
                    control={form.control}
                    name="enhanceScanned"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isProcessing}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            {t("ocr.options.enhanceScanned")}
                          </FormLabel>
                          <p className="text-sm text-muted-foreground">
                            {t("ocr.options.enhanceScannedHint")}
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preserveLayout"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isProcessing}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            {t("ocr.options.preserveLayout")}
                          </FormLabel>
                          <p className="text-sm text-muted-foreground">
                            {t("ocr.options.preserveLayoutHint")}
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {(isUploading || isProcessing) && (
              <UploadProgress
                progress={progress}
                isUploading={isUploading}
                isProcessing={isProcessing}
                processingProgress={progress}
                error={uploadError}
                label={
                  isUploading
                    ? t("ocr.processing.title")
                    : t("ocr.processing.message")
                }
                uploadStats={uploadStats}
              />
            )}

            {extractedText && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">
                    {t("ocr.results.title")}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                    >
                      <CopyIcon className="h-4 w-4 mr-1" /> {t("ui.copy")}
                    </Button>
                    {textFile && (
                      <Button type="button" variant="outline" size="sm" asChild>
                        <a
                          href={`/api/file?folder=ocr&filename=${encodeURIComponent(
                            textFile.filename
                          )}`}
                          download
                        >
                          <DownloadIcon className="h-4 w-4 mr-1" />{" "}
                          {t("ocr.results.download")}
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
                <div className="border rounded-lg p-4 max-h-80 overflow-y-auto bg-muted/20">
                  <pre className="text-sm whitespace-pre-wrap font-sans">
                    {extractedText}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            {file && !extractedText && (
              <Button type="submit" disabled={isProcessing}>
                {isProcessing ? t("ui.processing") : t("ui.extract")}
              </Button>
            )}

            {extractedText && (
              <Button type="button" onClick={handleRemoveFile}>
                {t("ui.reupload")}
              </Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
