"use client";

import { useState, useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useLanguageStore } from "@/src/store/store";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  ImageIcon,
  TypeIcon,
  Grid2x2Icon,
  ArrowRightIcon,
  ChevronsUpDownIcon,
  MoveHorizontalIcon,
  Eye,
  UploadIcon,
  LoaderIcon,
  Download,
  CheckCircle,
  AlertOctagon,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { WatermarkPositionPreview } from "./watermark-position-preview";
import useFileUpload from "@/hooks/useFileUpload";

// Define the form schema
const watermarkFormSchema = z.object({
  watermarkType: z.enum(["text", "image"]),
  text: z.string().optional(),
  textColor: z.string().default("#FF0000"),
  fontSize: z.number().min(8).max(120).default(48),
  fontFamily: z.string().default("Arial"),
  position: z.enum([
    "center",
    "tile",
    "top-left",
    "top-right",
    "bottom-left",
    "bottom-right",
    "custom",
  ]),
  rotation: z.number().min(0).max(360).default(45),
  opacity: z.number().min(1).max(100).default(30),
  scale: z.number().min(10).max(100).default(50),
  pages: z.enum(["all", "even", "odd", "custom"]),
  customPages: z.string().optional(),
  customX: z.number().min(0).max(100).optional(),
  customY: z.number().min(0).max(100).optional(),
});

type WatermarkFormValues = z.infer<typeof watermarkFormSchema>;

export function WatermarkPDF() {
  const { t } = useLanguageStore();
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [processState, setProcessState] = useState<
    "idle" | "uploading" | "processing" | "success" | "error"
  >("idle");
  const [progress, setProgress] = useState(0);
  const [watermarkedPdfUrl, setWatermarkedPdfUrl] = useState("");
  const [resultInfo, setResultInfo] = useState<{
    originalName: string;
    pagesWatermarked: number;
    fileUrl: string;
    fileName: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const watermarkImageRef = useRef<HTMLInputElement>(null);

  // Default form values
  const defaultValues: Partial<WatermarkFormValues> = {
    watermarkType: "text",
    text: "WATERMARK",
    textColor: "#FF0000",
    fontSize: 48,
    fontFamily: "Arial",
    position: "center",
    rotation: 0,
    opacity: 30,
    scale: 50,
    pages: "all",
    customPages: "",
  };

  const form = useForm<WatermarkFormValues>({
    resolver: zodResolver(watermarkFormSchema),
    defaultValues,
  });

  const watchWatermarkType = form.watch("watermarkType");
  const watchPosition = form.watch("position");
  const watchPages = form.watch("pages");

  // Handle PDF upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const uploadedFile = files[0];
      if (uploadedFile.type !== "application/pdf") {
        toast.error(t("ui.error") || "Invalid file type. Please upload a PDF.");
        return;
      }
      setFile(uploadedFile);
      setFileName(uploadedFile.name);
      setWatermarkedPdfUrl("");
      setProcessState("idle");
      setProgress(0);
      setResultInfo(null);
      setDownloadUrl(null);
    }
  };

  // Handle image watermark upload
  const handleImageUpload = (files: File[]) => {
    if (files.length > 0) {
      const imageFile = files[0];
      const validImageTypes = [
        "image/jpeg",
        "image/png",
        "image/svg+xml",
        "image/gif",
      ];

      if (!validImageTypes.includes(imageFile.type)) {
        toast.error(
          t("watermark.invalidImageType") ||
            "Invalid image type. Please upload JPEG, PNG, or SVG."
        );
        return;
      }

      setWatermarkImage(imageFile);
      const objectUrl = URL.createObjectURL(imageFile);
      setImagePreviewUrl(objectUrl);
    }
  };

  // Cleanup the object URL when component unmounts or when file changes
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  // Handle form submission
  const onSubmit = async (data: WatermarkFormValues) => {
    if (!file) {
      toast.error(
        t("watermark.noPdfSelected") || "Please select a PDF file first"
      );
      return;
    }

    if (data.watermarkType === "image" && !watermarkImage) {
      toast.error(
        t("watermark.noImageSelected") ||
          "Please select an image for the watermark"
      );
      return;
    }

    setIsSubmitting(true);
    setProcessState("uploading");
    setProgress(10);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("watermarkType", data.watermarkType);

    if (data.watermarkType === "text") {
      formData.append("text", data.text || "WATERMARK");
      formData.append("textColor", data.textColor);
      formData.append("fontSize", data.fontSize.toString());
      formData.append("fontFamily", data.fontFamily);
    } else if (data.watermarkType === "image" && watermarkImage) {
      formData.append("watermarkImage", watermarkImage);
      formData.append("scale", data.scale.toString());
    }

    formData.append("position", data.position);
    formData.append("rotation", data.rotation.toString());
    formData.append("opacity", data.opacity.toString());
    formData.append("pages", data.pages);

    if (data.pages === "custom") {
      formData.append("customPages", data.customPages || "");
    }

    if (data.position === "custom") {
      formData.append("customX", data.customX?.toString() || "50");
      formData.append("customY", data.customY?.toString() || "50");
    }

    try {
      // Using fetch directly for more control over the progress
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          // Calculate upload progress (max 50%)
          const uploadProgress = Math.round((event.loaded / event.total) * 50);
          setProgress(10 + uploadProgress);
        }
      });

      xhr.addEventListener("loadstart", () => {
        setProcessState("uploading");
      });

      xhr.addEventListener("load", () => {
        // Start processing phase after upload completes
        setProcessState("processing");
        setProgress(60);

        // Simulate processing progress
        const processingInterval = setInterval(() => {
          setProgress((prevProgress) => {
            const newProgress = prevProgress + 5;
            if (newProgress >= 95) {
              clearInterval(processingInterval);
              return 95;
            }
            return newProgress;
          });
        }, 200);

        // Parse the response
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);

            if (response.success) {
              clearInterval(processingInterval);
              setProcessState("success");
              setProgress(100);
              setDownloadUrl(response.fileUrl);
              setWatermarkedPdfUrl(response.fileUrl);
              setResultInfo({
                originalName: response.originalName || file.name,
                pagesWatermarked: response.pagesWatermarked || 0,
                fileUrl: response.fileUrl,
                fileName: response.filename || "watermarked.pdf",
              });
              toast.success(
                t("watermarkPdf.successDesc") || "PDF watermarked successfully!"
              );
            } else {
              clearInterval(processingInterval);
              setProcessState("error");
              setProgress(0);
              toast.error(
                response.error ||
                  t("watermarkPdf.unknownError") ||
                  "An error occurred during watermarking"
              );
            }
          } catch (parseError) {
            clearInterval(processingInterval);
            setProcessState("error");
            setProgress(0);
            console.error("Error parsing response:", parseError);
            toast.error(
              t("watermarkPdf.unknownError") ||
                "An error occurred during watermarking"
            );
          }
        } else {
          clearInterval(processingInterval);
          setProcessState("error");
          setProgress(0);
          toast.error(`Error: ${xhr.status} ${xhr.statusText}`);
        }
      });

      xhr.addEventListener("error", () => {
        setProcessState("error");
        setProgress(0);
        toast.error(
          t("watermarkPdf.uploadError") ||
            "Network error occurred during file upload"
        );
      });

      xhr.addEventListener("abort", () => {
        setProcessState("idle");
        setProgress(0);
        toast.info(
          t("watermarkPdf.uploadCancelled") || "File upload was cancelled"
        );
      });

      xhr.open("POST", "/api/pdf/watermark");
      xhr.send(formData);
    } catch (error) {
      console.error("Watermark error:", error);
      setProcessState("error");
      setProgress(0);
      toast.error(
        t("watermarkPdf.unknownError") || "An unknown error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to reset the process and upload a new file
  const handleReset = () => {
    setFile(null);
    setFileName("");
    setWatermarkImage(null);
    setImagePreviewUrl(null);
    setProcessState("idle");
    setProgress(0);
    setResultInfo(null);
    setDownloadUrl(null);
    setWatermarkedPdfUrl("");
    form.reset(defaultValues);
  };

  return (
    <div className="space-y-12">
      {!file && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              isDragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/20"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragOver(false);
              const files = e.dataTransfer.files;
              if (files && files.length > 0) {
                const uploadedFile = files[0];
                if (uploadedFile.type !== "application/pdf") {
                  toast.error(
                    t("watermarkPdf.invalidFileType") ||
                      "Invalid file type. Please upload a PDF."
                  );
                  return;
                }
                setFile(uploadedFile);
                setFileName(uploadedFile.name);
                setWatermarkedPdfUrl("");
                setProcessState("idle");
                setProgress(0);
                setResultInfo(null);
                setDownloadUrl(null);
              }
            }}
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
              {t("watermarkPdf.uploadTitle") || "Add Watermark to PDF"}
            </h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              {t("watermarkPdf.uploadDesc") ||
                "Upload a PDF document to add text or image watermarks to its pages."}
            </p>
            <Button
              size="lg"
              className="px-8"
              onClick={() => fileInputRef.current?.click()}
            >
              {t("watermarkPdf.selectPdf") || "Select PDF"}
            </Button>
            <p className="mt-6 text-sm text-muted-foreground">
              {t("watermarkPdf.privacyNote") ||
                "Your files are processed securely and never stored permanently on our servers."}
            </p>
          </div>
        </div>
      )}

      {/* Processing Status Section */}
      {file &&
        (processState === "uploading" || processState === "processing") && (
          <div className="flex-1 flex flex-col items-center justify-center py-8">
            <div className="bg-background rounded-lg p-8 shadow-sm border w-full max-w-md text-center">
              <LoaderIcon className="h-16 w-16 animate-spin text-primary mb-6 mx-auto" />
              <h3 className="text-xl font-semibold mb-3">
                {processState === "uploading"
                  ? t("watermarkPdf.uploading") || "Uploading PDF..."
                  : t("watermarkPdf.processing") || "Processing Watermark..."}
              </h3>
              <p className="text-muted-foreground mb-4">{fileName}</p>
              <Progress value={progress} className="w-full h-2 mb-4" />
              <p className="text-sm text-muted-foreground">
                {processState === "uploading"
                  ? t("watermarkPdf.uploadingDesc") ||
                    "Uploading your PDF file to our servers..."
                  : t("watermarkPdf.processingDesc") ||
                    "Adding watermark to your PDF. This may take a moment..."}
              </p>
            </div>
          </div>
        )}

      {/* Success Result Section */}
      {file && processState === "success" && resultInfo && (
        <div className="flex-1 flex flex-col items-center justify-center py-8">
          <div className="bg-background rounded-lg p-8 shadow-sm border w-full max-w-md">
            <div className="text-center mb-6">
              <div className="rounded-full bg-green-100 p-3 w-16 h-16 mx-auto flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t("watermarkPdf.success") || "Watermark Added Successfully!"}
              </h3>
              <p className="text-muted-foreground">
                {t("watermarkPdf.successDesc") ||
                  "Your PDF has been watermarked and is ready to download."}
              </p>
            </div>

            <div className="space-y-3 mb-6 bg-muted/50 p-4 rounded-md">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("watermarkPdf.filename") || "Filename"}:
                </span>
                <span className="font-medium truncate ml-2">
                  {resultInfo.originalName}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("watermarkPdf.pagesWatermarked") || "Pages Watermarked"}:
                </span>
                <span className="font-medium">
                  {resultInfo.pagesWatermarked}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button asChild className="w-full">
                <a href={resultInfo.fileUrl} download={resultInfo.fileName}>
                  <Download className="mr-2 h-4 w-4" />
                  {t("watermarkPdf.download") || "Download Watermarked PDF"}
                </a>
              </Button>
              <Button variant="outline" onClick={handleReset}>
                {t("watermarkPdf.uploadNew") || "Process Another PDF"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Error Result Section */}
      {file && processState === "error" && (
        <div className="flex-1 flex flex-col items-center justify-center py-8">
          <div className="bg-background rounded-lg p-8 shadow-sm border w-full max-w-md text-center">
            <div className="rounded-full bg-red-100 p-3 w-16 h-16 mx-auto flex items-center justify-center mb-4">
              <AlertOctagon className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">
              {t("watermarkPdf.error") || "Error Processing PDF"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {t("watermarkPdf.errorDesc") ||
                "We encountered an error while processing your PDF. Please try again."}
            </p>
            <div className="flex flex-col gap-3">
              <Button variant="outline" onClick={() => setProcessState("idle")}>
                {t("watermarkPdf.tryAgain") || "Try Again"}
              </Button>
              <Button variant="ghost" onClick={handleReset}>
                {t("watermarkPdf.uploadNew") || "Upload a Different PDF"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Watermark Configuration Form */}
      {file && processState === "idle" && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold">
                  {t("watermarkPdf.configureTitle") || "Configure Watermark"}
                </h3>
                <p className="text-sm text-muted-foreground">{fileName}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                {t("watermarkPdf.change") || "Change File"}
              </Button>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <Tabs
                  defaultValue="text"
                  onValueChange={(value) =>
                    form.setValue("watermarkType", value as "text" | "image")
                  }
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger
                      value="text"
                      className="flex items-center gap-2"
                    >
                      <TypeIcon className="h-4 w-4" />
                      {t("watermarkPdf.textWatermark") || "Text Watermark"}
                    </TabsTrigger>
                    <TabsTrigger
                      value="image"
                      className="flex items-center gap-2"
                    >
                      <ImageIcon className="h-4 w-4" />
                      {t("watermarkPdf.imageWatermark") || "Image Watermark"}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="text" className="space-y-4 py-4">
                    <FormField
                      control={form.control}
                      name="text"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("watermarkPdf.text.text") || "Watermark Text"}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={
                                t("watermarkPdf.text.placeholder") ||
                                "Enter watermark text"
                              }
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fontSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("watermarkPdf.text.size") || "Font Size"}
                            </FormLabel>
                            <div className="flex items-center gap-4">
                              <FormControl>
                                <Slider
                                  min={8}
                                  max={120}
                                  step={1}
                                  value={[field.value]}
                                  onValueChange={(value) =>
                                    field.onChange(value[0])
                                  }
                                />
                              </FormControl>
                              <span className="w-12 text-center">
                                {field.value}px
                              </span>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="fontFamily"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("watermarkPdf.text.font") || "Font Family"}
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={
                                      t("watermarkPdf.text.selectFont") ||
                                      "Select Font"
                                    }
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Arial">Arial</SelectItem>
                                <SelectItem value="Times New Roman">
                                  Times New Roman
                                </SelectItem>
                                <SelectItem value="Courier">Courier</SelectItem>
                                <SelectItem value="Helvetica">
                                  Helvetica
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="textColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("watermarkPdf.text.color") || "Text Color"}
                          </FormLabel>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-10 w-10 rounded border"
                              style={{ backgroundColor: field.value }}
                            />
                            <input
                              type="color"
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                              className="h-10 w-20 rounded border cursor-pointer"
                            />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="image" className="space-y-4 py-4">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">
                        {t("watermarkPdf.image.upload") ||
                          "Upload Watermark Image"}
                      </h4>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/svg+xml,image/gif"
                        ref={watermarkImageRef}
                        onChange={(e) =>
                          handleImageUpload(
                            e.target.files ? Array.from(e.target.files) : []
                          )
                        }
                        className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      />

                      {imagePreviewUrl && (
                        <div className="mt-4 border rounded p-2 flex justify-center">
                          <img
                            src={imagePreviewUrl}
                            alt="Watermark preview"
                            className="max-h-32 object-contain"
                          />
                        </div>
                      )}
                    </div>

                    <FormField
                      control={form.control}
                      name="scale"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("watermarkPdf.image.scale") || "Image Scale"}
                          </FormLabel>
                          <div className="flex items-center gap-4">
                            <FormControl>
                              <Slider
                                min={10}
                                max={100}
                                step={1}
                                value={[field.value]}
                                onValueChange={(value) =>
                                  field.onChange(value[0])
                                }
                              />
                            </FormControl>
                            <span className="w-12 text-center">
                              {field.value}%
                            </span>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("watermarkPdf.position") || "Position"}
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={
                                    t("watermarkPdf.position") ||
                                    "Select Position"
                                  }
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem
                                value="center"
                                className="flex items-center gap-2"
                              >
                                <ChevronsUpDownIcon className="h-4 w-4" />
                                {t("watermarkPdf.center") || "Center"}
                              </SelectItem>
                              <SelectItem
                                value="tile"
                                className="flex items-center gap-2"
                              >
                                <Grid2x2Icon className="h-4 w-4" />
                                {t("watermarkPdf.tile") || "Tile"}
                              </SelectItem>
                              <SelectItem
                                value="top-left"
                                className="flex items-center gap-2"
                              >
                                <ArrowRightIcon className="h-4 w-4 rotate-[-135deg]" />
                                {t("watermarkPdf.positions.topLeft") ||
                                  "Top Left"}
                              </SelectItem>
                              <SelectItem
                                value="top-right"
                                className="flex items-center gap-2"
                              >
                                <ArrowRightIcon className="h-4 w-4 rotate-[-45deg]" />
                                {t("watermarkPdf.positions.topRight") ||
                                  "Top Right"}
                              </SelectItem>
                              <SelectItem
                                value="bottom-left"
                                className="flex items-center gap-2"
                              >
                                <ArrowRightIcon className="h-4 w-4 rotate-[135deg]" />
                                {t("watermarkPdf.positions.bottomLeft") ||
                                  "Bottom Left"}
                              </SelectItem>
                              <SelectItem
                                value="bottom-right"
                                className="flex items-center gap-2"
                              >
                                <ArrowRightIcon className="h-4 w-4 rotate-[45deg]" />
                                {t("watermarkPdf.positions.bottomRight") ||
                                  "Bottom Right"}
                              </SelectItem>
                              <SelectItem
                                value="custom"
                                className="flex items-center gap-2"
                              >
                                <MoveHorizontalIcon className="h-4 w-4" />
                                {t("watermarkPdf.custom") || "Custom Position"}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          {t("watermarkPdf.text.preview") || "Preview"}
                        </h4>
                      </div>
                      <WatermarkPositionPreview
                        position={watchPosition}
                        customX={form.watch("customX") || 50}
                        customY={form.watch("customY") || 50}
                        rotation={form.watch("rotation")}
                        watermarkType={watchWatermarkType}
                        text={form.watch("text")}
                        textColor={form.watch("textColor")}
                        fontSize={form.watch("fontSize")}
                        imagePreviewUrl={imagePreviewUrl || undefined}
                        scale={form.watch("scale")}
                      />
                    </div>

                    {watchPosition === "custom" && (
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="customX"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {t("watermarkPdf.positionX") || "Position X"}
                              </FormLabel>
                              <div className="flex items-center gap-4">
                                <FormControl>
                                  <Slider
                                    min={0}
                                    max={100}
                                    step={1}
                                    value={[field.value || 50]}
                                    onValueChange={(value) =>
                                      field.onChange(value[0])
                                    }
                                  />
                                </FormControl>
                                <span className="w-12 text-center">
                                  {field.value || 50}%
                                </span>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="customY"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {t("watermarkPdf.positionY") || "Position Y"}
                              </FormLabel>
                              <div className="flex items-center gap-4">
                                <FormControl>
                                  <Slider
                                    min={0}
                                    max={100}
                                    step={1}
                                    value={[field.value || 50]}
                                    onValueChange={(value) =>
                                      field.onChange(value[0])
                                    }
                                  />
                                </FormControl>
                                <span className="w-12 text-center">
                                  {field.value || 50}%
                                </span>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    <FormField
                      control={form.control}
                      name="rotation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("watermarkPdf.text.rotation") || "Rotation"}
                          </FormLabel>
                          <div className="flex items-center gap-4">
                            <FormControl>
                              <Slider
                                min={0}
                                max={360}
                                step={1}
                                value={[field.value]}
                                onValueChange={(value) =>
                                  field.onChange(value[0])
                                }
                              />
                            </FormControl>
                            <span className="w-12 text-center">
                              {field.value}°
                            </span>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="opacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("watermarkPdf.text.opacity") || "Opacity"}
                          </FormLabel>
                          <div className="flex items-center gap-4">
                            <FormControl>
                              <Slider
                                min={1}
                                max={100}
                                step={1}
                                value={[field.value]}
                                onValueChange={(value) =>
                                  field.onChange(value[0])
                                }
                              />
                            </FormControl>
                            <span className="w-12 text-center">
                              {field.value}%
                            </span>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pages"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("watermarkPdf.applyToPages") || "Apply To Pages"}
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="all" id="all" />
                                <label
                                  htmlFor="all"
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {t("watermarkPdf.all") || "All Pages"}
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="even" id="even" />
                                <label
                                  htmlFor="even"
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {t("watermarkPdf.even") || "Even Pages Only"}
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="odd" id="odd" />
                                <label
                                  htmlFor="odd"
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {t("watermarkPdf.odd") || "Odd Pages Only"}
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="custom" id="custom" />
                                <label
                                  htmlFor="custom"
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {t("watermarkPdf.customPages") ||
                                    "Custom Pages"}
                                </label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {watchPages === "custom" && (
                      <FormField
                        control={form.control}
                        name="customPages"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("watermarkPdf.customPages") || "Custom Pages"}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={
                                  t("watermarkPdf.pagesFormat") ||
                                  "e.g. 1-5, 8, 11-13"
                                }
                                {...field}
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              {t("watermarkPdf.pagesFormat") ||
                                "Specify pages as individual numbers or ranges (e.g. 1-5, 8, 11-13)"}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 justify-end mt-8">
                  <Button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      !file ||
                      (watchWatermarkType === "image" && !watermarkImage)
                    }
                  >
                    {isSubmitting
                      ? t("watermarkPdf.adding") || "Adding Watermark..."
                      : t("watermarkPdf.addWatermark") || "Add Watermark"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
