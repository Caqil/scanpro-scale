"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileIcon,
  Cross2Icon,
  CheckCircledIcon,
  UploadIcon,
  DownloadIcon,
} from "@radix-ui/react-icons";
import { AlertCircle, UnlockIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLanguageStore } from "@/src/store/store";
import useFileUpload from "@/hooks/useFileUpload";
import { UploadProgress } from "./ui/upload-progress";

// Define form schema
const formSchema = z.object({
  password: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function PdfUnlocker() {
  const { t } = useLanguageStore();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [unlockedFileUrl, setUnlockedFileUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPasswordProtected, setIsPasswordProtected] = useState<
    boolean | null
  >(null);
  // Use our custom upload hook
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
      password: "",
    },
  });

  // Set up dropzone for PDF files only
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    maxFiles: 1,
    onDrop: async (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.file.size > 100 * 1024 * 1024) {
          setError(t("unlockPdf.fileTooBig"));
        } else {
          setError(t("unlockPdf.invalidFile"));
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const pdfFile = acceptedFiles[0];
        setFile(pdfFile);
        setUnlockedFileUrl(null);
        setError(null);

        // Check if the PDF is password protected
        setIsProcessing(true);
        try {
          const formData = new FormData();
          formData.append("file", pdfFile);
          formData.append("checkOnly", "true");

          const response = await fetch("/api/pdf/unlock/check", {
            method: "POST",
            body: formData,
          });

          const data = await response.json();
          setIsPasswordProtected(data.isPasswordProtected);

          if (!data.isPasswordProtected) {
            toast.info(t("unlockPdf.notPasswordProtected"), {
              description: t("unlockPdf.noPasswordNeeded"),
            });
          }
        } catch (err) {
          console.error("Error checking password protection:", err);
          // Default to assuming it might be password protected if check fails
          setIsPasswordProtected(true);
        } finally {
          setIsProcessing(false);
        }
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
    setUnlockedFileUrl(null);
    setError(null);
    setIsPasswordProtected(null);
    form.reset();
  };
  const onSubmit = async (values: FormValues) => {
    if (!file) {
      setError(t("unlockPdf.noFileSelected"));
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setUnlockedFileUrl(null);

    const formData = new FormData();
    formData.append("file", file);
    if (values.password) {
      formData.append("password", values.password);
    }

    try {
      await uploadFile(file, formData, {
        url: "/api/pdf/unlock",
        onProgress: (progress) => {
          setProgress(progress);
        },
        onSuccess: (data) => {
          setProgress(100);
          setUnlockedFileUrl(data.filename);
          toast.success(t("unlockPdf.unlockSuccess"), {
            description: data.message || t("unlockPdf.unlockSuccessDesc"),
          });
        },
        onError: (err) => {
          setError(err.message || t("unlockPdf.unknownError"));
          toast.error(t("unlockPdf.unlockFailed"), {
            description: err.message || t("unlockPdf.unknownError"),
          });
        },
      });
    } catch (err) {
      setError(t("unlockPdf.unknownError"));
      toast.error(t("unlockPdf.unlockFailed"), {
        description: t("unlockPdf.unknownError"),
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle>{t("unlockPdf.title")}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* File Drop Zone */}
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
                      {formatFileSize(file.size)}
                      {isPasswordProtected !== null &&
                        (isPasswordProtected
                          ? ` • ${t("unlockPdf.passwordProtected")}`
                          : ` • ${t("unlockPdf.notPasswordProtected")}`)}
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
                    {t("fileUploader.dropHere")} {t("fileUploader.maxSize")}
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
              )}
            </div>

            {/* Password Field - Only show if file is uploaded and is password protected */}
            {file && isPasswordProtected && (
              <div className="space-y-6 mt-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fileUploader.password")}</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder={t("unlockPdf.enterPassword")}
                          {...field}
                          disabled={isProcessing}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        {t("unlockPdf.passwordProtected")}
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Error message */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Progress indicator */}
            {(isUploading || isProcessing) && (
              <UploadProgress
                progress={progress}
                isUploading={isUploading}
                isProcessing={isProcessing}
                processingProgress={progress}
                error={uploadError}
                label={
                  isUploading
                    ? t("watermarkPdf.uploading")
                    : t("unlockPdf.unlocking")
                }
                uploadStats={uploadStats}
              />
            )}

            {/* Results */}
            {unlockedFileUrl && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/30">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <CheckCircledIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-green-600 dark:text-green-400">
                      {t("unlockPdf.unlockSuccess")}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-3">
                      {t("unlockPdf.unlockSuccessDesc")}
                    </p>
                    <Button
                      className="w-full sm:w-auto"
                      asChild
                      variant="default"
                    >
                      <a
                        href={`/api/file?folder=unlocked&filename=${encodeURIComponent(
                          unlockedFileUrl
                        )}`}
                        download
                      >
                        <DownloadIcon className="h-4 w-4 mr-2" />
                        {t("fileUploader.download")}
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            {file && !unlockedFileUrl && (
              <Button type="submit" disabled={isProcessing}>
                {isProcessing ? t("ui.processing") : t("unlockPdf.title")}
              </Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
