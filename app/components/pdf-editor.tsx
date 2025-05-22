"use client";

import { useState, useCallback, useEffect, useRef } from "react";

// Types
interface TextBlock {
  text: string;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  font: string;
  size: number;
  color: number;
}

interface PDFPage {
  page_number: number;
  width: number;
  height: number;
  texts: TextBlock[];
}

interface PDFTextData {
  pages: PDFPage[];
}

// Utility function for class names
const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(" ");
};

// Toast utility (simplified)
const showToast = (
  message: string,
  type: "success" | "error" | "info" = "info"
) => {
  // Simple alert for now - in real app would use proper toast library
  if (type === "error") {
    alert(`Error: ${message}`);
  } else {
    console.log(`${type.toUpperCase()}: ${message}`);
  }
};

// Enhanced File Dropzone Component
const EnhancedFileDropzone = ({ onFileAccepted, disabled }: any) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files).filter(
      (file) => file.type === "application/pdf"
    );
    if (files.length > 0) {
      onFileAccepted(files);
    } else {
      showToast("Please upload a PDF file", "error");
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileAccepted(Array.from(files));
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-2xl mx-auto">
      {/* Hero Section */}
      <div className="text-center space-y-3 sm:space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl shadow-lg">
          <svg
            className="h-6 w-6 sm:h-8 sm:w-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            PDF Text Editor
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-2 px-4">
            Upload your PDF and edit text content directly with our advanced
            editor
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg sm:rounded-xl p-4 sm:p-8 transition-all duration-300 cursor-pointer group",
          isDragOver
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/50 scale-[1.02]"
            : "border-gray-300 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />

        <div className="text-center space-y-3 sm:space-y-4">
          <div
            className={cn(
              "inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg transition-colors",
              isDragOver
                ? "bg-blue-100 text-blue-600"
                : "bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600"
            )}
          >
            <svg
              className="h-5 w-5 sm:h-6 sm:w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          <div>
            <p className="text-base sm:text-lg font-medium">
              {isDragOver
                ? "Drop your PDF here"
                : "Choose PDF file or drag & drop"}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Supports PDF files up to 50MB • Text will be extracted
              automatically
            </p>
          </div>

          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 pointer-events-none">
            <svg
              className="h-4 w-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Browse Files
          </button>
        </div>

        {/* Animated border on drag */}
        {isDragOver && (
          <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 animate-pulse" />
        )}
      </div>

      {/* Features - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {[
          {
            icon: "👁️",
            title: "Visual Editor",
            desc: "Edit text with visual positioning",
          },
          {
            icon: "📝",
            title: "List Editor",
            desc: "Organized text block editing",
          },
          {
            icon: "⚡",
            title: "Instant Preview",
            desc: "See changes in real-time",
          },
        ].map((feature, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm">{feature.icon}</span>
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{feature.title}</p>
              <p className="text-xs text-gray-500 line-clamp-1">
                {feature.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Enhanced Progress Component
const EnhancedProgress = ({ progress, isUploading, isProcessing }: any) => {
  const getStageInfo = () => {
    if (isUploading) return { label: "Uploading PDF...", icon: "📤" };
    if (isProcessing) {
      if (progress < 70)
        return { label: "Extracting text blocks...", icon: "📄" };
      if (progress < 90) return { label: "Analyzing structure...", icon: "⚙️" };
      return { label: "Finalizing...", icon: "✅" };
    }
    return { label: "Processing...", icon: "⚙️" };
  };

  const { label, icon } = getStageInfo();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center animate-pulse flex-shrink-0">
          <span className="text-white text-lg">{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{label}</p>
          <p className="text-sm text-gray-500">
            {Math.round(progress)}% complete
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
};

// Mobile Action Menu
const MobileActionMenu = ({
  hasUnsavedChanges,
  onSave,
  onReset,
  onStartOver,
  isProcessing,
}: any) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <button
              onClick={() => {
                onSave();
                setIsOpen(false);
              }}
              disabled={!hasUnsavedChanges || isProcessing}
              className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            >
              💾 Save PDF
            </button>
            <button
              onClick={() => {
                onReset();
                setIsOpen(false);
              }}
              disabled={!hasUnsavedChanges}
              className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            >
              🔄 Reset Changes
            </button>
            <button
              onClick={() => {
                onStartOver();
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 mt-1"
            >
              🆕 New PDF
            </button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

// Main Component
export function PdfTextEditor() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<PDFTextData | null>(null);
  const [originalData, setOriginalData] = useState<PDFTextData | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [editedFileUrl, setEditedFileUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedTextBlock, setSelectedTextBlock] = useState<number | null>(
    null
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeTab, setActiveTab] = useState("list");
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fixed keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "s":
            e.preventDefault();
            if (hasUnsavedChanges && !isProcessing) {
              handleSaveEditedPDF();
            }
            break;
          case "r":
            e.preventDefault();
            if (hasUnsavedChanges) {
              handleReset();
            }
            break;
          case "ArrowLeft":
            e.preventDefault();
            setCurrentPage((prev) => Math.max(0, prev - 1));
            break;
          case "ArrowRight":
            e.preventDefault();
            if (extractedData) {
              setCurrentPage((prev) =>
                Math.min(extractedData.pages.length - 1, prev + 1)
              );
            }
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [hasUnsavedChanges, isProcessing, extractedData]);

  const formatFileSize = (sizeInBytes: number): string => {
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    if (sizeInBytes < 1024 * 1024)
      return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleStartOver = useCallback(() => {
    if (hasUnsavedChanges) {
      const confirm = window.confirm(
        "You have unsaved changes. Are you sure you want to start over?"
      );
      if (!confirm) return;
    }

    setFile(null);
    setExtractedData(null);
    setOriginalData(null);
    setSessionId(null);
    setEditedFileUrl(null);
    setError(null);
    setCurrentPage(0);
    setSelectedTextBlock(null);
    setHasUnsavedChanges(false);
    setIsProcessing(false);
    setIsUploading(false);
    setProgress(0);
    setActiveTab("list");
  }, [hasUnsavedChanges]);

  const handleFileUpload = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const pdfFile = acceptedFiles[0];

    // Validate file size
    if (pdfFile.size > 50 * 1024 * 1024) {
      showToast(
        "File too large - Please select a file smaller than 50MB",
        "error"
      );
      return;
    }

    setFile(pdfFile);
    setError(null);
    setEditedFileUrl(null);
    setHasUnsavedChanges(false);

    setIsProcessing(true);
    setIsUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", pdfFile);
    const apiUrl = `${
      process.env.NEXT_PUBLIC_API_URL || ""
    }/api/pdf/extract-text`;

    try {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", apiUrl);

      const apiKey = "sk_d6c1daa54dbc95956b281fa02c544e7273ed10df60b211fe";
      xhr.setRequestHeader("x-api-key", apiKey);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 60;
          setProgress(percentComplete);
        }
      };

      xhr.onload = function () {
        setIsUploading(false);

        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText);

          let currentProgress = 60;
          const processingInterval = setInterval(() => {
            currentProgress += Math.random() * 8 + 2;
            setProgress(Math.min(currentProgress, 95));

            if (currentProgress >= 95) {
              clearInterval(processingInterval);

              setTimeout(() => {
                setProgress(100);
                setIsProcessing(false);

                if (data.extractedData?.pages) {
                  setExtractedData(data.extractedData);
                  setOriginalData(
                    JSON.parse(JSON.stringify(data.extractedData))
                  );
                  setSessionId(data.sessionId);

                  const totalBlocks = data.extractedData.pages.reduce(
                    (sum: number, page: PDFPage) => sum + page.texts.length,
                    0
                  );

                  showToast(
                    `Text extracted successfully! Found ${data.extractedData.pages.length} pages with ${totalBlocks} text blocks`,
                    "success"
                  );
                } else {
                  setError("No text found in the PDF");
                  showToast(
                    "No text found - The PDF appears to be empty or contains only images",
                    "error"
                  );
                }
              }, 500);
            }
          }, 100);
        } else {
          setIsProcessing(false);
          setProgress(0);

          try {
            const errorData = JSON.parse(xhr.responseText);
            setError(errorData.error || "Text extraction failed");
            showToast(
              `Text extraction failed: ${
                errorData.error || "Unknown error occurred"
              }`,
              "error"
            );
          } catch (e) {
            setError("Unknown error occurred");
            showToast("Text extraction failed", "error");
          }
        }
      };

      xhr.onerror = function () {
        setIsUploading(false);
        setIsProcessing(false);
        setProgress(0);
        setError("Network error occurred");
        showToast("Network error occurred", "error");
      };

      xhr.send(formData);
    } catch (err) {
      setIsUploading(false);
      setIsProcessing(false);
      setProgress(0);
      setError("Unknown error occurred");
      showToast("Text extraction failed", "error");
    }
  };

  const handleSaveEditedPDF = async () => {
    if (!extractedData || !sessionId) {
      showToast("No data to save", "error");
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("sessionId", sessionId);
    formData.append("editedData", JSON.stringify(extractedData));

    const apiUrl = `${
      process.env.NEXT_PUBLIC_API_URL || ""
    }/api/pdf/save-edited-text`;

    try {
      const apiKey = "sk_d6c1daa54dbc95956b281fa02c544e7273ed10df60b211fe";

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "x-api-key": apiKey },
        body: formData,
      });

      clearInterval(progressInterval);
      const data = await response.json();

      if (response.ok) {
        setProgress(100);
        setEditedFileUrl(data.filename);
        setHasUnsavedChanges(false);
        setIsProcessing(false);

        showToast(
          "PDF saved successfully! Your edited PDF is ready for download",
          "success"
        );
      } else {
        setIsProcessing(false);
        setProgress(0);
        setError(data.error || "Save failed");
        showToast(
          `Save failed: ${data.error || "Unknown error occurred"}`,
          "error"
        );
      }
    } catch (err) {
      setIsProcessing(false);
      setProgress(0);
      setError("Unknown error occurred");
      showToast("Save failed", "error");
    }
  };

  const updateTextBlock = useCallback(
    (pageIndex: number, textIndex: number, newText: string) => {
      if (!extractedData) return;
      const newData = JSON.parse(JSON.stringify(extractedData));
      newData.pages[pageIndex].texts[textIndex].text = newText;
      setExtractedData(newData);
      setHasUnsavedChanges(true);
    },
    [extractedData]
  );

  const handleReset = useCallback(() => {
    if (!hasUnsavedChanges) return;

    const confirm = window.confirm(
      "This will reset all changes. Are you sure?"
    );
    if (!confirm) return;

    if (originalData) {
      setExtractedData(JSON.parse(JSON.stringify(originalData)));
      setHasUnsavedChanges(false);
      setSelectedTextBlock(null);
      showToast("Reset to original", "success");
    }
  }, [hasUnsavedChanges, originalData]);

  const getTotalTextBlocks = () => {
    if (!extractedData) return 0;
    return extractedData.pages.reduce(
      (sum, page) => sum + page.texts.length,
      0
    );
  };

  // Render different states
  if (!extractedData && !isProcessing) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg">
          <div className="p-4 sm:p-8">
            <EnhancedFileDropzone
              onFileAccepted={handleFileUpload}
              disabled={isProcessing}
            />
          </div>
        </div>
      </div>
    );
  }

  if (isUploading || isProcessing) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg">
          <div className="p-4 sm:p-8">
            <div className="max-w-md mx-auto space-y-6">
              {file && (
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
              )}

              <EnhancedProgress
                progress={progress}
                isUploading={isUploading}
                isProcessing={isProcessing}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg">
          <div className="p-4 sm:p-8">
            <div className="max-w-md mx-auto">
              <div className="border border-red-300 bg-red-50 dark:bg-red-950/20 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="text-red-500">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-red-800 dark:text-red-200 text-sm">
                      {error}
                    </p>
                  </div>
                  <button
                    onClick={handleStartOver}
                    className="px-3 py-1 text-sm border border-red-300 rounded-md hover:bg-red-100 dark:hover:bg-red-900/20"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main editor interface
  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4 sm:space-y-6">
      {/* Header - Responsive */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-xl shadow-lg">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-lg sm:text-xl font-bold">
                  PDF Text Editor
                  {hasUnsavedChanges && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 w-fit">
                      Unsaved Changes
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500 mt-1">
                  <span>📄 {extractedData?.pages.length} pages</span>
                  <span className="hidden sm:inline">•</span>
                  <span>📝 {getTotalTextBlocks()} text blocks</span>
                  {file && (
                    <>
                      <span className="hidden sm:inline">•</span>
                      <span>{formatFileSize(file.size)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            {isMobile ? (
              <MobileActionMenu
                hasUnsavedChanges={hasUnsavedChanges}
                onSave={handleSaveEditedPDF}
                onReset={handleReset}
                onStartOver={handleStartOver}
                isProcessing={isProcessing}
              />
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  disabled={!hasUnsavedChanges}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🔄 Reset
                </button>
                <button
                  onClick={handleSaveEditedPDF}
                  disabled={!hasUnsavedChanges || isProcessing}
                  className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  💾 Save PDF
                </button>
                <button
                  onClick={handleStartOver}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  🆕 New PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Page Navigation - Responsive */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md">
        <div className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-4">
              <h3 className="font-semibold text-sm sm:text-base">
                Page {currentPage + 1} of {extractedData?.pages.length}
              </h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="p-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={() =>
                    setCurrentPage(
                      Math.min(extractedData!.pages.length - 1, currentPage + 1)
                    )
                  }
                  disabled={currentPage === extractedData!.pages.length - 1}
                  className="p-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Keyboard shortcuts info - Hidden on mobile */}
            {!isMobile && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>⌨️ Ctrl+S: Save • Ctrl+R: Reset • Ctrl+←→: Navigate</span>
              </div>
            )}
          </div>

          {/* Page thumbnails for quick navigation - Responsive */}
          {extractedData && extractedData.pages.length > 1 && (
            <div className="flex gap-1 mt-3 sm:mt-4 flex-wrap">
              {extractedData.pages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index)}
                  className={cn(
                    "h-7 w-7 sm:h-8 sm:w-8 text-xs rounded border",
                    currentPage === index
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  )}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg">
        <div className="p-3 sm:p-6">
          {extractedData?.pages[currentPage] && (
            <div className="border rounded-lg sm:rounded-xl overflow-hidden">
              {/* Page Header */}
              <div className="p-3 sm:p-4 border-b bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-base sm:text-lg">
                      Page {extractedData.pages[currentPage].page_number}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-500 flex flex-wrap items-center gap-2 sm:gap-4">
                      <span>
                        📝 {extractedData.pages[currentPage].texts.length} text
                        blocks
                      </span>
                      <span>
                        📐 {Math.round(extractedData.pages[currentPage].width)}{" "}
                        × {Math.round(extractedData.pages[currentPage].height)}{" "}
                        px
                      </span>
                    </p>
                  </div>
                  {selectedTextBlock !== null && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 w-fit">
                      Editing Block #{selectedTextBlock + 1}
                    </span>
                  )}
                </div>
              </div>

              {/* Text Blocks List */}
              <div className="p-3 sm:p-4">
                {extractedData.pages[currentPage].texts.length > 0 ? (
                  <div className="space-y-3 max-h-[50vh] sm:max-h-[600px] overflow-y-auto">
                    {extractedData.pages[currentPage].texts.map(
                      (textBlock, textIndex) => (
                        <div
                          key={textIndex}
                          className={cn(
                            "group border rounded-lg transition-all duration-200 hover:shadow-md",
                            selectedTextBlock === textIndex
                              ? "border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 shadow-lg ring-2 ring-blue-200"
                              : "border-gray-200 hover:border-blue-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/30"
                          )}
                        >
                          {/* Text Block Header */}
                          <div
                            className="p-3 sm:p-4 cursor-pointer"
                            onClick={() =>
                              setSelectedTextBlock(
                                selectedTextBlock === textIndex
                                  ? null
                                  : textIndex
                              )
                            }
                          >
                            <div className="flex items-center justify-between mb-2 sm:mb-3">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div
                                  className={cn(
                                    "w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                                    selectedTextBlock === textIndex
                                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                                      : "bg-gray-300 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                                  )}
                                >
                                  {textIndex + 1}
                                </div>
                                <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                                  <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-mono">
                                    {textBlock.font.length > 8 && isMobile
                                      ? textBlock.font.substring(0, 8) + "..."
                                      : textBlock.font}
                                  </span>
                                  <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                                    {Math.round(textBlock.size)}px
                                  </span>
                                  <span className="text-xs text-gray-500 hidden sm:inline">
                                    ({Math.round(textBlock.x0)},{" "}
                                    {Math.round(textBlock.y0)})
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {selectedTextBlock === textIndex && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                    ✏️{" "}
                                    <span className="hidden sm:inline ml-1">
                                      Editing
                                    </span>
                                  </span>
                                )}
                                <div
                                  className={cn(
                                    "p-1 rounded transition-colors",
                                    selectedTextBlock === textIndex
                                      ? "text-blue-600"
                                      : "text-gray-400 group-hover:text-blue-600"
                                  )}
                                >
                                  <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                </div>
                              </div>
                            </div>

                            {/* Preview of text when not editing */}
                            {selectedTextBlock !== textIndex && (
                              <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded p-2 sm:p-3">
                                <span className="font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">
                                  Text Content:
                                </span>
                                <p className="mt-1 leading-relaxed break-words line-clamp-2">
                                  "
                                  {textBlock.text || (
                                    <span className="text-gray-400 italic">
                                      Empty text block
                                    </span>
                                  )}
                                  "
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Editable Text Area (shown when selected) */}
                          {selectedTextBlock === textIndex && (
                            <div className="px-3 sm:px-4 pb-3 sm:pb-4 border-t bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/10 dark:to-purple-950/10">
                              <div className="space-y-3 pt-3 sm:pt-4">
                                <div className="flex items-center justify-between">
                                  <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    ✏️ Edit Text Content:
                                  </label>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedTextBlock(null);
                                    }}
                                    className="text-gray-500 hover:text-gray-700 p-1"
                                  >
                                    <svg
                                      className="h-4 w-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                      />
                                    </svg>
                                  </button>
                                </div>

                                <div className="relative">
                                  <textarea
                                    className="w-full p-3 sm:p-4 text-xs sm:text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 shadow-sm"
                                    value={textBlock.text}
                                    onChange={(e) =>
                                      updateTextBlock(
                                        currentPage,
                                        textIndex,
                                        e.target.value
                                      )
                                    }
                                    rows={Math.max(
                                      3,
                                      Math.ceil(
                                        textBlock.text.length /
                                          (isMobile ? 40 : 60)
                                      )
                                    )}
                                    placeholder="Enter text content..."
                                    autoFocus
                                  />

                                  {/* Character count and instructions */}
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 mt-2 text-xs text-gray-500">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                      <span>
                                        📝 {textBlock.text.length} characters
                                      </span>
                                      {textBlock.text.length > 100 && (
                                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                                          Long text
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-xs">
                                      👆 Tap header to close
                                    </span>
                                  </div>
                                </div>

                                {/* Quick actions - Mobile optimized */}
                                <div className="flex flex-wrap items-center gap-1 sm:gap-2 pt-2 border-t">
                                  <button
                                    onClick={() => {
                                      updateTextBlock(
                                        currentPage,
                                        textIndex,
                                        textBlock.text.toUpperCase()
                                      );
                                    }}
                                    className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                                  >
                                    UPPER
                                  </button>
                                  <button
                                    onClick={() => {
                                      updateTextBlock(
                                        currentPage,
                                        textIndex,
                                        textBlock.text.toLowerCase()
                                      );
                                    }}
                                    className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                                  >
                                    lower
                                  </button>
                                  <button
                                    onClick={() => {
                                      const titleCase = textBlock.text.replace(
                                        /\w\S*/g,
                                        (txt) =>
                                          txt.charAt(0).toUpperCase() +
                                          txt.substr(1).toLowerCase()
                                      );
                                      updateTextBlock(
                                        currentPage,
                                        textIndex,
                                        titleCase
                                      );
                                    }}
                                    className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                                  >
                                    Title
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12 text-gray-500">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <svg
                        className="h-6 w-6 sm:h-8 sm:w-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="font-medium mb-2 text-sm sm:text-base">
                      No text blocks found
                    </h3>
                    <p className="text-xs sm:text-sm">
                      This page doesn't contain any editable text blocks.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Success Result - Mobile optimized */}
      {editedFileUrl && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl shadow-lg">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-semibold text-green-800 dark:text-green-200 text-lg">
                  PDF Saved Successfully! 🎉
                </h3>
                <p className="text-green-700 dark:text-green-300 mt-1 text-sm sm:text-base">
                  Your edited PDF has been generated and is ready for download.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
                  <a
                    href={`${
                      process.env.NEXT_PUBLIC_API_URL || ""
                    }/api/file?folder=edited&filename=${encodeURIComponent(
                      editedFileUrl
                    )}`}
                    download
                    className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium"
                  >
                    💾 Download Edited PDF
                  </a>
                  <button
                    onClick={handleStartOver}
                    className="inline-flex items-center justify-center px-4 py-2 border border-green-300 text-green-700 rounded-lg font-medium hover:bg-green-50"
                  >
                    🆕 Edit Another PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
