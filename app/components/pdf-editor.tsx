// components/pdf/libreoffice-editor.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Save,
  ZoomIn,
  ZoomOut,
  ArrowLeft,
  ArrowRight,
  Check,
  Square,
} from "lucide-react";

interface PDFElement {
  id: string;
  type: string;
  text?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  pageNum: number;
  font?: string;
  fontSize?: number;
  checked?: boolean;
}

interface PDFImage {
  id: string;
  path: string;
  x: number;
  y: number;
  width: number;
  height: number;
  pageNum: number;
}

interface PDFPage {
  number: number;
  width: number;
  height: number;
}

interface PDFContent {
  pages: PDFPage[];
  elements: PDFElement[];
  images: PDFImage[];
}

interface LibreOfficeEditorProps {
  pdfFile: File;
  onComplete: (fileUrl: string) => void;
  onCancel: () => void;
}

export function LibreOfficeEditor({
  pdfFile,
  onComplete,
  onCancel,
}: LibreOfficeEditorProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState("");
  const [content, setContent] = useState<PDFContent | null>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // API key - in a real app, store this securely
  const API_KEY = "sk_d6c1daa54dbc95956b281fa02c544e7273ed10df60b211fe"; // Replace with your actual API key or get from env vars

  useEffect(() => {
    if (pdfFile) {
      uploadPDF();
    }
  }, [pdfFile]);

  const uploadPDF = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", pdfFile);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const endpoint = `${apiUrl}/api/pdf/edit/upload`;

      // Create XMLHttpRequest
      const xhr = new XMLHttpRequest();

      // Setup promise to handle XHR
      const uploadPromise = new Promise<any>((resolve, reject) => {
        xhr.open("POST", endpoint);

        // Set headers including API key
        xhr.setRequestHeader("x-api-key", API_KEY);

        xhr.onload = function () {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve(data);
            } catch (e) {
              reject(new Error("Invalid JSON response"));
            }
          } else {
            reject(new Error(`HTTP error ${xhr.status}: ${xhr.statusText}`));
          }
        };

        xhr.onerror = function () {
          reject(new Error("Network error occurred"));
        };

        // Optional: Track upload progress
        xhr.upload.onprogress = function (event) {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            console.log(`Upload progress: ${percentComplete.toFixed(2)}%`);
          }
        };

        xhr.send(formData);
      });

      // Wait for upload to complete
      const data = await uploadPromise;

      // Process response
      setContent(data.content);
      setEditId(data.editId);
    } catch (error) {
      console.error("Error uploading PDF:", error);
      toast.error("Failed to prepare PDF for editing");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!content || !editId) {
      toast.error("No content to save");
      return;
    }

    try {
      setSaving(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const endpoint = `${apiUrl}/api/pdf/edit/save`;

      // Create XMLHttpRequest for saving
      const xhr = new XMLHttpRequest();

      // Setup promise to handle XHR
      const savePromise = new Promise<any>((resolve, reject) => {
        xhr.open("POST", endpoint);

        // Set headers including API key and content type
        xhr.setRequestHeader("x-api-key", API_KEY);
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.onload = function () {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve(data);
            } catch (e) {
              reject(new Error("Invalid JSON response"));
            }
          } else {
            reject(new Error(`HTTP error ${xhr.status}: ${xhr.statusText}`));
          }
        };

        xhr.onerror = function () {
          reject(new Error("Network error occurred"));
        };

        // Convert content to JSON and send
        const jsonData = JSON.stringify({
          editId,
          content,
        });

        xhr.send(jsonData);
      });

      // Wait for save to complete
      const data = await savePromise;

      // Process save response
      onComplete(data.fileUrl);
    } catch (error) {
      console.error("Error saving PDF:", error);
      toast.error("Failed to save edited PDF");
    } finally {
      setSaving(false);
    }
  };

  const handleTextChange = (id: string, newText: string) => {
    if (!content) return;

    setContent({
      ...content,
      elements: content.elements.map((el) =>
        el.id === id ? { ...el, text: newText } : el
      ),
    });
  };

  const toggleCheckbox = (id: string) => {
    if (!content) return;

    setContent({
      ...content,
      elements: content.elements.map((el) =>
        el.id === id && el.type === "checkbox"
          ? { ...el, checked: !el.checked }
          : el
      ),
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="ml-2">Analyzing PDF content...</p>
      </div>
    );
  }

  // If content is null after loading is complete, show an error
  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px]">
        <p className="text-lg text-red-500 mb-4">
          Failed to extract PDF content
        </p>
        <Button onClick={onCancel}>Go Back</Button>
      </div>
    );
  }

  const currentPageData =
    content.pages.find((p) => p.number === currentPage) || content.pages[0];
  const totalPages = content.pages.length;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex justify-between items-center bg-gray-100 p-2 border-b">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom((prev) => Math.max(0.5, prev - 0.1))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm">{Math.round(zoom * 100)}%</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom((prev) => Math.min(2, prev + 0.1))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
          >
            Next <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="animate-spin mr-2">⟳</span> Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" /> Save
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        className="flex-1 overflow-auto bg-gray-200 p-4"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px)",
          backgroundSize: "20mm 20mm",
        }}
      >
        <div
          className="bg-white shadow-lg mx-auto relative"
          style={{
            width: `${currentPageData.width * zoom}px`,
            height: `${currentPageData.height * zoom}px`,
            transformOrigin: "top center",
          }}
        >
          {/* Text Elements */}
          {content.elements
            .filter((el) => el.pageNum === currentPage && el.type === "text")
            .map((element) => (
              <div
                key={element.id}
                className={`absolute cursor-text ${
                  selectedElement === element.id
                    ? "border border-blue-500 bg-blue-50"
                    : ""
                }`}
                style={{
                  left: `${element.x * zoom}px`,
                  top: `${element.y * zoom}px`,
                  width: `${element.width * zoom}px`,
                  height: `${element.height * zoom}px`,
                  fontSize: `${(element.fontSize || 12) * zoom}px`,
                  fontFamily: element.font || "serif",
                  fontWeight: element.font?.includes("Bold")
                    ? "bold"
                    : "normal",
                  fontStyle: element.font?.includes("Italic")
                    ? "italic"
                    : "normal",
                }}
                onClick={() => setSelectedElement(element.id)}
                contentEditable={selectedElement === element.id}
                suppressContentEditableWarning={true}
                onBlur={(e) =>
                  handleTextChange(
                    element.id,
                    e.currentTarget.textContent || ""
                  )
                }
              >
                {element.text}
              </div>
            ))}

          {/* Checkbox Elements */}
          {content.elements
            .filter(
              (el) => el.pageNum === currentPage && el.type === "checkbox"
            )
            .map((element) => (
              <div
                key={element.id}
                className={`absolute cursor-pointer ${
                  selectedElement === element.id ? "border border-blue-500" : ""
                }`}
                style={{
                  left: `${element.x * zoom}px`,
                  top: `${element.y * zoom}px`,
                  width: `${element.width * zoom}px`,
                  height: `${element.height * zoom}px`,
                }}
                onClick={() => toggleCheckbox(element.id)}
              >
                <div className="border border-black w-full h-full flex items-center justify-center">
                  {element.checked ? (
                    <Check className="w-full h-full p-1" />
                  ) : null}
                </div>
              </div>
            ))}

          {/* Images */}
          {content.images
            .filter((img) => img.pageNum === currentPage)
            .map((image) => (
              <img
                key={image.id}
                src={image.path}
                className={`absolute ${
                  selectedElement === image.id ? "border-2 border-blue-500" : ""
                }`}
                style={{
                  left: `${image.x * zoom}px`,
                  top: `${image.y * zoom}px`,
                  width: `${image.width * zoom}px`,
                  height: `${image.height * zoom}px`,
                }}
                alt="PDF content"
                onClick={() => setSelectedElement(image.id)}
              />
            ))}
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-gray-100 p-2 border-t text-sm text-gray-600">
        <p>Click on text to edit. Click on checkboxes to toggle.</p>
      </div>
    </div>
  );
}
