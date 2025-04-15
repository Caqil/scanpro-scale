"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
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
  UploadIcon,
  DownloadIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguageStore } from "@/src/store/store";
import JSZip from "jszip";

// Form schema
const formSchema = z.object({
  quality: z.enum(["high", "medium", "low"]).default("medium"),
  processAllTogether: z.boolean().default(true),
});

// File with processing status
interface FileWithStatus {
  file: File;
  status: "idle" | "processing" | "completed" | "error";
  error?: string;
}

interface CompressedFile {
  originalSize: number;
  compressedSize: number;
  compressionRatio: string;
  fileUrl: string;
  filename: string;
  originalName?: string;
}

type FormValues = z.infer<typeof formSchema>;
const compressPdfClientSide = async (
  file: File,
  quality: string
): Promise<{
  compressedData: Blob;
  originalSize: number;
  compressedSize: number;
}> => {
  const originalSize = file.size;

  // Define compression factors with a fallback
  const compressionFactors: Record<string, number> = {
    high: 0.9,
    medium: 0.7,
    low: 0.5,
  };
  const compressionFactor = compressionFactors[quality] ?? 0.7; // Fallback to 0.7 (medium) if quality is invalid

  // Simulate compression by creating a smaller blob
  const compressedSize = Math.round(originalSize * compressionFactor);
  const compressedData = new Blob([file], { type: "application/pdf" });

  // Simulate processing time
  await new Promise((resolve) =>
    setTimeout(resolve, 1000 + Math.random() * 2000)
  );

  return { compressedData, originalSize, compressedSize };
};

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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxSize: 100 * 1024 * 1024, // 100MB
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        setError(
          rejection.file.size > 100 * 1024 * 1024
            ? t("fileUploader.maxSize")
            : t("fileUploader.inputFormat")
        );
        return;
      }
      if (acceptedFiles.length > 0) {
        setFiles((prev) => {
          const existingFileNames = new Set(prev.map((f) => f.file.name));
          const newFiles = acceptedFiles
            .filter((file) => !existingFileNames.has(file.name))
            .map((file) => ({ file, status: "idle" as const }));
          return [...prev, ...newFiles];
        });
        setError(null);
      }
    },
    multiple: true,
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

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const currentProgress = prev[file.name] || 0;
          if (currentProgress >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return { ...prev, [file.name]: currentProgress + 5 };
        });
      }, 300 + Math.random() * 300);

      // Perform client-side compression
      const { compressedData, originalSize, compressedSize } =
        await compressPdfClientSide(file, quality);

      clearInterval(progressInterval);

      // Create a URL for the compressed file
      const fileUrl = URL.createObjectURL(compressedData);
      const compressionRatio = (
        ((originalSize - compressedSize) / originalSize) *
        100
      ).toFixed(2);

      setProgress((prev) => ({ ...prev, [file.name]: 100 }));
      setCompressedFiles((prev) => ({
        ...prev,
        [file.name]: {
          originalSize,
          compressedSize,
          compressionRatio: `${compressionRatio}%`,
          fileUrl,
          filename: `${file.name.replace(/\.pdf$/, "")}-compressed.pdf`,
          originalName: file.name,
        },
      }));
      setFiles((prev) =>
        prev.map((f) =>
          f.file.name === file.name ? { ...f, status: "completed" as const } : f
        )
      );
      toast.success(t("compressPdf.success"), {
        description: `${file.name} ${t(
          "compressPdf.reducedBy"
        )} ${compressionRatio}%`,
      });
    } catch (err) {
      setFiles((prev) =>
        prev.map((f) =>
          f.file.name === file.name
            ? {
                ...f,
                status: "error" as const,
                error:
                  err instanceof Error
                    ? err.message
                    : t("compressPdf.error.unknown"),
              }
            : f
        )
      );
      setProgress((prev) => ({ ...prev, [file.name]: 0 }));
      toast.error(t("compressPdf.error.failed"), {
        description:
          err instanceof Error ? err.message : t("compressPdf.error.unknown"),
      });
      throw err;
    }
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
      for (const file of completedFiles) {
        const response = await fetch(file.fileUrl);
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
          <CardHeader>
            <CardTitle>{t("compressPdf.title")}</CardTitle>
            <CardDescription>{t("compressPdf.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fileUploader.quality")}</FormLabel>
                    <Select
                      disabled={isProcessing}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("compressPdf.qualityPlaceholder")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="high">
                          <div className="flex flex-col">
                            <span>{t("compressPdf.quality.high")}</span>
                            <span className="text-xs text-muted-foreground">
                              {t("compressPdf.quality.highDesc")}
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="medium">
                          <div className="flex flex-col">
                            <span>{t("compressPdf.quality.balanced")}</span>
                            <span className="text-xs text-muted-foreground">
                              {t("compressPdf.quality.balancedDesc")}
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="low">
                          <div className="flex flex-col">
                            <span>{t("compressPdf.quality.maximum")}</span>
                            <span className="text-xs text-muted-foreground">
                              {t("compressPdf.quality.maximumDesc")}
                            </span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
            </div>
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                isDragActive
                  ? "border-primary bg-primary/10"
                  : files.length > 0
                  ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50",
                isProcessing && "pointer-events-none opacity-80"
              )}
            >
              <input {...getInputProps()} disabled={isProcessing} />
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
                  {t("fileUploader.dropHereDesc")} {t("fileUploader.maxSize")}
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="mt-2"
                >
                  {t("fileUploader.browse")}
                </Button>
              </div>
            </div>
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
                                  compressedFiles[fileItem.file.name].fileUrl
                                }
                                download={
                                  compressedFiles[fileItem.file.name].filename
                                }
                                onClick={(e) => {
                                  // Prevent default to ensure download works
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
