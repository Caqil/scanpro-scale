"use client";

import { useState, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { FileIcon, Cross2Icon, UploadIcon } from "@radix-ui/react-icons";
import {
  AlertCircle,
  FileText,
  Loader2,
  MessageSquare,
  Bot,
  User,
  Send,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguageStore } from "@/src/store/store";
import { UploadProgress } from "@/components/ui/upload-progress";
import useFileUpload from "@/hooks/useFileUpload";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatSession {
  sessionId: string;
  messages: Message[];
  createdAt: string;
}

export function PdfChat() {
  const { t } = useLanguageStore();
  const [file, setFile] = useState<File | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Use our custom upload hook
  const {
    isUploading,
    progress: uploadProgress,
    error: uploadError,
    uploadFile,
    resetUpload,
    uploadStats,
  } = useFileUpload();

  // Set up dropzone for PDF files only
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
    },
    maxSize: 50 * 1024 * 1024, // 50MB per file
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.file.size > 50 * 1024 * 1024) {
          setError(
            t("fileUploader.maxSize") ||
              "File is too large. Maximum size is 50MB."
          );
        } else {
          setError(
            t("fileUploader.inputFormat") || "Please upload a valid PDF file."
          );
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        // Clear any previous errors and session
        setError(null);
        resetUpload();
        setFile(acceptedFiles[0]);
        setSessionId(null);
        setMessages([]);

        // Automatically upload the file when selected
        handleFileUpload(acceptedFiles[0]);
      }
    },
    multiple: false,
  });

  // Load chat history when session is established
  useEffect(() => {
    if (sessionId) {
      fetchChatHistory(sessionId);
    }
  }, [sessionId]);

  // Fetch chat history for a session
  const fetchChatHistory = async (sid: string) => {
    try {
      const response = await fetch(`/api/pdf/chat?sessionId=${sid}`);

      if (!response.ok) {
        console.error("Failed to fetch chat history:", response.statusText);
        return;
      }

      const data = await response.json();

      if (data.success && data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };

  // Scroll chat container to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current && chatContainerRef.current) {
      // Use the chat container's scrolling instead of scrollIntoView
      // This prevents the whole page from scrolling
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

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
    setSessionId(null);
    setMessages([]);
    setError(null);
  };

  // Handle file upload and create chat session
  const handleFileUpload = async (selectedFile: File) => {
    setIsLoadingPdf(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      await uploadFile(selectedFile, formData, {
        url: "/api/pdf/chat",
        onProgress: (progress) => {
          // Progress is handled by the upload hook
        },
        onSuccess: (data) => {
          setSessionId(data.sessionId);

          // Add initial welcome message if provided
          if (data.message) {
            setMessages([
              {
                role: "assistant",
                content: data.message,
                timestamp: new Date().toISOString(),
              },
            ]);
          }

          toast.success("PDF uploaded successfully", {
            description: "You can now ask questions about the document.",
          });
        },
        onError: (error) => {
          setError(
            t("pdfChat.uploadError") ||
              "Failed to upload PDF. Please try again."
          );
          toast.error("Upload failed", {
            description:
              error.message || "Please try again with a different PDF.",
          });
          console.error("Upload error:", error);
        },
      });
    } catch (error) {
      setError(
        t("pdfChat.uploadError") || "Failed to upload PDF. Please try again."
      );
      toast.error("Upload failed");
      console.error("Upload error:", error);
    } finally {
      setIsLoadingPdf(false);
    }
  };

  // Handle sending a message
  const sendMessage = async () => {
    if (!inputValue.trim() || !sessionId) return;

    const userMessage = inputValue.trim();
    const newMessage: Message = {
      role: "user",
      content: userMessage,
      timestamp: new Date().toISOString(),
    };

    // Add user message to UI immediately
    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
    setIsProcessing(true);

    try {
      const response = await fetch("/api/pdf/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          message: userMessage,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `API returned ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();

      if (data.success && data.message) {
        // Add AI response to messages
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.message,
            timestamp: new Date().toISOString(),
          },
        ]);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Chat error:", error);

      // Add error message to chat
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            t("pdfChat.errorResponse") ||
            "Sorry, I encountered an error processing your question. Please try again.",
          timestamp: new Date().toISOString(),
        },
      ]);

      toast.error("Failed to get response", {
        description: "There was a problem processing your question.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle input submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && sessionId) {
      sendMessage();
    }
  };

  // Handle key press (Ctrl+Enter or Cmd+Enter to send)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      if (inputValue.trim() && sessionId) {
        sendMessage();
      }
    }
  };

  return (
    <Card className="border shadow-sm flex flex-col h-[600px] relative">
      <CardHeader className="px-4 py-3 flex-shrink-0">
        <CardTitle className="text-xl">
          {t("pdfChat.title") || "Ask Anything PDF Chat"}
        </CardTitle>
        <CardDescription>
          {t("pdfChat.description") ||
            "Upload a PDF and ask questions about its content"}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0 flex-grow overflow-hidden">
        {!sessionId ? (
          // File upload UI
          <div className="h-full p-4">
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer h-full flex flex-col justify-center",
                isDragActive
                  ? "border-primary bg-primary/10"
                  : file
                  ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50",
                (isUploading || isLoadingPdf) &&
                  "pointer-events-none opacity-80"
              )}
            >
              <input
                {...getInputProps()}
                disabled={isUploading || isLoadingPdf}
              />

              {file ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  {isUploading || isLoadingPdf ? (
                    <UploadProgress
                      progress={uploadProgress}
                      isUploading={isUploading}
                      isProcessing={isLoadingPdf}
                      processingProgress={uploadProgress}
                      error={uploadError}
                      label={
                        isUploading
                          ? t("pdfChat.uploading") || "Uploading PDF..."
                          : t("pdfChat.processing") || "Processing PDF..."
                      }
                      uploadStats={uploadStats}
                    />
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile();
                      }}
                    >
                      <Cross2Icon className="h-4 w-4 mr-1" />{" "}
                      {t("ui.remove") || "Remove"}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <UploadIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="text-lg font-medium">
                    {isDragActive
                      ? t("fileUploader.dropHere") || "Drop your PDF file here"
                      : t("pdfChat.uploadPrompt") || "Upload your PDF document"}
                  </div>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    {t("pdfChat.dropHereDesc") ||
                      "Drop your PDF file here or click to browse. I'll analyze it so you can ask questions about the content."}
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="mt-2"
                  >
                    {t("fileUploader.browse") || "Browse Files"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Chat messages UI
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">{file?.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                disabled={isProcessing}
              >
                <Cross2Icon className="h-4 w-4 mr-1" />
                {t("pdfChat.newPdf") || "New PDF"}
              </Button>
            </div>

            <div
              ref={chatContainerRef}
              className="flex-grow overflow-y-auto px-4 py-3 space-y-4"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(155, 155, 155, 0.5) transparent",
                maxHeight: "100%",
                height: "390px", // Fixed height to ensure proper scrolling containment
              }}
            >
              {messages.length > 0 ? (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex gap-2 p-3 rounded-lg",
                      message.role === "user"
                        ? "bg-primary/10 ml-4"
                        : "bg-muted/40 mr-4"
                    )}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {message.role === "user" ? (
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <Bot className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div className="flex-grow overflow-hidden">
                      <div className="text-sm prose dark:prose-invert max-w-none">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-10">
                  <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                  <p className="text-center text-sm">
                    {t("pdfChat.noMessages") ||
                      "Ask any question about the PDF document, and I'll search for answers in its content."}
                  </p>
                </div>
              )}
              {isProcessing && (
                <div className="flex gap-2 p-3 rounded-lg bg-muted/40 mr-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div className="text-sm flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      {t("pdfChat.thinking") || "Thinking..."}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t mt-auto">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  placeholder={
                    t("pdfChat.askPrompt") ||
                    "Ask a question about the document..."
                  }
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isProcessing}
                  className="flex-grow"
                />
                <Button
                  type="submit"
                  disabled={isProcessing || !inputValue.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {t("pdfChat.send") || "Send"}
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <Alert variant="destructive" className="m-4 mt-0">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter className="flex justify-between border-t pt-3 pb-3 px-4 text-xs text-muted-foreground">
        <div>
          {t("pdfChat.securityNote") ||
            "Your files are processed securely and not stored permanently."}
        </div>
        <div>{t("pdfChat.poweredBy") || "Powered by OpenAI"}</div>
      </CardFooter>
    </Card>
  );
}
