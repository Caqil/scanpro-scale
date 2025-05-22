"use client";

import { useState, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  FileIcon,
  Cross2Icon,
  CheckCircledIcon,
  CrossCircledIcon,
  DownloadIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import {
  AlertCircle,
  FileText,
  Zap,
  Settings,
  Archive,
  TrendingDown,
  Loader2,
  Check,
  X,
  Info,
  HardDrive,
  Gauge,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguageStore } from "@/src/store/store";
import JSZip from "jszip";
import { FileDropzone } from "./dropzone";
import { FileWithStatus } from "@/src/types/file-status";

// Form schema
const formSchema = z.object({
  quality: z.enum(["high", "medium", "low"]).default("medium"),
  processAllTogether: z.boolean().default(true),
});

interface CompressedFile {
  originalSize: number;
  compressedSize: number;
  compressionRatio: string;
  fileUrl: string;
  filename: string;
  originalName?: string;
}

type FormValues = z.infer<typeof formSchema>;

export function MultiPdfCompressor() {
  const { t } = useLanguageStore();
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [compressedFiles, setCompressedFiles] = useState<
    Record<string, CompressedFile>
  >({});
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quality: "medium",
      processAllTogether: true,
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (files.length === 0) {
      setError(t("compressPdf.error.noFiles"));
      return;
    }
    setIsProcessing(true);
    setError(null);
    values.processAllTogether
      ? await processAllFiles(values.quality)
      : await processFilesSequentially(values.quality);
    setIsProcessing(false);
  };

  const processAllFiles = async (quality: string) => {
    const compressionPromises = files
      .filter((fileItem) => fileItem.status !== "completed")
      .map((fileItem) => compressFile(fileItem.file, quality));
    await Promise.all(compressionPromises);
    toast.success(t("compressPdf.success"));
  };

  const processFilesSequentially = async (quality: string) => {
    const filesToProcess = files.filter(
      (fileItem) => fileItem.status !== "completed"
    );
    for (const fileItem of filesToProcess) {
      try {
        await compressFile(fileItem.file, quality);
      } catch (err) {
        console.error(`Failed to compress ${fileItem.file.name}:`, err);
      }
    }
    toast.success(t("compressPdf.success"));
  };

  const compressFile = async (file: File, quality: string): Promise<void> => {
    setFiles((prev) =>
      prev.map((f) =>
        f.file.name === file.name
          ? { ...f, status: "processing" as const, error: undefined }
          : f
      )
    );
    setProgress((prev) => ({ ...prev, [file.name]: 0 }));

    return new Promise((resolve, reject) => {
      try {
        const formData = new FormData();
        formData.append("file", file);

        let compressionQuality;
        switch (quality) {
          case "high":
            compressionQuality = "90";
            break;
          case "medium":
            compressionQuality = "70";
            break;
          case "low":
            compressionQuality = "40";
            break;
          default:
            compressionQuality = "70";
        }
        formData.append("quality", compressionQuality);
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/pdf/compress`;

        const xhr = new XMLHttpRequest();
        xhr.open("POST", apiUrl);
        xhr.setRequestHeader(
          "x-api-key",
          "sk_d6c1daa54dbc95956b281fa02c544e7273ed10df60b211fe"
        );

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            setProgress((prev) => ({
              ...prev,
              [file.name]: percentComplete / 2,
            }));
          }
        };

        xhr.onload = function () {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);

              setProgress((prev) => ({ ...prev, [file.name]: 100 }));

              setCompressedFiles((prev) => ({
                ...prev,
                [file.name]: {
                  originalSize: data.originalSize,
                  compressedSize: data.compressedSize,
                  compressionRatio: data.compressionRatio,
                  fileUrl: data.fileUrl,
                  filename: data.filename,
                  originalName: file.name,
                },
              }));

              setFiles((prev) =>
                prev.map((f) =>
                  f.file.name === file.name
                    ? { ...f, status: "completed" as const }
                    : f
                )
              );

              toast.success(t("compressPdf.success"), {
                description: `${file.name} ${t("compressPdf.reducedBy")} ${
                  data.compressionRatio
                }`,
              });

              resolve();
            } catch (parseError) {
              console.error("Error parsing response:", parseError);
              const errorMessage = t("compressPdf.error.unknown");
              setFiles((prev) =>
                prev.map((f) =>
                  f.file.name === file.name
                    ? { ...f, status: "error" as const, error: errorMessage }
                    : f
                )
              );
              setProgress((prev) => ({ ...prev, [file.name]: 0 }));
              toast.error(t("compressPdf.error.failed"), {
                description: errorMessage,
              });
              reject(parseError);
            }
          } else {
            let errorMessage = "Compression failed";
            try {
              const errorData = JSON.parse(xhr.responseText);
              errorMessage = errorData.error || errorMessage;
            } catch (jsonError) {
              console.error("Failed to parse error response:", jsonError);
            }
            errorMessage = `${errorMessage} (Status: ${xhr.status})`;

            setFiles((prev) =>
              prev.map((f) =>
                f.file.name === file.name
                  ? { ...f, status: "error" as const, error: errorMessage }
                  : f
              )
            );
            setProgress((prev) => ({ ...prev, [file.name]: 0 }));
            toast.error(t("compressPdf.error.failed"), {
              description: errorMessage,
            });
            reject(new Error(errorMessage));
          }
        };

        xhr.onerror = function () {
          const errorMessage = t("compressPdf.error.unknown");
          setFiles((prev) =>
            prev.map((f) =>
              f.file.name === file.name
                ? { ...f, status: "error" as const, error: errorMessage }
                : f
            )
          );
          setProgress((prev) => ({ ...prev, [file.name]: 0 }));
          toast.error(t("compressPdf.error.failed"), {
            description: errorMessage,
          });
          reject(new Error("Network error"));
        };

        xhr.send(formData);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : t("compressPdf.error.unknown");
        setFiles((prev) =>
          prev.map((f) =>
            f.file.name === file.name
              ? { ...f, status: "error" as const, error: errorMessage }
              : f
          )
        );
        setProgress((prev) => ({ ...prev, [file.name]: 0 }));
        toast.error(t("compressPdf.error.failed"), {
          description: errorMessage,
        });
        reject(err);
      }
    });
  };

  const handleRemoveFile = (fileName: string) => {
    setFiles((prev) => prev.filter((f) => f.file.name !== fileName));
    setProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[fileName];
      return newProgress;
    });
    setCompressedFiles((prev) => {
      const newCompressedFiles = { ...prev };
      if (newCompressedFiles[fileName]?.fileUrl) {
        URL.revokeObjectURL(newCompressedFiles[fileName].fileUrl);
      }
      delete newCompressedFiles[fileName];
      return newCompressedFiles;
    });
  };

  const formatFileSize = (sizeInBytes: number): string => {
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    if (sizeInBytes < 1024 * 1024)
      return `${(sizeInBytes / 1024).toFixed(2)} KB`;
    return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getTotalStats = useCallback(() => {
    if (Object.keys(compressedFiles).length === 0) return null;
    const totalOriginalSize = Object.values(compressedFiles).reduce(
      (sum, file) => sum + file.originalSize,
      0
    );
    const totalCompressedSize = Object.values(compressedFiles).reduce(
      (sum, file) => sum + file.compressedSize,
      0
    );
    const totalSaved = totalOriginalSize - totalCompressedSize;
    const compressionRatio = ((totalSaved / totalOriginalSize) * 100).toFixed(
      2
    );
    return {
      totalOriginalSize,
      totalCompressedSize,
      totalSaved,
      compressionRatio,
    };
  }, [compressedFiles]);

  const handleDownloadAllAsZip = async () => {
    const completedFiles = Object.values(compressedFiles);
    if (completedFiles.length === 0) {
      toast.error(t("compressPdf.error.noCompressed"));
      return;
    }

    try {
      const zip = new JSZip();
      const goApiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

      for (const file of completedFiles) {
        const fileUrl = file.fileUrl.startsWith("/")
          ? `${goApiUrl}${file.fileUrl}`
          : file.fileUrl;

        const response = await fetch(fileUrl);
        const blob = await response.blob();
        zip.file(file.filename, blob);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `compressed-pdfs-${
        new Date().toISOString().split("T")[0]
      }.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(t("compressPdf.zipDownloadSuccess"));
    } catch (err) {
      toast.error(t("compressPdf.error.downloadZip"), {
        description:
          err instanceof Error ? err.message : t("compressPdf.error.unknown"),
      });
    }
  };

  const totalStats = getTotalStats();
  const allFilesProcessed = files.every((f) => f.status === "completed");
  const anyFilesFailed = files.some((f) => f.status === "error");
  const completedCount = files.filter((f) => f.status === "completed").length;
  const processingCount = files.filter((f) => f.status === "processing").length;
  const overallProgress =
    files.length > 0
      ? (Object.values(progress).reduce((a, b) => a + b, 0) /
          (files.length * 100)) *
        100
      : 0;

  // Quality settings
  const qualityOptions = [
    {
      value: "high",
      label: "High Quality",
      description: "Best quality, larger file size",
      icon: "📄",
    },
    {
      value: "medium",
      label: "Medium Quality",
      description: "Balanced quality and size",
      icon: "⚖️",
    },
    {
      value: "low",
      label: "Maximum Compression",
      description: "Smallest file size",
      icon: "🗜️",
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingDown className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Multi PDF Compressor</h1>
              <p className="text-muted-foreground font-normal mt-1">
                Compress multiple PDF files efficiently to reduce file sizes
              </p>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <Form {...form}>
        <div className="space-y-6">
          {/* Settings Panel */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Compression Settings
              </CardTitle>
              <CardDescription>
                Configure compression quality and processing options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quality Selection */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="quality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Compression Quality
                      </FormLabel>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                        {qualityOptions.map((option) => (
                          <div
                            key={option.value}
                            className={cn(
                              "relative p-4 border rounded-lg cursor-pointer transition-all hover:border-primary/50",
                              field.value === option.value
                                ? "border-primary bg-primary/5"
                                : "border-muted-foreground/20"
                            )}
                            onClick={() => field.onChange(option.value)}
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-2xl">{option.icon}</span>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    checked={field.value === option.value}
                                    onChange={() =>
                                      field.onChange(option.value)
                                    }
                                    className="text-primary"
                                  />
                                  <Label className="font-medium cursor-pointer">
                                    {option.label}
                                  </Label>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {option.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Processing Options */}
              <FormField
                control={form.control}
                name="processAllTogether"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-start space-x-3 space-y-0 rounded-lg border p-4 bg-muted/20">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isProcessing}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none flex-1">
                        <FormLabel className="flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Process All Files Simultaneously
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Enable parallel processing for faster compression of
                          multiple files. Disable for sequential processing if
                          you have limited system resources.
                        </p>
                      </div>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* File Upload Area */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                PDF Files
              </CardTitle>
              <CardDescription>
                Upload multiple PDF files to compress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileDropzone
                multiple={true}
                disabled={isProcessing}
                acceptedFileTypes={{ "application/pdf": [".pdf"] }}
                onFileAccepted={(acceptedFiles) => {
                  setFiles((prev) => {
                    const existingFileNames = new Set(
                      prev.map((f) => f.file.name)
                    );
                    const newFiles = acceptedFiles
                      .filter((file) => !existingFileNames.has(file.name))
                      .map((file) => ({ file, status: "idle" as const }));
                    return [...prev, ...newFiles];
                  });
                  setError(null);
                }}
                title="Upload PDF Files"
                description="Drop your PDF files here or browse to select multiple files"
                browseButtonText="Browse Files"
                browseButtonVariant="default"
                securityText="Your files are processed securely and automatically deleted after compression"
              />
            </CardContent>
          </Card>

          {/* Files List */}
          {files.length > 0 && (
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Archive className="h-5 w-5 text-primary" />
                      Files Queue ({files.length})
                    </CardTitle>
                    <CardDescription>
                      {completedCount > 0 && `${completedCount} completed`}
                      {processingCount > 0 && `, ${processingCount} processing`}
                    </CardDescription>
                  </div>
                  {!isProcessing && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        Object.values(compressedFiles).forEach((file) => {
                          if (file.fileUrl) URL.revokeObjectURL(file.fileUrl);
                        });
                        setFiles([]);
                        setCompressedFiles({});
                        setProgress({});
                      }}
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Clear All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {files.map((fileItem, index) => {
                    const compressed = compressedFiles[fileItem.file.name];
                    const fileProgress = progress[fileItem.file.name] || 0;

                    return (
                      <div
                        key={fileItem.file.name}
                        className={cn(
                          "p-4 border rounded-lg transition-all",
                          fileItem.status === "completed" &&
                            "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-900/10",
                          fileItem.status === "processing" &&
                            "border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-900/10",
                          fileItem.status === "error" &&
                            "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-900/10",
                          fileItem.status === "idle" &&
                            "border-muted-foreground/20"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          {/* File Icon */}
                          <div
                            className={cn(
                              "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0",
                              fileItem.status === "completed" &&
                                "bg-green-100 dark:bg-green-900/30",
                              fileItem.status === "processing" &&
                                "bg-blue-100 dark:bg-blue-900/30",
                              fileItem.status === "error" &&
                                "bg-red-100 dark:bg-red-900/30",
                              fileItem.status === "idle" && "bg-muted/50"
                            )}
                          >
                            {fileItem.status === "processing" ? (
                              <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
                            ) : fileItem.status === "completed" ? (
                              <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                            ) : fileItem.status === "error" ? (
                              <X className="h-5 w-5 text-red-600 dark:text-red-400" />
                            ) : (
                              <FileIcon className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>

                          {/* File Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium truncate">
                                {fileItem.file.name}
                              </p>
                              {fileItem.status === "completed" && (
                                <Badge
                                  variant="outline"
                                  className="bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                                >
                                  <CheckCircledIcon className="h-3 w-3 mr-1" />
                                  Completed
                                </Badge>
                              )}
                              {fileItem.status === "processing" && (
                                <Badge
                                  variant="outline"
                                  className="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                                >
                                  <Gauge className="h-3 w-3 mr-1" />
                                  Processing
                                </Badge>
                              )}
                              {fileItem.status === "error" && (
                                <Badge
                                  variant="outline"
                                  className="bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                                >
                                  <CrossCircledIcon className="h-3 w-3 mr-1" />
                                  Failed
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{formatFileSize(fileItem.file.size)}</span>
                              {compressed && (
                                <>
                                  <span>→</span>
                                  <span className="text-green-600 dark:text-green-400 font-medium">
                                    {formatFileSize(compressed.compressedSize)}
                                  </span>
                                  <Badge
                                    variant="secondary"
                                    className="text-green-600 dark:text-green-400"
                                  >
                                    -{compressed.compressionRatio}
                                  </Badge>
                                </>
                              )}
                            </div>

                            {/* Progress Bar */}
                            {fileItem.status === "processing" && (
                              <div className="mt-2 flex items-center gap-2">
                                <Progress
                                  value={fileProgress}
                                  className="h-2 flex-1"
                                />
                                <span className="text-xs text-muted-foreground min-w-[3rem]">
                                  {Math.round(fileProgress)}%
                                </span>
                              </div>
                            )}

                            {/* Error Message */}
                            {fileItem.status === "error" && fileItem.error && (
                              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                {fileItem.error}
                              </p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            {fileItem.status === "completed" && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                asChild
                              >
                                <a
                                  href={`${process.env.NEXT_PUBLIC_API_URL}${compressed?.fileUrl}`}
                                  download={compressed?.filename}
                                >
                                  <DownloadIcon className="h-4 w-4 mr-1" />
                                  Download
                                </a>
                              </Button>
                            )}

                            {(fileItem.status === "idle" ||
                              fileItem.status === "error") &&
                              !isProcessing && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleRemoveFile(fileItem.file.name)
                                  }
                                >
                                  <Cross2Icon className="h-4 w-4" />
                                </Button>
                              )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>

              {/* Process Button */}
              <CardFooter className="border-t pt-6">
                <div className="w-full space-y-4">
                  {/* Overall Progress */}
                  {isProcessing && files.length > 1 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Overall Progress
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {completedCount} of {files.length} completed
                        </span>
                      </div>
                      <Progress value={overallProgress} className="h-2" />
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={files.length === 0 || isProcessing}
                    size="lg"
                    className="w-full"
                    onClick={form.handleSubmit(onSubmit)}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Compressing Files...
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-4 w-4 mr-2" />
                        Compress All Files ({files.length})
                      </>
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )}

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Results Summary */}
          {totalStats &&
            files.length > 1 &&
            (allFilesProcessed || anyFilesFailed) && (
              <Card className="border-green-200 dark:border-green-900">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Check className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">
                        Compression Complete!
                      </h3>
                      <p className="text-muted-foreground font-normal mt-1">
                        Successfully compressed {completedCount} of{" "}
                        {files.length} files
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Statistics Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-muted/20 rounded-lg">
                      <HardDrive className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Original Size
                      </p>
                      <p className="text-lg font-bold">
                        {formatFileSize(totalStats.totalOriginalSize)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-muted/20 rounded-lg">
                      <TrendingDown className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground">
                        Compressed Size
                      </p>
                      <p className="text-lg font-bold">
                        {formatFileSize(totalStats.totalCompressedSize)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <Archive className="h-6 w-6 mx-auto mb-2 text-green-600 dark:text-green-400" />
                      <p className="text-sm text-muted-foreground">
                        Space Saved
                      </p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        {formatFileSize(totalStats.totalSaved)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <Gauge className="h-6 w-6 mx-auto mb-2 text-green-600 dark:text-green-400" />
                      <p className="text-sm text-muted-foreground">Reduction</p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        {totalStats.compressionRatio}%
                      </p>
                    </div>
                  </div>

                  {/* Download All Button */}
                  {allFilesProcessed && files.length > 1 && (
                    <Button
                      type="button"
                      variant="default"
                      size="lg"
                      className="w-full"
                      onClick={handleDownloadAllAsZip}
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      Download All as ZIP
                    </Button>
                  )}
                </CardContent>

                <CardFooter className="border-t bg-muted/20">
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p>
                      Your files are processed securely and automatically
                      deleted after compression to ensure privacy. All
                      compression is performed server-side with optimized
                      algorithms.
                    </p>
                  </div>
                </CardFooter>
              </Card>
            )}
        </div>
      </Form>
    </div>
  );
}
