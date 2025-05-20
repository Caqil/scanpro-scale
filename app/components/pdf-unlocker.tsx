"use client";

import { useState } from "react";
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
  DownloadIcon,
} from "@radix-ui/react-icons";
import { AlertCircle, UnlockIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLanguageStore } from "@/src/store/store";
import useFileUpload from "@/hooks/useFileUpload";
import { UploadProgress } from "@/components/ui/upload-progress";
import { FileDropzone } from "./dropzone";

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
  const [isUploading, setIsUploading] = useState(false);
  const {
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
    resetUpload();
  };
  // Submit handler
  const onSubmit = async (values: FormValues) => {
    if (!file) {
      setError(t("unlockPdf.noFileSelected"));
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setUnlockedFileUrl(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    if (values.password) {
      formData.append("password", values.password);
    }

    // Use the Go API URL instead of Next.js API
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/pdf/unlock`;
    console.log("Submitting to Go API URL:", apiUrl);

    try {
      // Track upload progress
      const xhr = new XMLHttpRequest();
      xhr.open("POST", apiUrl);
      xhr.setRequestHeader(
        "x-api-key",
        "sk_d6c1daa54dbc95956b281fa02c544e7273ed10df60b211fe"
      );

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          // Update progress for upload phase (0–50%)
          setProgress(percentComplete / 2);
        }
      };

      xhr.onload = function () {
        setIsUploading(false);

        if (xhr.status >= 200 && xhr.status < 300) {
          // Success
          const data = JSON.parse(xhr.responseText);
          console.log("API response:", data);

          setProgress(100);
          setUnlockedFileUrl(data.filename);
          setIsProcessing(false);

          toast.success(t("unlockPdf.unlockSuccess"), {
            description: data.message || t("unlockPdf.unlockSuccessDesc"),
          });
        } else {
          // Error
          setIsProcessing(false);
          setProgress(0);

          try {
            const errorData = JSON.parse(xhr.responseText);
            setError(errorData.error || t("unlockPdf.unknownError"));
            toast.error(t("unlockPdf.unlockFailed"), {
              description: errorData.error || t("unlockPdf.unknownError"),
            });
          } catch (e) {
            setError(t("unlockPdf.unknownError"));
            toast.error(t("unlockPdf.unlockFailed"));
          }
        }
      };

      xhr.onerror = function () {
        setIsUploading(false);
        setIsProcessing(false);
        setProgress(0);

        setError(t("unlockPdf.error.networkError"));
        toast.error(t("unlockPdf.error.networkError"));
      };

      xhr.send(formData);
    } catch (err) {
      console.error("Error submitting form:", err);
      setIsUploading(false);
      setIsProcessing(false);
      setProgress(0);

      setError(t("unlockPdf.unknownError"));
      toast.error(t("unlockPdf.unlockFailed"));
    }
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle>{t("unlockPdf.title") || "Unlock PDF"}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* File Drop Zone */}
            <FileDropzone
              multiple={false}
              maxFiles={1}
              acceptedFileTypes={{ "application/pdf": [".pdf"] }}
              disabled={isProcessing}
              onFileAccepted={async (acceptedFiles) => {
                if (acceptedFiles.length > 0) {
                  const pdfFile = acceptedFiles[0];
                  setFile(pdfFile);
                  setUnlockedFileUrl(null);
                  setError(null);
                  resetUpload();

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
              }}
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
            />

            {/* File Display */}
            {file && !unlockedFileUrl && (
              <div className="border rounded-lg p-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="h-9 w-9 rounded-md bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <FileIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                      {isPasswordProtected !== null &&
                        (isPasswordProtected
                          ? ` • ${t("unlockPdf.passwordProtected")}`
                          : ` • ${t("unlockPdf.notPasswordProtected")}`)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveFile}
                  disabled={isProcessing}
                >
                  <Cross2Icon className="h-4 w-4" />
                </Button>
              </div>
            )}

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
                          placeholder={t("auth.passwordRequired")}
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
                    ? t("watermarkPdf.uploading") || "Uploading..."
                    : t("unlockPdf.unlocking") || "Unlocking..."
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
                      {t("unlockPdf.unlockSuccess") ||
                        "PDF Unlocked Successfully"}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-3">
                      {t("unlockPdf.unlockSuccessDesc") ||
                        "Your PDF has been unlocked and is ready for download."}
                    </p>
                    <Button
                      className="w-full sm:w-auto"
                      asChild
                      variant="default"
                    >
                      <a
                        href={`${
                          process.env.NEXT_PUBLIC_API_URL
                        }/api/file?folder=unlocked&filename=${encodeURIComponent(
                          unlockedFileUrl
                        )}`}
                        download
                      >
                        <DownloadIcon className="h-4 w-4 mr-2" />
                        {t("watermarkPdf.download") || "Download Unlocked PDF"}
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
                {isProcessing
                  ? t("ui.processing") || "Processing..."
                  : t("popular.unlockPdf") || "Unlock PDF"}
              </Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
