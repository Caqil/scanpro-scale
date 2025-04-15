"use client";
import React, { memo } from "react";
import { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useLanguageStore } from "@/src/store/store";
import {
  TypeIcon,
  FileTextIcon,
  UploadIcon,
  Trash2Icon,
  XIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LoaderIcon,
  DownloadIcon,
  RotateCcwIcon,
  PencilIcon,
  ImageIcon,
  TextIcon,
  MousePointerIcon,
  SaveIcon,
} from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export type Position = { x: number; y: number };
export type Size = { width: number; height: number };

export interface TextElement {
  id: string;
  type: "text";
  position: Position;
  size: Size;
  text: string;
  originalText: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  page: number;
}

interface PdfPage {
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  imageUrl?: string;
}

interface Props {
  initialTool?: string;
}

/**
 * PDF Editor Component
 * A clean, modern interface for editing PDF text with OCR capabilities.
 */
export function PdfEditor({ initialTool = "select" }: Props) {
  const { t } = useLanguageStore();

  const [file, setFile] = useState<File | null>(null);
  const [activeTool, setActiveTool] = useState<string>(initialTool);
  const [pages, setPages] = useState<PdfPage[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [processing, setProcessing] = useState<boolean>(false);
  const [ocrProcessing, setOcrProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [editedPdfUrl, setEditedPdfUrl] = useState<string>("");
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [draggedElement, setDraggedElement] = useState<TextElement | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [currentEditText, setCurrentEditText] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(16);
  const [fontFamily, setFontFamily] = useState<string>("Arial");
  const [textColor, setTextColor] = useState<string>("#000000");
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [performOcr, setPerformOcr] = useState<boolean>(true);
  const [ocrLanguage, setOcrLanguage] = useState<string>("eng");
  const [processedText, setProcessedText] = useState<string>("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileReader = useRef<FileReader | null>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fileReader.current = new FileReader();
    return () => {
      fileReader.current = null;
    };
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const uploadedFile = files[0];
    if (uploadedFile.type !== "application/pdf") {
      toast.error(t("ui.error"));
      return;
    }

    setFile(uploadedFile);
    setTextElements([]);
    setEditedPdfUrl("");
    setCurrentPage(0);
    setProcessedText("");

    processPdf(uploadedFile);
  };

  const processPdf = async (pdfFile: File) => {
    setProcessing(true);
    setProgress(0);
  
    try {
      const fileUrl = URL.createObjectURL(pdfFile);
      const pdf = await pdfjs.getDocument(fileUrl).promise;
      const numPages = pdf.numPages;
      const newPages: PdfPage[] = [];
  
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1 });
        
        // Store the original dimensions for proper scaling
        newPages.push({
          width: viewport.width,
          height: viewport.height,
          originalWidth: viewport.width,
          originalHeight: viewport.height,
        });
        
        setProgress(Math.floor((i / numPages) * 25)); // 25% progress for loading document
      }
  
      setPages(newPages);
      
      // Process OCR if checkbox is checked
      if (performOcr) {
        await processOcr(pdfFile, newPages);
      } else {
        setProcessing(false);
        setProgress(100);
      }
      
      URL.revokeObjectURL(fileUrl);
    } catch (error) {
      console.error("Error processing PDF:", error);
      toast.error("Error processing PDF");
      setProcessing(false);
    }
  };

  const processOcr = async (pdfFile: File, pdfPages: PdfPage[]) => {
    setOcrProcessing(true);
    setProgress(25); // Start at 25% (after document loading)
    
    try {
      // Create form data for OCR processing
      const formData = new FormData();
      formData.append("file", pdfFile);
      formData.append("ocrLanguage", ocrLanguage);
      
      // Send to backend for OCR processing
      const response = await fetch("/api/pdf/process", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("OCR processing failed");
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || "Unknown error during OCR");
      }
      
      // Update pages with image URLs for preview
      const updatedPages = [...pdfPages];
      data.pages.forEach((pageInfo: any, index: number) => {
        if (index < updatedPages.length) {
          updatedPages[index].imageUrl = pageInfo.imageUrl;
        }
      });
      
      setPages(updatedPages);
      setProgress(75); // 75% after OCR
      
      // Extract the text content and convert to editable elements
      const extractedText = data.text || "";
      setProcessedText(extractedText);
      
      // Create text elements from extracted blocks
      if (data.textBlocks && Array.isArray(data.textBlocks)) {
        const newTextElements: TextElement[] = data.textBlocks.map((block: any) => ({
          id: `text-${block.id || Date.now() + Math.random()}`,
          type: "text",
          position: { 
            x: block.x || 0, 
            y: block.y || 0 
          },
          size: { 
            width: block.width || 100, 
            height: block.height || 20 
          },
          text: block.text || "",
          originalText: block.text || "",
          fontSize: block.fontSize || 12,
          fontFamily: "Arial",
          color: "#000000",
          page: block.page || 0,
        }));
        
        setTextElements(newTextElements);
      }
      
      setProgress(100);
    } catch (error) {
      console.error("OCR processing error:", error);
      toast.error("OCR processing failed. Text editing may be limited.");
      
      // Create basic text elements without OCR data
      // This allows editing even if OCR fails
      const basicTextElement: TextElement = {
        id: `text-default`,
        type: "text",
        position: { x: 50, y: 50 },
        size: { width: 200, height: 30 },
        text: "Add text here",
        originalText: "",
        fontSize: 16,
        fontFamily: "Arial",
        color: "#000000",
        page: 0,
      };
      
      setTextElements([basicTextElement]);
      setProgress(100);
    } finally {
      setOcrProcessing(false);
      setProcessing(false);
    }
  };

  const handleAddTextElement = () => {
    if (!canvasRef.current || pages.length === 0 || currentPage >= pages.length) return;

    const canvasBounds = canvasRef.current.getBoundingClientRect();
    const centerX = (canvasBounds.width - 200) / 2;
    const centerY = (canvasBounds.height - 50) / 2;

    const newElement: TextElement = {
      id: `text-${Date.now()}`,
      type: "text",
      position: { x: centerX, y: centerY },
      size: { width: 200, height: 30 },
      text: "New text",
      originalText: "",
      fontSize: fontSize,
      fontFamily: fontFamily,
      color: textColor,
      page: currentPage,
    };

    setTextElements([...textElements, newElement]);
    setSelectedElement(newElement.id);
    setCurrentEditText(newElement.text);
    setIsEditing(true);
  };

  const handleElementClick = (
    event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
    element: TextElement
  ) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (activeTool === "select") {
      setSelectedElement(element.id);
      setCurrentEditText(element.text);
    } else if (activeTool === "edit") {
      setSelectedElement(element.id);
      setCurrentEditText(element.text);
      setIsEditing(true);
      
      // Focus the textarea after a brief delay to allow rendering
      setTimeout(() => {
        if (editTextareaRef.current) {
          editTextareaRef.current.focus();
        }
      }, 50);
    }
  };

  const handleTextEditComplete = () => {
    if (!selectedElement) return;
    
    setTextElements(prev => 
      prev.map(element => 
        element.id === selectedElement 
          ? { ...element, text: currentEditText } 
          : element
      )
    );
    
    setIsEditing(false);
  };

  const handleElementMoveStart = (
    event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
    element: TextElement
  ) => {
    if (activeTool !== "select" || isEditing) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    if (event.target instanceof HTMLElement && event.target.closest('.text-element')) {
      setIsDragging(true);
      setDraggedElement(element);
      if ("touches" in event) {
        document.body.style.overflow = 'hidden';
      }
      
      // Capture the PDF scale ratio for accurate positioning
      if (canvasRef.current && pages[currentPage]) {
        const pdfElement = canvasRef.current.querySelector('.react-pdf__Page');
        if (pdfElement) {
          const pdfWidth = pdfElement.clientWidth;
          const pdfScale = pdfWidth / pages[currentPage].originalWidth;
          
          // Store the scale as a data attribute for later use
          canvasRef.current.dataset.pdfScale = pdfScale.toString();
        }
      }
    }
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!canvasRef.current || !isDragging || !draggedElement) return;
  
    event.preventDefault();
    const canvasBounds = canvasRef.current.getBoundingClientRect();
    
    // Get the PDF scale from data attribute
    const pdfScale = parseFloat(canvasRef.current.dataset.pdfScale || "1");
  
    let clientX: number, clientY: number;
    if ("touches" in event) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }
  
    // Get the PDF element for better position calculations
    const pdfElement = canvasRef.current.querySelector('.react-pdf__Page');
    if (!pdfElement) return;
    
    const pdfBounds = pdfElement.getBoundingClientRect();
    
    // Calculate position relative to the PDF, not the canvas
    const x = clientX - pdfBounds.left;
    const y = clientY - pdfBounds.top;
  
    // Apply PDF scale for accurate positioning
    const scaledWidth = draggedElement.size.width * pdfScale;
    const scaledHeight = draggedElement.size.height * pdfScale;
    
    const newX = x - scaledWidth / 2;
    const newY = y - scaledHeight / 2;

    // Constrain to PDF bounds
    const constrainedX = Math.max(0, Math.min(newX, pdfBounds.width - scaledWidth));
    const constrainedY = Math.max(0, Math.min(newY, pdfBounds.height - scaledHeight));

    // Convert back to document coordinates by dividing by scale
    setTextElements((prevElements) =>
      prevElements.map((el) =>
        el.id === draggedElement.id 
          ? { 
              ...el, 
              position: { 
                x: constrainedX / pdfScale, 
                y: constrainedY / pdfScale 
              } 
            } 
          : el
      )
    );
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    setDraggedElement(null);
    document.body.style.overflow = "";
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Deselect elements when clicking outside elements
    if (event.target === event.currentTarget || (event.target as HTMLElement).classList.contains('react-pdf__Page')) {
      setSelectedElement(null);
      setIsEditing(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedElement(null);
    setIsEditing(false);
  };

  const handleSavePdf = async () => {
    if (!file || pages.length === 0) return;

    setProcessing(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("textElements", JSON.stringify(textElements));
      formData.append("pages", JSON.stringify(pages));

      const response = await fetch("/api/pdf/save", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to save PDF");
      }

      const result = await response.json();

      if (result.success) {
        setEditedPdfUrl(result.fileUrl);
        setProgress(100);
        toast.success("PDF edited successfully");
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error saving PDF:", error);
      toast.error("Error saving PDF");
    } finally {
      setProcessing(false);
    }
  };

  const TextElementComponent = memo(
    ({ 
      element, 
      selectedElement, 
      isEditing,
      currentEditText,
      setCurrentEditText,
      handleElementClick,
      handleElementMoveStart,
      editTextareaRef,
    }: {
      element: TextElement;
      selectedElement: string | null;
      isEditing: boolean;
      currentEditText: string;
      setCurrentEditText: React.Dispatch<React.SetStateAction<string>>;
      handleElementClick: (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, element: TextElement) => void;
      handleElementMoveStart: (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, element: TextElement) => void;
      editTextareaRef: React.RefObject<HTMLTextAreaElement | null>;
    }) => {
      const pdfScale = canvasRef.current?.dataset.pdfScale 
        ? parseFloat(canvasRef.current.dataset.pdfScale) 
        : 1;
        
      const elementStyles: React.CSSProperties = {
        position: "absolute",
        left: `${element.position.x * pdfScale}px`,
        top: `${element.position.y * pdfScale}px`,
        width: `${element.size.width * pdfScale}px`,
        minHeight: `${element.size.height * pdfScale}px`,
        cursor: activeTool === "select" ? "move" : "pointer",
        border: selectedElement === element.id 
          ? isEditing 
            ? "2px solid #3b82f6" 
            : "2px dashed #3b82f6" 
          : "1px solid transparent",
        borderRadius: "4px",
        display: "flex",
        alignItems: "flex-start",
        userSelect: "none",
        touchAction: "none",
        zIndex: selectedElement === element.id ? 999 : 1,
        backgroundColor: selectedElement === element.id && isEditing 
          ? "rgba(255, 255, 255, 0.95)" 
          : selectedElement === element.id 
            ? "rgba(255, 255, 255, 0.5)" 
            : "transparent",
        padding: "4px",
        fontSize: `${element.fontSize}px`,
        fontFamily: element.fontFamily || "Arial",
        color: element.color || "#000000",
        transition: "border 0.2s ease, background-color 0.2s ease",
        overflow: "hidden",
      };
  
      return (
        <div
          key={element.id}
          style={elementStyles}
          className="text-element"
          onClick={(e) => handleElementClick(e, element)}
          onMouseDown={(e) => handleElementMoveStart(e, element)}
          onTouchStart={(e) => handleElementMoveStart(e, element)}
        >
          {selectedElement === element.id && isEditing ? (
            <textarea
              ref={editTextareaRef}
              value={currentEditText}
              onChange={(e) => setCurrentEditText(e.target.value)}
              style={{
                width: "100%",
                height: "100%",
                minHeight: "30px",
                border: "none",
                outline: "none",
                backgroundColor: "transparent",
                resize: "none",
                fontSize: "inherit",
                fontFamily: "inherit",
                color: "inherit",
                padding: "0",
                margin: "0",
              }}
              autoFocus
            />
          ) : (
            <div style={{ 
              width: "100%", 
              wordBreak: "break-word",
              whiteSpace: "pre-wrap",
            }}>
              {element.text}
            </div>
          )}
          
          {selectedElement === element.id && (
            <button
              className="absolute -top-3 -right-3 bg-destructive rounded-full p-1 shadow-md hover:bg-destructive/90 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setTextElements((prev) => prev.filter((el) => el.id !== element.id));
                setSelectedElement(null);
                setIsEditing(false);
              }}
              title="Remove element"
            >
              <XIcon className="h-3 w-3 text-white" />
            </button>
          )}
        </div>
      );
    }
  );
  
  const renderTextElements = () => {
    return textElements
      .filter((element) => element.page === currentPage)
      .map((element) => (
        <TextElementComponent
          key={element.id}
          element={element}
          selectedElement={selectedElement}
          isEditing={isEditing}
          currentEditText={currentEditText}
          setCurrentEditText={setCurrentEditText}
          handleElementClick={handleElementClick}
          handleElementMoveStart={handleElementMoveStart}
          editTextareaRef={editTextareaRef}
        />
      ));
  };

  const renderPageThumbnails = () => {
    return (
      <div className="space-y-3 p-2">
        {pages.map((_, index) => (
          <div
            key={index}
            className={`cursor-pointer transition-all duration-200 rounded-md overflow-hidden ${
              currentPage === index 
                ? "border-2 border-primary shadow-md" 
                : "border border-muted hover:border-muted-foreground/50"
            }`}
            onClick={() => setCurrentPage(index)}
          >
            {pages[index].imageUrl ? (
              <div 
                style={{
                  width: "70px", 
                  height: "100px", 
                  backgroundImage: `url(${pages[index].imageUrl})`,
                  backgroundSize: "cover", 
                  backgroundPosition: "center"
                }}
              />
            ) : (
              <Document file={file}>
                <Page
                  pageNumber={index + 1}
                  width={70}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>
            )}
            <div className="text-center text-xs py-1 font-medium bg-muted/50">
              {index + 1}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-muted/30 rounded-lg p-1 md:p-4 w-full">
      <div className="flex flex-col h-[calc(100vh-10rem)] md:h-[calc(100vh-12rem)] bg-background rounded-lg overflow-hidden border shadow-sm">
        {/* Header */}
        <div className="bg-muted/20 border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="text-lg font-semibold flex items-center gap-2">
              <PencilIcon className="h-5 w-5 text-primary" />
              <span>PDF Editor</span>
            </div>
          </div>
          
          {file && !processing && !editedPdfUrl && (
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setFile(null);
                  setTextElements([]);
                  setEditedPdfUrl("");
                  setPages([]);
                }}
              >
                <Trash2Icon className="h-4 w-4 mr-2" />
                Clear
              </Button>
              
              <Button 
                size="sm"
                onClick={handleSavePdf}
              >
                <SaveIcon className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </div>

        {/* File Upload Section */}
        {!file && (
          <div className="flex-1 flex items-center justify-center p-6">
            <Card className="w-full max-w-2xl">
              <CardContent className="p-8">
                <div
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                    isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/20"
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
                        toast.error("Please upload a PDF file");
                        return;
                      }
                      setFile(uploadedFile);
                      setTextElements([]);
                      setEditedPdfUrl("");
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
                  <h3 className="text-2xl font-semibold mb-3">Upload PDF to Edit</h3>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    Drag and drop your PDF file here, or click to browse
                  </p>
                  
                  <div className="flex flex-col gap-4">
                    <Button 
                      size="lg"
                      className="px-8 mx-auto"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Browse Files
                    </Button>
                    
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <input
                        type="checkbox"
                        id="performOcr"
                        checked={performOcr}
                        onChange={(e) => setPerformOcr(e.target.checked)}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="performOcr" className="text-sm cursor-pointer">
                        Perform OCR (for scanned documents)
                      </Label>
                    </div>
                    
                    {performOcr && (
                      <div className="flex justify-center gap-2 mt-1">
                        <Label htmlFor="ocrLanguage" className="text-sm my-auto">
                          Language:
                        </Label>
                        <select
                          id="ocrLanguage"
                          value={ocrLanguage}
                          onChange={(e) => setOcrLanguage(e.target.value)}
                          className="h-8 px-2 rounded-md border border-input text-sm"
                        >
                          <option value="eng">English</option>
                          <option value="fra">French</option>
                          <option value="deu">German</option>
                          <option value="spa">Spanish</option>
                          <option value="ita">Italian</option>
                          <option value="por">Portuguese</option>
                          <option value="rus">Russian</option>
                          <option value="chi_sim">Chinese (Simplified)</option>
                          <option value="jpn">Japanese</option>
                          <option value="kor">Korean</option>
                        </select>
                      </div>
                    )}
                  </div>
                  
                  <p className="mt-6 text-sm text-muted-foreground">
                    Your files are processed securely. All uploads are automatically deleted after 24 hours.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Processing Section */}
        {file && processing && !editedPdfUrl && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="bg-background rounded-lg p-8 shadow-sm border w-96 text-center">
              <LoaderIcon className="h-16 w-16 animate-spin text-primary mb-6 mx-auto" />
              <h3 className="text-xl font-semibold mb-3">
                {ocrProcessing ? "Processing OCR..." : "Processing PDF..."}
              </h3>
              <p className="text-muted-foreground mb-6">
                {ocrProcessing 
                  ? "Extracting text and creating editable content..." 
                  : "Analyzing document structure..."}
              </p>
              <Progress value={progress} className="w-full h-2" />
            </div>
          </div>
        )}

        {/* PDF Viewer and Editing Area */}
        {file && !processing && !editedPdfUrl && pages.length > 0 && (
          <div className="flex-1 flex overflow-hidden">
            {/* Left Sidebar: Page Thumbnails */}
            <div className="w-24 bg-muted/10 border-r overflow-y-auto hidden md:block">
              {renderPageThumbnails()}
            </div>

                          {/* Main PDF Viewer */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Editing toolbar */}
              <div className="bg-muted/10 border-b p-2 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Button
                    variant={activeTool === 'select' ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setActiveTool('select');
                      setIsEditing(false);
                    }}
                    className="flex items-center gap-1"
                  >
                    <MousePointerIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Select</span>
                  </Button>
                  <Button
                    variant={activeTool === 'edit' ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setActiveTool('edit');
                    }}
                    className="flex items-center gap-1"
                  >
                    <PencilIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                  <Button
                    variant={activeTool === 'add-text' ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setActiveTool('add-text');
                      setIsEditing(false);
                      handleAddTextElement();
                    }}
                    className="flex items-center gap-1"
                  >
                    <TextIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Add Text</span>
                  </Button>
                </div>
                
                {isEditing && (
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setIsEditing(false);
                        
                        // Reset to original text if present
                        if (selectedElement) {
                          const element = textElements.find(el => el.id === selectedElement);
                          if (element && element.originalText) {
                            setCurrentEditText(element.originalText);
                            setTextElements(prev => 
                              prev.map(el => 
                                el.id === selectedElement 
                                  ? { ...el, text: element.originalText } 
                                  : el
                              )
                            );
                          }
                        }
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={handleTextEditComplete}
                    >
                      Apply
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex-1 relative">
                <div
                  ref={canvasRef}
                  className="absolute inset-0 bg-muted/5 overflow-auto"
                  onClick={handleCanvasClick}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                  onTouchMove={handleCanvasMouseMove}
                  onTouchEnd={handleCanvasMouseUp}
                  onTouchCancel={handleCanvasMouseUp}
                >
                  <div className="min-h-full flex items-center justify-center p-4">
                    <div className="relative shadow-lg">
                      {pages[currentPage]?.imageUrl ? (
                        // If OCR has generated an image preview, show that
                        <div 
                          style={{
                            width: Math.min(
                              Math.max(pages[currentPage].width, 400),
                              canvasRef.current ? canvasRef.current.clientWidth - 80 : 800
                            ),
                            height: Math.min(
                              pages[currentPage].height * (
                                Math.min(
                                  Math.max(pages[currentPage].width, 400),
                                  canvasRef.current ? canvasRef.current.clientWidth - 80 : 800
                                ) / pages[currentPage].width
                              ),
                              canvasRef.current ? canvasRef.current.clientHeight - 60 : 1000
                            ),
                            backgroundImage: `url(${pages[currentPage].imageUrl})`,
                            backgroundSize: "contain",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                            position: "relative"
                          }}
                        >
                          <div className="absolute inset-0">{renderTextElements()}</div>
                        </div>
                      ) : (
                        // Fallback to PDF.js rendering if no OCR preview
                        <Document file={file}>
                          <Page
                            pageNumber={currentPage + 1}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            width={
                              pages[currentPage]
                                ? Math.min(
                                    Math.max(pages[currentPage].width, 400),
                                    canvasRef.current ? canvasRef.current.clientWidth - 80 : 800
                                  )
                                : undefined
                            }
                            height={
                              pages[currentPage]
                                ? Math.min(
                                    pages[currentPage].height * (
                                      Math.min(
                                        Math.max(pages[currentPage].width, 400),
                                        canvasRef.current ? canvasRef.current.clientWidth - 80 : 800
                                      ) / pages[currentPage].width
                                    ),
                                    canvasRef.current ? canvasRef.current.clientHeight - 60 : 1000
                                  )
                                : undefined
                            }
                          />
                          <div className="absolute inset-0">{renderTextElements()}</div>
                        </Document>
                      )}
                    </div>
                  </div>                  </div>
                </div>
              </div>

              {/* Bottom Toolbar with Pagination and Text Styling */}
              <div className="bg-muted/10 border-t p-2 flex items-center justify-between flex-wrap gap-2">
                {/* Pagination Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                    <span className="hidden sm:inline ml-2">Previous</span>
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage + 1} of {pages.length}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === pages.length - 1}
                    onClick={() => setCurrentPage(prev => Math.min(pages.length - 1, prev + 1))}
                  >
                    <span className="hidden sm:inline mr-2">Next</span>
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                </div>

                {/* Text Styling Controls */}
                {selectedElement && (
                  <div className="flex items-center gap-2">
                    <select
                      value={fontFamily}
                      onChange={(e) => {
                        setFontFamily(e.target.value);
                        setTextElements(prev =>
                          prev.map(el =>
                            el.id === selectedElement
                              ? { ...el, fontFamily: e.target.value }
                              : el
                          )
                        );
                      }}
                      className="h-8 px-2 rounded-md border border-input text-sm"
                    >
                      <option value="Arial">Arial</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                      <option value="Helvetica">Helvetica</option>
                    </select>

                    <Input
                      type="number"
                      value={fontSize}
                      onChange={(e) => {
                        const newSize = Math.max(8, Math.min(72, parseInt(e.target.value) || 16));
                        setFontSize(newSize);
                        setTextElements(prev =>
                          prev.map(el =>
                            el.id === selectedElement
                              ? { ...el, fontSize: newSize }
                              : el
                          )
                        );
                      }}
                      className="w-16 h-8"
                      min={8}
                      max={72}
                    />

                    <Input
                      type="color"
                      value={textColor}
                      onChange={(e) => {
                        setTextColor(e.target.value);
                        setTextElements(prev =>
                          prev.map(el =>
                            el.id === selectedElement
                              ? { ...el, color: e.target.value }
                              : el
                          )
                        );
                      }}
                      className="w-8 h-8 p-0 border-none"
                    />
                  </div>
                )}
              </div>
            </div>
        )}

        {/* Edited PDF Download Section */}
        {file && editedPdfUrl && (
          <div className="flex-1 flex items-center justify-center p-6">
            <Card className="w-full max-w-md">
              <CardContent className="p-8 text-center">
                <div className="mb-6 p-4 rounded-full bg-green-100 mx-auto w-20 h-20 flex items-center justify-center">
                  <CheckIcon className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">PDF Edited Successfully</h3>
                <p className="text-muted-foreground mb-6">
                  Your edited PDF is ready for download.
                </p>
                <div className="flex flex-col gap-4">
                  <Button
                    size="lg"
                    asChild
                  >
                    <a href={editedPdfUrl} download="edited-document.pdf">
                      <DownloadIcon className="h-5 w-5 mr-2" />
                      Download PDF
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      setFile(null);
                      setTextElements([]);
                      setEditedPdfUrl("");
                      setPages([]);
                      setCurrentPage(0);
                      setSelectedElement(null);
                      setIsEditing(false);
                    }}
                  >
                    Edit Another PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}