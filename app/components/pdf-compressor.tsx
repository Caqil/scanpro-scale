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
import {
  FileIcon,
  Cross2Icon,
  CheckCircledIcon,
  CrossCircledIcon,
  DownloadIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { AlertCircle } from "lucide-react";
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

        // Map UI quality levels to the numeric values expected by the Go API
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
        const apiUrl = `${process.env.NEXT_PUBLIC_GO_API_URL}/api/pdf/compress`;
        console.log("Submitting to Go API URL:", apiUrl);
        console.log("File name:", file.name, "File size:", file.size);
        console.log("Quality setting:", compressionQuality);

        // Create a new XHR request
        const xhr = new XMLHttpRequest();
        xhr.open("POST", apiUrl);
        xhr.setRequestHeader(
          "x-api-key",
          "sk_f31cd57d242139773df0110592133eefe90cdd253296cad0"
        );

        // Track upload progress
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            // Update progress for upload phase (0–50%)
            setProgress((prev) => ({
              ...prev,
              [file.name]: percentComplete / 2,
            }));
          }
        };

        // Handle completion
        xhr.onload = function () {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              console.log("API response:", data);

              // Update progress to complete
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

        // Handle network errors
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

        // Send the request
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
        process.env.NEXT_PUBLIC_GO_API_URL || "http://localhost:8080";

      for (const file of completedFiles) {
        // Make sure to prepend the Go API URL if the fileUrl is a relative path
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border shadow-sm">
          <CardContent className="pt-6 space-y-6">
            <FormField
              control={form.control}
              name="processAllTogether"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isProcessing}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>{t("compressPdf.processing.title")}</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      {t("compressPdf.processing.processAllTogether")}
                    </p>
                  </div>
                </FormItem>
              )}
            />
            <FileDropzone
              multiple={true}
              disabled={isProcessing}
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
              title={t("fileUploader.dragAndDrop")}
              description={`${t("fileUploader.dropHereDesc")} ${t(
                "fileUploader.maxSize"
              )}`}
              browseButtonText={t("fileUploader.browse")}
              browseButtonVariant="secondary"
              securityText={t("fileUploader.filesSecurity")}
            />
            {files.length > 0 && (
              <div className="border rounded-lg">
                <div className="p-3 border-b bg-muted/30 flex justify-between items-center">
                  <h3 className="font-medium">
                    {t("compressPdf.filesToCompress")} ({files.length})
                  </h3>
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
                      <TrashIcon className="h-4 w-4 mr-1" /> {t("ui.clearAll")}
                    </Button>
                  )}
                </div>
                <div className="divide-y overflow-y-auto max-h-[300px]">
                  {files.map((fileItem) => (
                    <div
                      key={fileItem.file.name}
                      className="p-3 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="h-9 w-9 rounded-md bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                          <FileIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {fileItem.file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(fileItem.file.size)}
                            {compressedFiles[fileItem.file.name] && (
                              <span className="ml-2 text-green-600 dark:text-green-400">
                                →{" "}
                                {formatFileSize(
                                  compressedFiles[fileItem.file.name]
                                    .compressedSize
                                )}{" "}
                                (
                                {
                                  compressedFiles[fileItem.file.name]
                                    .compressionRatio
                                }{" "}
                                {t("compressPdf.reduction")})
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {fileItem.status === "idle" && !isProcessing && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveFile(fileItem.file.name)}
                          >
                            <Cross2Icon className="h-4 w-4" />
                          </Button>
                        )}
                        {fileItem.status === "processing" && (
                          <div className="flex items-center gap-2 min-w-32">
                            <Progress
                              value={progress[fileItem.file.name] || 0}
                              className="h-2 w-20"
                            />
                            <span className="text-xs text-muted-foreground">
                              {progress[fileItem.file.name] || 0}%
                            </span>
                          </div>
                        )}
                        {fileItem.status === "completed" && (
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                            >
                              <CheckCircledIcon className="h-3 w-3 mr-1" />{" "}
                              {t("compressPdf.status.completed")}
                            </Badge>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              asChild
                              className="text-sm"
                            >
                              <a
                                href={
                                  `${process.env.NEXT_PUBLIC_GO_API_URL}` +
                                  compressedFiles[fileItem.file.name].fileUrl
                                }
                                download={
                                  compressedFiles[fileItem.file.name].filename
                                }
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                              >
                                <DownloadIcon className="h-3.5 w-3.5 mr-1" />{" "}
                                {t("ui.download")}
                              </a>
                            </Button>
                          </div>
                        )}
                        {fileItem.status === "error" && (
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                            >
                              <CrossCircledIcon className="h-3 w-3 mr-1" />{" "}
                              {t("compressPdf.status.failed")}
                            </Badge>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleRemoveFile(fileItem.file.name)
                              }
                            >
                              <Cross2Icon className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              type="submit"
              disabled={files.length === 0 || isProcessing}
              className="min-w-32"
            >
              {isProcessing ? t("ui.processing") : t("compressPdf.compressAll")}
            </Button>
          </CardFooter>
        </Card>
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {isProcessing && files.length > 1 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {t("compressPdf.overallProgress")}
              </span>
              <span className="text-sm text-muted-foreground">
                {Object.values(progress).filter((p) => p === 100).length}{" "}
                {t("compressPdf.of")} {files.length} {t("compressPdf.files")}
              </span>
            </div>
            <Progress
              value={
                (Object.values(progress).reduce((a, b) => a + b, 0) /
                  (files.length * 100)) *
                100
              }
              className="h-2"
            />
          </div>
        )}
        {totalStats &&
          files.length > 1 &&
          (allFilesProcessed || anyFilesFailed) && (
            <Card className="border-green-200 dark:border-green-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-green-600 dark:text-green-400 flex items-center gap-2">
                  <CheckCircledIcon className="h-5 w-5" />{" "}
                  {t("compressPdf.results.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      {t("compressPdf.results.totalOriginal")}
                    </p>
                    <p className="text-lg font-semibold">
                      {formatFileSize(totalStats.totalOriginalSize)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      {t("compressPdf.results.totalCompressed")}
                    </p>
                    <p className="text-lg font-semibold">
                      {formatFileSize(totalStats.totalCompressedSize)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      {t("compressPdf.results.spaceSaved")}
                    </p>
                    <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                      {formatFileSize(totalStats.totalSaved)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      {t("compressPdf.results.averageReduction")}
                    </p>
                    <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                      {totalStats.compressionRatio}%
                    </p>
                  </div>
                </div>
                {allFilesProcessed && files.length > 1 && (
                  <Button
                    className="w-full"
                    type="button"
                    variant="outline"
                    onClick={handleDownloadAllAsZip}
                  >
                    <DownloadIcon className="h-4 w-4 mr-2" />{" "}
                    {t("compressPdf.results.downloadAll")}
                  </Button>
                )}
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                {t("fileUploader.filesSecurity")}
              </CardFooter>
            </Card>
          )}
      </form>
    </Form>
  );
}
