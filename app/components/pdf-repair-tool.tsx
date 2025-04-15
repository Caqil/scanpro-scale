"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  FileCheck2,
  Upload,
  Download,
  Loader2,
  FileCog,
  AlertTriangle,
  File,
  FileWarning,
  Eye,
  FlaskConical,
  CheckCircle,
  Check,
} from "lucide-react";
import { useLanguageStore } from "@/src/store/store";
import { toast } from "sonner";

export function PdfRepairTool() {
  const { t } = useLanguageStore();

  // File state
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [repairMode, setRepairMode] = useState("standard");
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [hasAdvancedOptions, setHasAdvancedOptions] = useState(false);
  const [preserveFormFields, setPreserveFormFields] = useState(true);
  const [preserveAnnotations, setPreserveAnnotations] = useState(true);
  const [preserveBookmarks, setPreserveBookmarks] = useState(true);
  const [optimizeImages, setOptimizeImages] = useState(false);

  // Progress state
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");

  // Result state
  const [repairResult, setRepairResult] = useState<{
    success: boolean;
    fileUrl?: string;
    message?: string;
    details?: {
      fixed: string[];
      warnings: string[];
      originalSize?: number;
      newSize?: number;
    };
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.toLowerCase().endsWith(".pdf")) {
        toast.error("Invalid file type", {
          description: "Please select a PDF file",
        });
        return;
      }

      if (selectedFile.size > 100 * 1024 * 1024) {
        // 100MB limit
        toast.error("File too large", {
          description: "Maximum file size is 100MB",
        });
        return;
      }

      setFile(selectedFile);

      // Check if file is password protected
      checkIfPasswordProtected(selectedFile);
    }
  };
  const checkIfPasswordProtected = async (file: File) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/pdf/unlock/check", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      console.log("API response:", data); // Add this
      setIsPasswordProtected(data.isPasswordProtected);
    } catch (error) {
      console.error("Error checking PDF:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error("No file selected", {
        description: "Please select a PDF file to repair",
      });
      return;
    }

    if (isPasswordProtected && !password) {
      toast.error("Password required", {
        description:
          "This PDF is password protected. Please enter the password",
      });
      return;
    }

    try {
      setIsProcessing(true);
      setProgress(0);
      setStage("Analyzing PDF structure");

      // Create form data
      const formData = new FormData();
      formData.append("file", file);
      formData.append("repairMode", repairMode);

      if (isPasswordProtected && password) {
        formData.append("password", password);
      }

      // Add advanced options if enabled
      if (hasAdvancedOptions) {
        formData.append("preserveFormFields", preserveFormFields.toString());
        formData.append("preserveAnnotations", preserveAnnotations.toString());
        formData.append("preserveBookmarks", preserveBookmarks.toString());
        formData.append("optimizeImages", optimizeImages.toString());
      }

      // Simulate progress (in reality this would be from a progress event)
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }

          // Update stage based on progress
          if (prev === 20) setStage("Rebuilding document structure");
          if (prev === 40) setStage("Recovering content");
          if (prev === 60) setStage("Fixing cross-references");
          if (prev === 80) setStage("Optimizing file");

          return prev + 5;
        });
      }, 200);

      // Send request to API
      const response = await fetch("/api/pdf/repair", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);
      setStage("Finishing up");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to repair PDF");
      }

      const data = await response.json();

      // Set result
      setRepairResult({
        success: data.success,
        fileUrl: data.fileUrl,
        message: data.message,
        details: data.details,
      });

      if (data.success) {
        toast.success("PDF repaired successfully", {
          description: "Your file has been repaired and is ready for download",
        });
      } else {
        toast.error("Repair process completed with issues", {
          description:
            data.message || "The repair process encountered some issues",
        });
      }
    } catch (error) {
      console.error("Error repairing PDF:", error);
      toast.error("Failed to repair PDF", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
      setRepairResult({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to repair PDF",
      });
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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
      if (
        droppedFile.type === "application/pdf" ||
        droppedFile.name.toLowerCase().endsWith(".pdf")
      ) {
        setFile(droppedFile);
        checkIfPasswordProtected(droppedFile);
      } else {
        toast.error("Invalid file type", {
          description: "Please select a PDF file",
        });
      }
    }
  };

  const renderUploadArea = () => (
    <div
      className="border-2 border-dashed rounded-lg p-8 text-center"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <FileCheck2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-2">Upload PDF for Repair</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Drag and drop your PDF file here, or click to browse
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
            Checking file...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            Select PDF File
          </>
        )}
      </Button>
      <p className="text-xs text-muted-foreground mt-4">
        Maximum file size: 100MB
      </p>
    </div>
  );

  const renderRepairOptions = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">{file?.name}</h3>
          <p className="text-sm text-muted-foreground">
            {formatFileSize(file?.size || 0)}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setFile(null);
            setPassword("");
            setIsPasswordProtected(false);
            setRepairResult(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }}
        >
          Change File
        </Button>
      </div>

      {isPasswordProtected && (
        <div className="space-y-2">
          <Label htmlFor="password">PDF Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter document password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            This PDF is password protected. Enter the password to repair it.
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label>Repair Mode</Label>
        <RadioGroup
          value={repairMode}
          onValueChange={setRepairMode}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="standard" id="standard" className="mt-1" />
            <div>
              <Label
                htmlFor="standard"
                className="flex items-center gap-1 font-medium"
              >
                <FileCheck2 className="h-4 w-4 text-blue-500" />
                Standard Repair
              </Label>
              <p className="text-xs text-muted-foreground">
                Fix common issues such as broken links and structural problems
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <RadioGroupItem value="advanced" id="advanced" className="mt-1" />
            <div>
              <Label
                htmlFor="advanced"
                className="flex items-center gap-1 font-medium"
              >
                <FileWarning className="h-4 w-4 text-amber-500" />
                Advanced Recovery
              </Label>
              <p className="text-xs text-muted-foreground">
                Deep recovery for severely damaged or corrupted PDF files
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <RadioGroupItem
              value="optimization"
              id="optimization"
              className="mt-1"
            />
            <div>
              <Label
                htmlFor="optimization"
                className="flex items-center gap-1 font-medium"
              >
                <FlaskConical className="h-4 w-4 text-green-500" />
                Optimization
              </Label>
              <p className="text-xs text-muted-foreground">
                Clean and optimize PDF structure without losing content
              </p>
            </div>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Advanced Options</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setHasAdvancedOptions(!hasAdvancedOptions)}
            className="h-8 px-2 text-xs"
          >
            {hasAdvancedOptions ? "Hide Options" : "Show Options"}
          </Button>
        </div>

        {hasAdvancedOptions && (
          <div className="space-y-3 bg-muted/20 p-3 rounded-md mt-2">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="preserveFormFields"
                checked={preserveFormFields}
                onCheckedChange={(checked) => setPreserveFormFields(!!checked)}
              />
              <div>
                <Label
                  htmlFor="preserveFormFields"
                  className="text-sm font-medium"
                >
                  Preserve Form Fields
                </Label>
                <p className="text-xs text-muted-foreground">
                  Maintain interactive form fields when possible
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="preserveAnnotations"
                checked={preserveAnnotations}
                onCheckedChange={(checked) => setPreserveAnnotations(!!checked)}
              />
              <div>
                <Label
                  htmlFor="preserveAnnotations"
                  className="text-sm font-medium"
                >
                  Preserve Annotations
                </Label>
                <p className="text-xs text-muted-foreground">
                  Keep comments, highlights and other annotations
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="preserveBookmarks"
                checked={preserveBookmarks}
                onCheckedChange={(checked) => setPreserveBookmarks(!!checked)}
              />
              <div>
                <Label
                  htmlFor="preserveBookmarks"
                  className="text-sm font-medium"
                >
                  Preserve Bookmarks
                </Label>
                <p className="text-xs text-muted-foreground">
                  Maintain document outline and bookmarks
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="optimizeImages"
                checked={optimizeImages}
                onCheckedChange={(checked) => setOptimizeImages(!!checked)}
              />
              <div>
                <Label htmlFor="optimizeImages" className="text-sm font-medium">
                  Optimize Images
                </Label>
                <p className="text-xs text-muted-foreground">
                  Recompress images to reduce file size
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Button
        onClick={handleSubmit}
        className="w-full"
        disabled={isProcessing || (isPasswordProtected && !password)}
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Repairing PDF...
          </>
        ) : (
          <>
            <FileCog className="h-4 w-4 mr-2" />
            Repair PDF
          </>
        )}
      </Button>
    </div>
  );

  const renderProcessingState = () => (
    <div className="space-y-4 py-4">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Repairing your PDF</h3>
        <p className="text-sm text-muted-foreground mb-4">{stage}</p>
      </div>

      <div className="space-y-1">
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-right text-muted-foreground">{progress}%</p>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Please wait while we repair your document. This may take a few minutes
        depending on the file size and complexity.
      </p>
    </div>
  );

  const renderRepairResult = () => {
    if (!repairResult) return null;

    return (
      <div className="space-y-4">
        {repairResult.success ? (
          <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle>PDF Repaired Successfully</AlertTitle>
            <AlertDescription>
              {repairResult.message ||
                "Your PDF has been repaired and is ready for download."}
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Repair Issues Detected</AlertTitle>
            <AlertDescription>
              {repairResult.message ||
                "We encountered issues while repairing your PDF. Some content may not be recoverable."}
            </AlertDescription>
          </Alert>
        )}

        {repairResult.details && (
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Repair Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {repairResult.details.fixed &&
                repairResult.details.fixed.length > 0 && (
                  <div>
                    <h4 className="font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                      <Check className="h-4 w-4" /> Fixed Issues
                    </h4>
                    <ul className="mt-1 space-y-1 pl-6 list-disc text-muted-foreground">
                      {repairResult.details.fixed.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

              {repairResult.details.warnings &&
                repairResult.details.warnings.length > 0 && (
                  <div>
                    <h4 className="font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" /> Warnings
                    </h4>
                    <ul className="mt-1 space-y-1 pl-6 list-disc text-muted-foreground">
                      {repairResult.details.warnings.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

              {repairResult.details.originalSize !== undefined &&
                repairResult.details.newSize !== undefined && (
                  <div>
                    <h4 className="font-medium flex items-center gap-1">
                      <File className="h-4 w-4" /> File Size
                    </h4>
                    <p className="text-muted-foreground mt-1">
                      Original:{" "}
                      {formatFileSize(repairResult.details.originalSize)} → New:{" "}
                      {formatFileSize(repairResult.details.newSize)}
                      {repairResult.details.originalSize >
                        repairResult.details.newSize && (
                        <span className="text-green-600 dark:text-green-400 ml-2">
                          (
                          {Math.round(
                            (1 -
                              repairResult.details.newSize /
                                repairResult.details.originalSize) *
                              100
                          )}
                          % reduction)
                        </span>
                      )}
                    </p>
                  </div>
                )}
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4 mt-6">
          {repairResult.fileUrl && (
            <Button className="flex-1" asChild>
              <a href={repairResult.fileUrl} download>
                <Download className="h-4 w-4 mr-2" />
                Download Repaired PDF
              </a>
            </Button>
          )}

          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              setFile(null);
              setPassword("");
              setIsPasswordProtected(false);
              setRepairResult(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
          >
            <Upload className="h-4 w-4 mr-2" />
            Repair Another PDF
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck2 className="h-5 w-5 text-primary" />
          PDF Repair Tool
        </CardTitle>
        <CardDescription>
          Fix corrupted PDFs, recover content, and optimize document structure
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isProcessing
          ? renderProcessingState()
          : repairResult
          ? renderRepairResult()
          : file
          ? renderRepairOptions()
          : renderUploadArea()}
      </CardContent>
      {!repairResult && !isProcessing && (
        <CardFooter className="border-t px-6 py-4">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Eye className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
              Your files are processed securely. All uploads are automatically
              deleted after processing. We support various repair methods
              including cross-reference reconstruction, content stream repair,
              and structure optimization.
            </p>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
