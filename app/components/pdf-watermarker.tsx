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
import { Switch } from "@/components/ui/switch";
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
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [watermarkedPdfUrl, setWatermarkedPdfUrl] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    isUploading,
    progress: uploadProgress,
    error: uploadError,
    uploadFile,
    resetUpload,
    uploadStats,
  } = useFileUpload();
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
      setWatermarkedPdfUrl("");
      setCurrentPage(0);
      processPdf(uploadedFile);
    }
  };

  // Simulate PDF processing (replace with actual processing logic if needed)
  const processPdf = (uploadedFile: File) => {
    setProcessing(true);
    let progressValue = 0;
    const interval = setInterval(() => {
      progressValue += 10;
      setProgress(progressValue);
      if (progressValue >= 100) {
        clearInterval(interval);
        setProcessing(false);
      }
    }, 300);
  };

  // Handle image watermark upload
  const handleImageUpload = (files: File[]) => {
    if (files.length > 0) {
      setWatermarkImage(files[0]);
      const objectUrl = URL.createObjectURL(files[0]);
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
      toast.error(t("watermark.noPdfSelected"));
      return;
    }

    if (data.watermarkType === "image" && !watermarkImage) {
      toast.error(t("watermark.noImageSelected"));
      return;
    }

    setIsSubmitting(true);
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
      await uploadFile(file, formData, {
        url: "/api/pdf/watermark",
        onProgress: (progress) => {
          // Optionally update UI with progress
        },
        onSuccess: (result) => {
          setDownloadUrl(result.fileUrl);
          setWatermarkedPdfUrl(result.fileUrl);
          toast.success(t("watermarkPdf.successDesc"));
        },
        onError: (err) => {
          console.error("Watermark error:", err);
          toast.error(err.message || t("watermarkPdf.unknownError"));
        },
      });
    } catch (error) {
      console.error("Watermark error:", error);
      toast.error(t("watermarkPdf.unknownError"));
    } finally {
      setIsSubmitting(false);
    }
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
                  toast.error(t("watermarkPdf.invalidFileType"));
                  return;
                }
                setFile(uploadedFile);
                setWatermarkedPdfUrl("");
                setCurrentPage(0);
                processPdf(uploadedFile);
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
              {t("watermarkPdf.uploadTitle")}
            </h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              {t("watermarkPdf.uploadDesc")}
            </p>
            <Button
              size="lg"
              className="px-8"
              onClick={() => fileInputRef.current?.click()}
            >
              {t("watermarkPdf.selectPdf")}
            </Button>
            <p className="mt-6 text-sm text-muted-foreground">
              {t("watermarkPdf.privacyNote")}
            </p>
          </div>
        </div>
      )}

      {/* Processing Section */}
      {file && processing && !watermarkedPdfUrl && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="bg-background rounded-lg p-8 shadow-sm border w-96 text-center">
            <LoaderIcon className="h-16 w-16 animate-spin text-primary mb-6 mx-auto" />
            <h3 className="text-xl font-semibold mb-3">
              {t("watermarkPdf.processing")}
            </h3>
            <Progress value={progress} className="w-full h-2" />
          </div>
        </div>
      )}

      {/* Step 2: Configure watermark */}
      {file && !processing && (
        <Card>
          <CardContent className="pt-6">
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
                      {t("watermarkPdf.textWatermark")}
                    </TabsTrigger>
                    <TabsTrigger
                      value="image"
                      className="flex items-center gap-2"
                    >
                      <ImageIcon className="h-4 w-4" />
                      {t("watermarkPdf.imageWatermark")}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="text" className="space-y-4 py-4">
                    <FormField
                      control={form.control}
                      name="text"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("watermarkPdf.text.text")}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t("watermarkPdf.text.placeholder")}
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
                            <FormLabel>{t("watermarkPdf.text.size")}</FormLabel>
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
                            <FormLabel>{t("watermarkPdf.text.font")}</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={t(
                                      "watermarkPdf.text.selectFont"
                                    )}
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
                          <FormLabel>{t("watermarkPdf.text.color")}</FormLabel>
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
                        {t("watermarkPdf.image.upload")}
                      </h4>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/svg+xml"
                        onChange={(e) =>
                          handleImageUpload(
                            e.target.files ? Array.from(e.target.files) : []
                          )
                        }
                        className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="scale"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("watermarkPdf.image.scale")}</FormLabel>
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
                          <FormLabel>{t("watermarkPdf.position")}</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={t("watermarkPdf.position")}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem
                                value="center"
                                className="flex items-center gap-2"
                              >
                                <ChevronsUpDownIcon className="h-4 w-4" />
                                {t("watermarkPdf.center")}
                              </SelectItem>
                              <SelectItem
                                value="tile"
                                className="flex items-center gap-2"
                              >
                                <Grid2x2Icon className="h-4 w-4" />
                                {t("watermarkPdf.tile")}
                              </SelectItem>
                              <SelectItem
                                value="top-left"
                                className="flex items-center gap-2"
                              >
                                <ArrowRightIcon className="h-4 w-4 rotate-[-135deg]" />
                                {t("watermarkPdf.positions.topLeft")}
                              </SelectItem>
                              <SelectItem
                                value="top-right"
                                className="flex items-center gap-2"
                              >
                                <ArrowRightIcon className="h-4 w-4 rotate-[-45deg]" />
                                {t("watermarkPdf.positions.topRight")}
                              </SelectItem>
                              <SelectItem
                                value="bottom-left"
                                className="flex items-center gap-2"
                              >
                                <ArrowRightIcon className="h-4 w-4 rotate-[135deg]" />
                                {t("watermarkPdf.positions.bottomLeft")}
                              </SelectItem>
                              <SelectItem
                                value="bottom-right"
                                className="flex items-center gap-2"
                              >
                                <ArrowRightIcon className="h-4 w-4 rotate-[45deg]" />
                                {t("watermarkPdf.positions.bottomRight")}
                              </SelectItem>
                              <SelectItem
                                value="custom"
                                className="flex items-center gap-2"
                              >
                                <MoveHorizontalIcon className="h-4 w-4" />
                                {t("watermarkPdf.custom")}
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
                          {t("watermarkPdf.text.preview")}
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
                            {t("watermarkPdf.text.rotation")}
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
                            {t("watermarkPdf.text.opacity")}
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
                            {t("watermarkPdf.applyToPages")}
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
                                  {t("watermarkPdf.all")}
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="even" id="even" />
                                <label
                                  htmlFor="even"
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {t("watermarkPdf.even")}
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="odd" id="odd" />
                                <label
                                  htmlFor="odd"
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {t("watermarkPdf.odd")}
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="custom" id="custom" />
                                <label
                                  htmlFor="custom"
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {t("watermarkPdf.customPages")}
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
                              {t("watermarkPdf.customPages")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t("watermarkPdf.pagesFormat")}
                                {...field}
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              {t("watermarkPdf.pagesFormat")}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 justify-end">
                  <Button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      !file ||
                      (watchWatermarkType === "image" && !watermarkImage)
                    }
                  >
                    {isSubmitting
                      ? t("watermarkPdf.adding")
                      : t("watermarkPdf.addWatermark")}
                  </Button>

                  {downloadUrl && (
                    <Button variant="outline" asChild>
                      <a href={downloadUrl} download>
                        {t("watermarkPdf.download")}
                      </a>
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
