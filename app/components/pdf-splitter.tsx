"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CheckCircledIcon, DownloadIcon } from "@radix-ui/react-icons";
import { AlertCircle, FileTextIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLanguageStore } from "@/src/store/store";
import { UploadProgress } from "@/components/ui/upload-progress";
import useFileUpload from "@/hooks/useFileUpload";
import { FileDropzone } from "@/components/dropzone";

// Form schema
const formSchema = z.object({
  splitMethod: z.enum(["range", "extract", "every"]).default("range"),
  pageRanges: z.string().optional(),
  everyNPages: z.coerce.number().min(1).default(1),
});

type FormValues = z.infer<typeof formSchema>;

// Define a type for split results
interface SplitPart {
  fileUrl: string;
  filename: string;
  pages: number[];
  pageCount: number;
}

interface SplitResult {
  success: boolean;
  message: string;
  originalName?: string;
  totalPages?: number;
  splitParts?: SplitPart[];
  isLargeJob?: boolean;
  jobId?: string;
  statusUrl?: string;
  results?: SplitPart[]; // For status API responses
}

// Status polling interface
interface JobStatus {
  id: string;
  status: "processing" | "completed" | "error";
  progress: number;
  total: number;
  completed: number;
  results: SplitPart[];
  error: string | null;
}

export function PdfSplitter() {
  const { t } = useLanguageStore();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [splitResult, setSplitResult] = useState<SplitResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);

  // For large job status polling
  const [jobId, setJobId] = useState<string | null>(null);
  const [statusUrl, setStatusUrl] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
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
      splitMethod: "range",
      pageRanges: "",
      everyNPages: 1,
    },
  });

  // Watch fields for conditional rendering
  const splitMethod = form.watch("splitMethod");

  // Function to examine PDF and get page count
  const examineFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/pdf/info", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.pageCount) {
          setTotalPages(data.pageCount);
        }
      }
    } catch (error) {
      console.error("Error getting PDF info:", error);
    }
  };

  // Handle file acceptance from FileDropzone
  const handleFileAccepted = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const newFile = acceptedFiles[0];
      setFile(newFile);
      setSplitResult(null);
      setError(null);
      setJobId(null);
      setStatusUrl(null);
      setIsPolling(false);
      resetUpload();

      // Estimate number of pages based on file size for better UX
      const fileSizeInMB = newFile.size / (1024 * 1024);
      const estimatedPages = Math.max(1, Math.round(fileSizeInMB * 10));
      setTotalPages(estimatedPages);

      // Examine file to get actual page count
      examineFile(newFile);
    }
  };

  // Handle file removal
  const handleRemoveFile = () => {
    setFile(null);
    setSplitResult(null);
    setError(null);
    setTotalPages(0);
    setJobId(null);
    setStatusUrl(null);
    setIsPolling(false);
    setProgress(0);
  };

  // Retry counter for status polling
  const [retryCount, setRetryCount] = useState(0);

  // Poll for job status
  const pollJobStatus = useCallback(async () => {
    if (!statusUrl || !jobId) return;

    try {
      const response = await fetch(statusUrl);
      if (!response.ok) {
        throw new Error(`Error fetching status: ${response.status}`);
      }

      const status: JobStatus = await response.json();

      // Update progress for splitting phase (50–100%)
      const splittingProgress = 50 + status.progress / 2; // Map 0–100 to 50–100
      setProgress(splittingProgress);

      if (status.status === "completed") {
        // Job completed successfully
        setIsPolling(false);
        setIsProcessing(false);
        setProgress(100);

        // Create a split result from job status
        const result: SplitResult = {
          success: true,
          message: `PDF split into ${status.results.length} files`,
          originalName: file?.name || "document.pdf",
          totalPages: totalPages,
          results: status.results,
        };

        setSplitResult(result);
        toast.success(t("splitPdf.success"), {
          description: t("splitPdf.successDesc"),
        });
      } else if (status.status === "error") {
        // Job failed
        setIsPolling(false);
        setIsProcessing(false);
        setError(status.error || t("splitPdf.error.failed"));
        setProgress(0);
        toast.error(t("splitPdf.error.failed"), {
          description: status.error || t("splitPdf.error.unknown"),
        });
      } else {
        // Job still processing, continue polling
        setTimeout(pollJobStatus, 2000);
      }
    } catch (err) {
      console.error("Error polling job status:", err);
      if (retryCount < 5) {
        setRetryCount((prev) => prev + 1);
        setTimeout(pollJobStatus, 3000);
      } else {
        setIsPolling(false);
        setIsProcessing(false);
        setError(t("splitPdf.error.statusFailed"));
        setProgress(0);
        toast.error(t("splitPdf.error.failed"));
      }
    }
  }, [statusUrl, jobId, file, totalPages, t, retryCount]);

  // Start polling when status URL is available
  useEffect(() => {
    if (statusUrl && jobId && isPolling) {
      pollJobStatus();
    }

    return () => {
      setRetryCount(0);
    };
  }, [statusUrl, jobId, isPolling, pollJobStatus]);

  // Submit handler
  const onSubmit = async (values: FormValues) => {
    if (!file) {
      setError(t("splitPdf.error.noFile"));
      return;
    }

    setIsProcessing(false);
    setProgress(0);
    setError(null);
    setSplitResult(null);
    setJobId(null);
    setStatusUrl(null);
    setIsPolling(false);
    setRetryCount(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("splitMethod", values.splitMethod);

    if (values.splitMethod === "range" && values.pageRanges) {
      formData.append("pageRanges", values.pageRanges);
    } else if (values.splitMethod === "every") {
      formData.append("everyNPages", values.everyNPages.toString());
    }

    uploadFile(file, formData, {
      url: "/api/pdf/split",
      onProgress: (progress) => {
        // Update progress for upload phase (0–50%)
        setProgress(progress / 2);
      },
      onSuccess: async (data) => {
        // Upload complete, start processing phase
        setIsProcessing(true);

        if (data.isLargeJob && data.jobId && data.statusUrl) {
          // Large job: start polling
          setJobId(data.jobId);
          setStatusUrl(data.statusUrl);
          setIsPolling(true);

          toast.info(t("splitPdf.largeSplitStarted"), {
            description: t("splitPdf.largeSplitDesc"),
          });
        } else {
          // Small job: immediate result
          setProgress(100);
          setSplitResult(data);
          setIsProcessing(false);

          toast.success(t("splitPdf.splitSuccess"), {
            description: t("splitPdf.splitSuccessDesc").replace(
              "{count}",
              getPartsCount(data).toString()
            ),
          });
        }
      },
      onError: (err) => {
        setError(err.message || t("splitPdf.error.unknown"));
        setProgress(0);
        setIsProcessing(false);

        toast.error(t("splitPdf.error.failed"), {
          description: err.message || t("splitPdf.error.unknown"),
        });
      },
    });
  };

  // Helper function to get split parts safely
  const getSplitParts = useCallback(
    (result: SplitResult | null): SplitPart[] => {
      if (!result) return [];
      if (result.results && Array.isArray(result.results)) {
        return result.results;
      }
      if (result.splitParts && Array.isArray(result.splitParts)) {
        return result.splitParts;
      }
      return [];
    },
    []
  );

  // Get parts count safely
  const getPartsCount = useCallback(
    (result: SplitResult | null): number => {
      return getSplitParts(result).length;
    },
    [getSplitParts]
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>{t("splitPdf.title")}</CardTitle>
            <CardDescription>{t("splitPdf.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Drop Zone with FileDropzone component */}
            {!splitResult && (
              <FileDropzone
                multiple={false}
                acceptedFileTypes={{ "application/pdf": [".pdf"] }}
                disabled={isUploading || isProcessing || isPolling}
                maxFiles={1}
                onFileAccepted={handleFileAccepted}
                value={file}
                onRemove={handleRemoveFile}
                title={
                  t("fileUploader.dragAndDrop") || "Drag & drop your PDF file"
                }
                description={`${
                  t("fileUploader.dropHereDesc") ||
                  "Drop your PDF file here or click to browse."
                } ${t("fileUploader.maxSize") || "Maximum size is 100MB."}`}
                browseButtonText={t("fileUploader.browse") || "Browse Files"}
                browseButtonVariant="default"
                securityText={
                  t("fileUploader.filesSecurity") ||
                  "Your files are processed securely."
                }
                renderFilePreview={(file) => (
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                      <FileTextIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {totalPages > 0
                          ? `${totalPages} ${t("removePdf.page")}`
                          : ""}
                      </p>
                    </div>
                  </div>
                )}
              />
            )}

            {/* Split Options */}
            {file && !splitResult && (
              <div>
                <FormField
                  control={form.control}
                  name="splitMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>{t("splitPdf.options.splitMethod")}</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                          disabled={isUploading || isProcessing}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="range" id="range-option" />
                            <label
                              htmlFor="range-option"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {t("splitPdf.options.byRange")}
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="extract"
                              id="extract-option"
                            />
                            <label
                              htmlFor="extract-option"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {t("splitPdf.options.extractAll")}
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="every" id="every-option" />
                            <label
                              htmlFor="every-option"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {t("splitPdf.options.everyNPages")}
                            </label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {splitMethod === "range" && (
                  <FormField
                    control={form.control}
                    name="pageRanges"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>
                          {t("splitPdf.options.pageRanges")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Example: 1-5, 8, 11-13"
                            {...field}
                            disabled={isUploading || isProcessing}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t("splitPdf.options.pageRangesHint")}
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {splitMethod === "every" && (
                  <FormField
                    control={form.control}
                    name="everyNPages"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>
                          {t("splitPdf.options.everyNPagesNumber")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={totalPages}
                            {...field}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              if (!isNaN(value) && value > 0) {
                                field.onChange(value);
                              }
                            }}
                            disabled={isUploading || isProcessing}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t("splitPdf.options.everyNPagesHint")}
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}

            {/* Error Message */}
            {(error || uploadError) && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>uploadError</AlertDescription>
              </Alert>
            )}
            {/* Progress Indicator */}
            {(isUploading || isProcessing || isPolling) && (
              <UploadProgress
                progress={progress}
                isUploading={isUploading}
                isProcessing={isProcessing || isPolling}
                label={
                  isUploading
                    ? t("ocr.uploading")
                    : isPolling
                    ? t("splitPdf.splittingLarge")
                    : t("splitPdf.splitting")
                }
                error={uploadError}
                uploadStats={isUploading ? uploadStats : undefined} // Only show stats during upload
              />
            )}

            {/* Results */}
            {splitResult && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/30">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <CheckCircledIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-green-600 dark:text-green-400">
                        {t("splitPdf.splitSuccess")}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 mb-3">
                        {t("splitPdf.splitSuccessDesc").replace(
                          "{count}",
                          getPartsCount(splitResult).toString()
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium">{t("splitPdf.results.title")}</h3>
                  <div className="divide-y border rounded-md max-h-[400px] overflow-y-auto">
                    {getSplitParts(splitResult).map((part, index) => (
                      <div
                        key={index}
                        className="p-3 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 flex-shrink-0 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <FileTextIcon className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {t("splitPdf.results.part")} {index + 1}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {t("splitPdf.results.pages")}:{" "}
                              {part.pages.join(", ")} ({part.pageCount}{" "}
                              {t("splitPdf.results.pagesCount")})
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a href={part.fileUrl} download target="_blank">
                            <DownloadIcon className="h-4 w-4 mr-1" />{" "}
                            {t("ui.download")}
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  {t("fileUploader.filesSecurity")}
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            {file &&
              !splitResult &&
              !isUploading &&
              !isProcessing &&
              !isPolling && (
                <Button type="submit" disabled={isUploading || isProcessing}>
                  {t("splitPdf.splitDocument")}
                </Button>
              )}

            {(splitResult || isUploading || isProcessing || isPolling) && (
              <Button
                variant="outline"
                onClick={() => {
                  setFile(null);
                  setSplitResult(null);
                  setIsPolling(false);
                  setJobId(null);
                  setStatusUrl(null);
                  setProgress(0);
                  form.reset();
                }}
                disabled={isUploading || isProcessing}
              >
                {t("ui.reupload")}
              </Button>
            )}
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
