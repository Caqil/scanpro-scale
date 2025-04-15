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
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useLanguageStore } from "@/src/store/store";
import { 
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { PanelBottomIcon } from "lucide-react";
import {
  PenIcon,
  TypeIcon,
  StampIcon,
  UploadIcon,
  Trash2Icon,
  XIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LoaderIcon,
  DownloadIcon,
  UserIcon,
  CalendarIcon,
  RotateCcwIcon,
  TextIcon,
  InfoIcon,
  PlusIcon,
} from "lucide-react";
import { SignatureCanvas } from "./sign/signature-canvas";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export type ElementType =
  | "signature"
  | "text"
  | "stamp"
  | "initials"
  | "name"
  | "date";
export type Position = { x: number; y: number };
export type Size = { width: number; height: number };

export interface SignatureElement {
  id: string;
  type: ElementType;
  position: Position;
  size: Size;
  data: string;
  rotation: number;
  scale: number;
  fontSize?: number;
  fontFamily?: string;
  page: number;
}

interface PdfPage {
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
}

interface Props {
  initialTool?: string;
}

/**
 * PDF Signer Component
 * A clean, modern interface for signing PDF documents with signatures, text, stamps, and dates.
 * Features drag-and-drop functionality, page navigation, and real-time element manipulation.
 */
export function PdfSigner({ initialTool = "signature" }: Props) {
  const { t } = useLanguageStore();
  const [isMobileView, setIsMobileView] = useState<boolean>(false);
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [activeTool, setActiveTool] = useState<ElementType>(
    initialTool as ElementType
  );
  const [activeTab, setActiveTab] = useState<string>("type");
  const [pages, setPages] = useState<PdfPage[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [elements, setElements] = useState<SignatureElement[]>([]);
  const [processing, setProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [signedPdfUrl, setSignedPdfUrl] = useState<string>("");
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [draggedElement, setDraggedElement] = useState<SignatureElement | null>(
    null
  );
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [signatureSize, setSignatureSize] = useState<Size>({
    width: 200,
    height: 100,
  });
  const [signatureDataUrl, setSignatureDataUrl] = useState<string>("");
  const [textValue, setTextValue] = useState<string>("");
  const [nameValue, setNameValue] = useState<string>("");
  const [fontSize, setFontSize] = useState<number>(16);
  const [fontFamily, setFontFamily] = useState<string>("Arial");
  const [stampType, setStampType] = useState<string>("approved");
  const [customStamp, setCustomStamp] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [penColor, setPenColor] = useState<string>("#000000");
  const [backgroundColor, setBackgroundColor] = useState<string>("#ffffff");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileReader = useRef<FileReader | null>(null);
  const signatureCanvasRef = useRef<any>(null);
  const stampInputRef = useRef<HTMLInputElement>(null);
  const [scale, setScale] = useState<number>(1);
  const touchStartRef = useRef<{ distance: number | null }>({ distance: null });
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    // Initial check
    checkScreenSize();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);
    fileReader.current = new FileReader();
    return () => {
      fileReader.current = null;
      window.removeEventListener('resize', checkScreenSize);
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
    setElements([]);
    setSignedPdfUrl("");
    setCurrentPage(0);

    processPdf(uploadedFile);
  };
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      // Two fingers - potential pinch gesture
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartRef.current.distance = dist;
    }
  };
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && touchStartRef.current.distance !== null) {
      // Pinch gesture in progress
      const currentDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      
      const initialDistance = touchStartRef.current.distance;
      const scaleDiff = (currentDistance - initialDistance) / 200;
      
      // Update scale with constraints
      setScale(prevScale => 
        Math.min(Math.max(prevScale + scaleDiff, 0.5), 3)
      );
      
      // Update for next move event
      touchStartRef.current.distance = currentDistance;
    }
  };
  
  const handleTouchEnd = () => {
    touchStartRef.current.distance = null;
  };
  const handleAddFieldAndCloseSheet = (type: ElementType) => {
    handleAddField(type);
    if (isMobileView) {
      setIsSheetOpen(false);
    }
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

        setProgress(Math.floor((i / numPages) * 100));
      }

      setPages(newPages);
      setProgress(100);
      URL.revokeObjectURL(fileUrl);
    } catch (error) {
      console.error("Error processing PDF:", error);
      toast.error(t("signPdf.messages.error"));
    } finally {
      setProcessing(false);
    }
  };

  const handleSignatureDraw = () => {
    if (!signatureCanvasRef.current) return;

    const signatureData = signatureCanvasRef.current.toDataURL("image/png");
    setSignatureDataUrl(signatureData);

    if (canvasRef.current && pages.length > 0 && currentPage < pages.length) {
      const canvasBounds = canvasRef.current.getBoundingClientRect();
      const centerX = (canvasBounds.width - signatureSize.width) / 2;
      const centerY = (canvasBounds.height - signatureSize.height) / 2;

      const newElement: SignatureElement = {
        id: `signature-${Date.now()}`,
        type: "signature",
        position: { x: centerX, y: centerY },
        size: { ...signatureSize },
        data: signatureData,
        rotation: 0,
        scale: 1,
        page: currentPage,
      };

      setElements([...elements, newElement]);
      setSelectedElement(newElement.id);
    }
  };

  const handleStampUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const uploadedFile = files[0];
    if (!uploadedFile.type.startsWith("image/")) {
      toast.error(t("ui.error"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && e.target.result) {
        setCustomStamp(e.target.result as string);
      }
    };
    reader.readAsDataURL(uploadedFile);
  };

  
  // 2. Update the generateStampSvg function to create a more compatible SVG
  const generateStampSvg = (type: string): string => {
    let text = "";
    let fillColor = "";
    let borderColor = "";
  
    switch (type) {
      case "approved":
        text = "APPROVED";
        fillColor = "#4caf50"; // Green for approved
        borderColor = "#388e3c";
        break;
      case "rejected":
        text = "REJECTED";
        fillColor = "#f44336"; // Red for rejected
        borderColor = "#d32f2f";
        break;
      case "draft":
        text = "DRAFT";
        fillColor = "#2196f3"; // Blue for draft
        borderColor = "#1976d2";
        break;
      case "final":
        text = "FINAL";
        fillColor = "#ff9800"; // Orange for final
        borderColor = "#f57c00";
        break;
      case "confidential":
        text = "CONFIDENTIAL";
        fillColor = "#9c27b0"; // Purple for confidential
        borderColor = "#7b1fa2";
        break;
      default:
        text = "APPROVED";
        fillColor = "#4caf50";
        borderColor = "#388e3c";
    }
  
    // Create a more compatible SVG with inline styles
    return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="150" height="50" viewBox="0 0 150 50">
    <rect x="2" y="2" width="146" height="46" rx="4" ry="4" fill="white" stroke="${borderColor}" stroke-width="2" />
    <text x="75" y="30" font-family="Arial" font-size="16" font-weight="bold" fill="${fillColor}" text-anchor="middle" alignment-baseline="middle">${text}</text>
  </svg>`;
  };
  
  
  const handleAddField = (type: ElementType) => {
    if (!canvasRef.current || pages.length === 0 || currentPage >= pages.length)
      return;

    const canvasBounds = canvasRef.current.getBoundingClientRect();
    const centerX = (canvasBounds.width - 200) / 2;
    const centerY = (canvasBounds.height - 50) / 2;

    let data = "";
    let size: Size = { width: 200, height: 50 };

    switch (type) {
      case "signature":
        data = signatureDataUrl || "Signature Placeholder";
        break;
      case "initials":
        data = "Initials Placeholder";
        size = { width: 100, height: 50 };
        break;
      case "name":
        data = nameValue || "Name Placeholder";
        break;
      case "date":
        data = new Date().toLocaleDateString();
        break;
      case "text":
        data = textValue || "Text Placeholder";
        break;
      case "stamp":
        data = customStamp || generateStampSvg(stampType);
        size = { width: 150, height: 50 };
        break;
    }

    const newElement: SignatureElement = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: centerX, y: centerY },
      size,
      data,
      rotation: 0,
      scale: 1,
      fontSize: fontSize,
      fontFamily: fontFamily,
      page: currentPage,
    };

    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
    setTextValue("");
  };

  const handleElementClick = (
    event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
    element: SignatureElement
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedElement(selectedElement === element.id ? null : element.id);
  };
  const handleElementMoveStart = (
    event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
    element: SignatureElement
  ) => {
    event.preventDefault();
    event.stopPropagation();
    if (
      event.target instanceof HTMLElement &&
      event.target.closest(".signature-element")
    ) {
      setIsDragging(true);
      setDraggedElement(element);
      if ("touches" in event) {
        document.body.style.overflow = "hidden";
      }

      // Capture the PDF scale ratio for accurate positioning
      if (canvasRef.current && pages[currentPage]) {
        const pdfElement = canvasRef.current.querySelector(".react-pdf__Page");
        if (pdfElement) {
          const pdfWidth = pdfElement.clientWidth;
          const pdfScale = pdfWidth / pages[currentPage].originalWidth;

          // Store the scale as a data attribute for later use
          canvasRef.current.dataset.pdfScale = pdfScale.toString();
        }
      }
    }
  };
  
  const handleCanvasMouseMove = (
    event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
  ) => {
    if (!canvasRef.current || (!isDragging && !isResizing)) return;

    event.preventDefault();
    const canvasBounds = canvasRef.current.getBoundingClientRect();
    const scrollLeft = canvasRef.current.scrollLeft;
    const scrollTop = canvasRef.current.scrollTop;

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
    const pdfElement = canvasRef.current.querySelector(".react-pdf__Page");
    if (!pdfElement) return;

    const pdfBounds = pdfElement.getBoundingClientRect();

    // Calculate position relative to the PDF, not the canvas
    const x = clientX - pdfBounds.left;
    const y = clientY - pdfBounds.top;

    if (isDragging && draggedElement) {
      // Apply PDF scale for accurate positioning
      const scaledWidth = draggedElement.size.width * pdfScale;
      const scaledHeight = draggedElement.size.height * pdfScale;

      const newX = x - scaledWidth / 2;
      const newY = y - scaledHeight / 2;

      // Constrain to PDF bounds
      const constrainedX = Math.max(
        0,
        Math.min(newX, pdfBounds.width - scaledWidth)
      );
      const constrainedY = Math.max(
        0,
        Math.min(newY, pdfBounds.height - scaledHeight)
      );

      // Convert back to document coordinates by dividing by scale
      setElements((prevElements) =>
        prevElements.map((el) =>
          el.id === draggedElement.id
            ? {
                ...el,
                position: {
                  x: constrainedX / pdfScale,
                  y: constrainedY / pdfScale,
                },
              }
            : el
        )
      );
    } else if (isResizing && selectedElement) {
      const element = elements.find((el) => el.id === selectedElement);
      if (element) {
        // Apply scale to resizing as well
        const newWidth = Math.max(
          50,
          (x -
            (pdfBounds.left -
              canvasBounds.left +
              element.position.x * pdfScale)) /
            pdfScale
        );
        const newHeight = Math.max(
          25,
          (y -
            (pdfBounds.top -
              canvasBounds.top +
              element.position.y * pdfScale)) /
            pdfScale
        );

        setElements((prevElements) =>
          prevElements.map((el) =>
            el.id === selectedElement
              ? { ...el, size: { width: newWidth, height: newHeight } }
              : el
          )
        );
      }
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setDraggedElement(null);
    document.body.style.overflow = "";
  };

  const handleResizeStart = (
    event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
    element: SignatureElement
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setIsResizing(true);
    setSelectedElement(element.id);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSavePdf = async () => {
    if (!file || pages.length === 0) return;

    setProcessing(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("elements", JSON.stringify(elements));
      formData.append("pages", JSON.stringify(pages));
      formData.append("performOcr", "true");
      formData.append("ocrLanguage", "eng");

      const response = await fetch("/api/pdf/sign", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to save PDF");
      }

      const result = await response.json();

      if (result.success) {
        let pdfUrl = result.fileUrl;
        let pdfName = result.originalName || "signed-document.pdf";

        if (result.ocrComplete) {
          pdfUrl = result.searchablePdfUrl;
          pdfName = result.searchablePdfFilename || "searchable-document.pdf";
        } else if (!result.ocrComplete && result.ocrError) {
          console.warn("OCR requested but failed:", result.ocrError);
          toast.error(t("signPdf.messages.ocrFailed"));
        }

        setSignedPdfUrl(pdfUrl);
        setProgress(100);
        toast.success(t("signPdf.messages.signed"));

        return { url: pdfUrl, name: pdfName };
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error saving PDF:", error);
      toast.error(t("signPdf.messages.error"));
    } finally {
      setProcessing(false);
    }
  };
  const SignatureElementComponent = memo(
    ({
      element,
      selectedElement,
      handleElementClick,
      handleElementMoveStart,
      handleResizeStart,
      setElements,
      setSelectedElement,
    }: {
      element: SignatureElement;
      selectedElement: string | null;
      handleElementClick: (
        event:
          | React.MouseEvent<HTMLDivElement>
          | React.TouchEvent<HTMLDivElement>,
        element: SignatureElement
      ) => void;
      handleElementMoveStart: (
        event:
          | React.MouseEvent<HTMLDivElement>
          | React.TouchEvent<HTMLDivElement>,
        element: SignatureElement
      ) => void;
      handleResizeStart: (
        event:
          | React.MouseEvent<HTMLDivElement>
          | React.TouchEvent<HTMLDivElement>,
        element: SignatureElement
      ) => void;
      setElements: React.Dispatch<React.SetStateAction<SignatureElement[]>>;
      setSelectedElement: React.Dispatch<React.SetStateAction<string | null>>;
    }) => {
      const pdfScale = canvasRef.current?.dataset.pdfScale
        ? parseFloat(canvasRef.current.dataset.pdfScale)
        : 1;
      const elementStyles: React.CSSProperties = {
        position: "absolute",
        left: `${element.position.x * pdfScale}px`,
        top: `${element.position.y * pdfScale}px`,
        width: `${element.size.width * pdfScale}px`,
        height: `${element.size.height * pdfScale}px`,
        transform: `rotate(${element.rotation}deg)`,
        cursor: "move",
        border:
          selectedElement === element.id
            ? "2px dashed #3b82f6"
            : "1px solid transparent",
        borderRadius: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
        touchAction: "none",
        zIndex: selectedElement === element.id ? 999 : 1,
        backgroundColor:
          selectedElement === element.id
            ? "rgba(255, 255, 255, 0.8)"
            : "transparent",
        padding: "4px",
        transition: "border 0.2s ease, background-color 0.2s ease",
      };
  
      const resizeHandleStyles: React.CSSProperties = {
        position: "absolute",
        bottom: "-6px",
        right: "-6px",
        width: "12px",
        height: "12px",
        backgroundColor: "#3b82f6",
        borderRadius: "50%",
        cursor: "se-resize",
        touchAction: "none",
        border: "2px solid white",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      };
  
      return (
        <div
          key={element.id}
          style={elementStyles}
          className="signature-element"
          onClick={(e) => handleElementClick(e, element)}
          onMouseDown={(e) => handleElementMoveStart(e, element)}
          onTouchStart={(e) => handleElementMoveStart(e, element)}
        >
          {element.type === "signature" &&
          element.data !== "Signature Placeholder" ? (
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundImage: `url(${element.data})`,
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                pointerEvents: "none",
              }}
            />
          ) : element.type === "stamp" && element.data.startsWith("data:") ? (
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundImage: `url(${element.data})`,
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                pointerEvents: "none",
              }}
            />
          ) : element.type === "stamp" && element.data.includes("<svg") ? (
            // Fix: Create an img element with a data URL for SVG content
            <img 
              src={`data:image/svg+xml;base64,${btoa(element.data)}`}
              style={{
                width: "100%",
                height: "100%",
                pointerEvents: "none",
              }}
              alt="Stamp"
            />
          ) : (
            <span className="text-muted-foreground font-medium">
              {element.data}
            </span>
          )}
          {selectedElement === element.id && (
            <>
              <button
                className="absolute -top-3 -right-3 bg-destructive rounded-full p-1 shadow-md hover:bg-destructive/90 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setElements((prev) =>
                    prev.filter((el) => el.id !== element.id)
                  );
                  setSelectedElement(null);
                }}
                title="Remove element"
              >
                <XIcon className="h-3 w-3 text-white" />
              </button>
              <div
                style={resizeHandleStyles}
                onMouseDown={(e) => handleResizeStart(e, element)}
                onTouchStart={(e) => handleResizeStart(e, element)}
                title="Resize"
              />
            </>
          )}
        </div>
      );
    }
  );
  
  const mobileToolTrigger = (
    <div className="md:hidden fixed bottom-20 right-5 z-20">
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button 
            className="h-14 w-14 rounded-full shadow-lg bg-primary text-white hover:bg-primary/90"
            size="icon"
          >
            <PanelBottomIcon className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[70vh] pt-6">
          <div className="max-h-full overflow-y-auto">
            {/* Tool Selection Header */}
            <div className="p-5 border-b">
              <h3 className="font-semibold text-base mb-3">Tools</h3>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  {
                    id: "signature",
                    icon: <PenIcon className="h-4 w-4" />,
                    label: "Sign",
                  },
                  {
                    id: "text",
                    icon: <TextIcon className="h-4 w-4" />,
                    label: "Text",
                  },
                  {
                    id: "name",
                    icon: <UserIcon className="h-4 w-4" />,
                    label: "Name",
                  },
                  {
                    id: "date",
                    icon: <CalendarIcon className="h-4 w-4" />,
                    label: "Date",
                  },
                  {
                    id: "stamp",
                    icon: <StampIcon className="h-4 w-4" />,
                    label: "Stamp",
                  },
                ].map((tool) => (
                  <Button
                    key={tool.id}
                    variant={activeTool === tool.id ? "default" : "outline"}
                    size="sm"
                    className={`flex flex-col h-16 gap-1 py-1.5 px-1 ${
                      activeTool === tool.id
                        ? "bg-primary/10 text-primary border-primary hover:bg-primary/20"
                        : "hover:bg-muted/80"
                    }`}
                    onClick={() => setActiveTool(tool.id as ElementType)}
                  >
                    <div
                      className={`p-1 rounded-full ${
                        activeTool === tool.id ? "bg-primary/10" : ""
                      }`}
                    >
                      {tool.icon}
                    </div>
                    <span className="text-xs font-medium">{tool.label}</span>
                  </Button>
                ))}
              </div>
            </div>
  
            {/* Tool Content Area */}
            <div className="p-5 relative z-10">
              {/* Signature Tool Content */}
              {activeTool === "signature" && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">
                      Create Signature
                    </h3>
                    {signatureDataUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSignatureDataUrl("")}
                        className="h-8 text-xs text-muted-foreground"
                      >
                        <RotateCcwIcon className="h-3.5 w-3.5 mr-1" /> Reset
                      </Button>
                    )}
                  </div>
  
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="mt-2"
                  >
                    <TabsList className="w-full grid grid-cols-3 bg-muted/30 p-1 h-9">
                      <TabsTrigger
                        value="draw"
                        className="text-xs font-medium"
                      >
                        Draw
                      </TabsTrigger>
                      <TabsTrigger
                        value="type"
                        className="text-xs font-medium"
                      >
                        Type
                      </TabsTrigger>
                      <TabsTrigger
                        value="upload"
                        className="text-xs font-medium"
                      >
                        Upload
                      </TabsTrigger>
                    </TabsList>
  
                    <TabsContent value="draw" className="mt-4 space-y-4">
                      <div className="bg-background rounded-md shadow-sm border overflow-hidden">
                        <SignatureCanvas
                          ref={signatureCanvasRef}
                          penColor={penColor}
                          backgroundColor={backgroundColor}
                        />
                      </div>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <Label
                            htmlFor="penColor"
                            className="text-xs font-medium"
                          >
                            Pen Color
                          </Label>
                          <div
                            className="w-5 h-5 rounded-full border shadow-sm"
                            style={{ background: penColor }}
                          />
                        </div>
                        <Input
                          id="penColor"
                          type="color"
                          value={penColor}
                          onChange={(e) => setPenColor(e.target.value)}
                          className="h-8 w-full"
                        />
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-9"
                          onClick={() => {
                            if (signatureCanvasRef.current) {
                              signatureCanvasRef.current.clear();
                            }
                          }}
                        >
                          Clear
                        </Button>
                        <SheetClose asChild>
                          <Button
                            size="sm"
                            className="flex-1 h-9"
                            onClick={() => {
                              handleSignatureDraw();
                            }}
                          >
                            <CheckIcon className="h-3.5 w-3.5 mr-1.5" />
                            Add Signature
                          </Button>
                        </SheetClose>
                      </div>
                    </TabsContent>
  
                    <TabsContent value="type" className="mt-4 space-y-4">
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="typedName"
                            className="text-xs font-medium"
                          >
                            Type Your Name
                          </Label>
                          <Input
                            id="typedName"
                            value={nameValue}
                            onChange={(e) => setNameValue(e.target.value)}
                            placeholder="John Doe"
                            className="h-9"
                          />
                        </div>
  
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label
                              htmlFor="fontFamily"
                              className="text-xs font-medium"
                            >
                              Font Style
                            </Label>
                            <select
                              id="fontFamily"
                              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                              value={fontFamily}
                              onChange={(e) =>
                                setFontFamily(e.target.value)
                              }
                            >
                              <option value="Arial">Arial</option>
                              <option value="Times New Roman">
                                Times New Roman
                              </option>
                              <option value="Courier New">
                                Courier New
                              </option>
                              <option value="Georgia">Georgia</option>
                              <option value="Verdana">Verdana</option>
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <Label
                              htmlFor="fontSize"
                              className="text-xs font-medium"
                            >
                              Size
                            </Label>
                            <Input
                              id="fontSize"
                              type="number"
                              min="8"
                              max="72"
                              value={fontSize}
                              onChange={(e) =>
                                setFontSize(parseInt(e.target.value))
                              }
                              className="h-9"
                            />
                          </div>
                        </div>
  
                        {nameValue && (
                          <div className="bg-muted/20 rounded-md p-3 mt-2 text-center border">
                            <p className="text-xs text-muted-foreground mb-2">
                              Preview:
                            </p>
                            <span
                              style={{
                                fontFamily,
                                fontSize: `${fontSize}px`,
                              }}
                            >
                              {nameValue}
                            </span>
                          </div>
                        )}
                      </div>
                      <SheetClose asChild>
                        <Button
                          className="w-full h-9"
                          onClick={() => handleAddFieldAndCloseSheet("name")}
                          disabled={!nameValue}
                        >
                          <CheckIcon className="h-3.5 w-3.5 mr-1.5" />
                          Add Signature
                        </Button>
                      </SheetClose>
                    </TabsContent>
  
                    <TabsContent value="upload" className="mt-4 space-y-4">
                      <div className="border-2 border-dashed rounded-md p-5 text-center bg-muted/10 transition-colors hover:bg-muted/20">
                        <input
                          type="file"
                          id="signatureUpload"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            const files = e.target.files;
                            if (!files || files.length === 0) return;
  
                            const file = files[0];
                            const reader = new FileReader();
  
                            reader.onload = (e) => {
                              if (e.target && e.target.result) {
                                setSignatureDataUrl(
                                  e.target.result as string
                                );
                              }
                            };
  
                            reader.readAsDataURL(file);
                          }}
                        />
                        <label
                          htmlFor="signatureUpload"
                          className="cursor-pointer"
                        >
                          <UploadIcon className="h-7 w-7 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground mb-3">
                            Upload signature image (PNG or JPG)
                          </p>
                          <Button variant="outline" size="sm" type="button">
                            <UploadIcon className="h-3.5 w-3.5 mr-1.5" />
                            Browse Files
                          </Button>
                        </label>
                      </div>
  
                      {signatureDataUrl &&
                        signatureDataUrl.startsWith("data:image") && (
                          <>
                            <div className="bg-background rounded-md border p-3 flex items-center justify-center">
                              <img
                                src={signatureDataUrl}
                                alt="Your signature"
                                className="max-h-20 max-w-full object-contain"
                              />
                            </div>
                            <SheetClose asChild>
                              <Button
                                className="w-full h-9"
                                onClick={() => handleAddFieldAndCloseSheet("signature")}
                              >
                                <CheckIcon className="h-3.5 w-3.5 mr-1.5" />
                                Add Signature
                              </Button>
                            </SheetClose>
                          </>
                        )}
                    </TabsContent>
                  </Tabs>
                </div>
              )}
  
              {/* Text Tool Content */}
              {activeTool === "text" && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">
                    Add Text Annotation
                  </h3>
  
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="textContent"
                        className="text-xs font-medium"
                      >
                        Text Content
                      </Label>
                      <Input
                        id="textContent"
                        value={textValue}
                        onChange={(e) => setTextValue(e.target.value)}
                        placeholder="Enter text to add to document"
                        className="h-9"
                      />
                    </div>
  
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="textFontFamily"
                          className="text-xs font-medium"
                        >
                          Font Style
                        </Label>
                        <select
                          id="textFontFamily"
                          className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          value={fontFamily}
                          onChange={(e) => setFontFamily(e.target.value)}
                        >
                          <option value="Arial">Arial</option>
                          <option value="Times New Roman">
                            Times New Roman
                          </option>
                          <option value="Courier New">Courier New</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Verdana">Verdana</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="textFontSize"
                          className="text-xs font-medium"
                        >
                          Size
                        </Label>
                        <Input
                          id="textFontSize"
                          type="number"
                          min="8"
                          max="72"
                          value={fontSize}
                          onChange={(e) =>
                            setFontSize(parseInt(e.target.value))
                          }
                          className="h-9"
                        />
                      </div>
                    </div>
  
                    {textValue && (
                      <div className="bg-muted/20 rounded-md p-3 mt-2 text-center border">
                        <p className="text-xs text-muted-foreground mb-2">
                          Preview:
                        </p>
                        <span
                          style={{ fontFamily, fontSize: `${fontSize}px` }}
                        >
                          {textValue}
                        </span>
                      </div>
                    )}
                  </div>
  
                  <SheetClose asChild>
                    <Button
                      className="w-full h-9"
                      onClick={() => handleAddFieldAndCloseSheet("text")}
                      disabled={!textValue}
                    >
                      <PlusIcon className="h-3.5 w-3.5 mr-1.5" />
                      Add Text Annotation
                    </Button>
                  </SheetClose>
                </div>
              )}
  
              {/* Stamp Tool Content */}
              {activeTool === "stamp" && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">
                    Add Document Stamp
                  </h3>
  
                  <div className="space-y-3">
                    <Label className="text-xs font-medium">
                      Select Stamp Type
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "approved", color: "#4caf50" },
                        { id: "rejected", color: "#f44336" },
                        { id: "draft", color: "#2196f3" },
                        { id: "final", color: "#ff9800" },
                        { id: "confidential", color: "#9c27b0" },
                      ].map((type) => (
                        <Button
                          key={type.id}
                          variant={
                            stampType === type.id ? "default" : "outline"
                          }
                          size="sm"
                          className={`justify-start capitalize h-9 ${
                            stampType === type.id
                              ? "bg-muted border-2"
                              : "border-muted hover:bg-muted/20"
                          }`}
                          style={{
                            borderColor:
                              stampType === type.id
                                ? type.color
                                : undefined,
                            color: type.color,
                          }}
                          onClick={() => setStampType(type.id)}
                        >
                          <StampIcon
                            className="h-3.5 w-3.5 mr-1.5"
                            style={{ color: type.color }}
                          />
                          {type.id}
                        </Button>
                      ))}
                    </div>
  
                    <div className="bg-background rounded-md border p-3 flex items-center justify-center h-16 mt-2">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: generateStampSvg(stampType),
                        }}
                      />
                    </div>
                  </div>
  
                  <Separator className="my-4" />
  
                  <div className="space-y-3">
                    <Label className="text-xs font-medium">
                      Upload Custom Stamp
                    </Label>
                    <div className="border-2 border-dashed rounded-md p-3 text-center bg-muted/10 transition-colors hover:bg-muted/20">
                      <input
                        type="file"
                        id="stampUpload"
                        ref={stampInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleStampUpload}
                      />
                      <label
                        htmlFor="stampUpload"
                        className="cursor-pointer"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          className="h-8"
                          onClick={() => stampInputRef.current?.click()}
                        >
                          <UploadIcon className="h-3.5 w-3.5 mr-1.5" />
                          Upload Image
                        </Button>
                      </label>
                    </div>
  
                    {customStamp && (
                      <div className="bg-background rounded-md border p-3 flex items-center justify-center h-16">
                        <img
                          src={customStamp}
                          alt="Custom stamp"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    )}
                  </div>
  
                  <SheetClose asChild>
                    <Button
                      className="w-full h-9"
                      onClick={() => handleAddFieldAndCloseSheet("stamp")}
                    >
                      <PlusIcon className="h-3.5 w-3.5 mr-1.5" />
                      Add Stamp
                    </Button>
                  </SheetClose>
                </div>
              )}
  
              {/* Date Tool Content */}
              {activeTool === "date" && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">Add Date Field</h3>
  
                  <div className="border rounded-md p-4 bg-muted/10 space-y-3">
                    <p className="text-xs text-muted-foreground">
                      This will add today's date to the document. It will
                      appear as shown below:
                    </p>
  
                    <div className="bg-white dark:bg-slate-800 border rounded-md p-3 text-center shadow-sm">
                      <div className="text-base font-medium">
                        {new Date().toLocaleDateString()}
                      </div>
                    </div>
  
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="dateFontFamily"
                          className="text-xs font-medium"
                        >
                          Font Style
                        </Label>
                        <select
                          id="dateFontFamily"
                          className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          value={fontFamily}
                          onChange={(e) => setFontFamily(e.target.value)}
                        >
                          <option value="Arial">Arial</option>
                          <option value="Times New Roman">
                            Times New Roman
                          </option>
                          <option value="Courier New">Courier New</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Verdana">Verdana</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="dateFontSize"
                          className="text-xs font-medium"
                        >
                          Size
                        </Label>
                        <Input
                          id="dateFontSize"
                          type="number"
                          min="8"
                          max="72"
                          value={fontSize}
                          onChange={(e) =>
                            setFontSize(parseInt(e.target.value))
                          }
                          className="h-9"
                        />
                      </div>
                    </div>
                  </div>
  
                  <SheetClose asChild>
                    <Button
                      className="w-full h-9"
                      onClick={() => handleAddFieldAndCloseSheet("date")}
                    >
                      <PlusIcon className="h-3.5 w-3.5 mr-1.5" />
                      Add Date Field
                    </Button>
                  </SheetClose>
                </div>
              )}
  
              {/* Name Tool Content */}
              {activeTool === "name" && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">Add Name Field</h3>
  
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="nameField"
                        className="text-xs font-medium"
                      >
                        Your Name
                      </Label>
                      <Input
                        id="nameField"
                        value={nameValue}
                        onChange={(e) => setNameValue(e.target.value)}
                        placeholder="John Doe"
                        className="h-9"
                      />
                    </div>
  
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="nameFontFamily"
                          className="text-xs font-medium"
                        >
                          Font Style
                        </Label>
                        <select
                          id="nameFontFamily"
                          className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          value={fontFamily}
                          onChange={(e) => setFontFamily(e.target.value)}
                        >
                          <option value="Arial">Arial</option>
                          <option value="Times New Roman">
                            Times New Roman
                          </option>
                          <option value="Courier New">Courier New</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Verdana">Verdana</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="nameFontSize"
                          className="text-xs font-medium"
                        >
                          Size
                        </Label>
                        <Input
                          id="nameFontSize"
                          type="number"
                          min="8"
                          max="72"
                          value={fontSize}
                          onChange={(e) =>
                            setFontSize(parseInt(e.target.value))
                          }
                          className="h-9"
                        />
                      </div>
                    </div>
  
                    {nameValue && (
                      <div className="bg-muted/20 rounded-md p-3 mt-2 text-center border">
                        <p className="text-xs text-muted-foreground mb-2">
                          Preview:
                        </p>
                        <span
                          style={{ fontFamily, fontSize: `${fontSize}px` }}
                        >
                          {nameValue}
                        </span>
                      </div>
                    )}
                  </div>
  
                  <SheetClose asChild>
                    <Button
                      className="w-full h-9"
                      onClick={() => handleAddFieldAndCloseSheet("name")}
                      disabled={!nameValue}
                    >
                      <PlusIcon className="h-3.5 w-3.5 mr-1.5" />
                      Add Name Field
                    </Button>
                  </SheetClose>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
  const renderElements = () => {
    return elements
      .filter((element) => element.page === currentPage)
      .map((element) => (
        <SignatureElementComponent
          key={element.id}
          element={element}
          selectedElement={selectedElement}
          handleElementClick={handleElementClick}
          handleElementMoveStart={handleElementMoveStart}
          handleResizeStart={handleResizeStart}
          setElements={setElements}
          setSelectedElement={setSelectedElement}
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
            <Document file={file}>
              <Page
                pageNumber={index + 1}
                width={70}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>
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
              <PenIcon className="h-5 w-5 text-primary" />
              <span>PDF Signer</span>
            </div>
          </div>

          {file && !processing && !signedPdfUrl && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFile(null);
                  setElements([]);
                  setSignedPdfUrl("");
                  setPages([]);
                }}
              >
                <Trash2Icon className="h-4 w-4 mr-2" />
                Clear
              </Button>

              <Button size="sm" onClick={handleSavePdf}>
                <CheckIcon className="h-4 w-4 mr-2" />
                Sign Document
              </Button>
            </div>
          )}
        </div>

        {/* File Upload Section */}
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
                        toast.error(t("ui.error"));
                        return;
                      }
                      setFile(uploadedFile);
                      setElements([]);
                      setSignedPdfUrl("");
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
                    {t("signPdf.uploadTitle")}
                  </h3>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    {t("signPdf.uploadDesc")}
                  </p>
                  <Button
                    size="lg"
                    className="px-8"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {t("ui.browse")}
                  </Button>
                  <p className="mt-6 text-sm text-muted-foreground">
                    {t("ui.filesSecurity")}
                  </p>
                </div>
          </div>
        )}

        {/* Processing Section */}
        {file && processing && !signedPdfUrl && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="bg-background rounded-lg p-8 shadow-sm border w-96 text-center">
              <LoaderIcon className="h-16 w-16 animate-spin text-primary mb-6 mx-auto" />
              <h3 className="text-xl font-semibold mb-3">
                {t("signPdf.processing")}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t("signPdf.messages.processing")}
              </p>
              <Progress value={progress} className="w-full h-2" />
            </div>
          </div>
        )}

        {/* PDF Viewer and Signing Area */}
        {file && !processing && !signedPdfUrl && pages.length > 0 && (
          <div className="flex-1 flex overflow-hidden">
            {/* Left Sidebar: Page Thumbnails */}
            <div className="w-24 bg-muted/10 border-r overflow-y-auto hidden md:block">
              {renderPageThumbnails()}
            </div>

            {/* Main PDF Viewer */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 relative">
              <div
  ref={canvasRef}
  className="absolute inset-0 bg-muted/5 overflow-auto"
  onMouseMove={handleCanvasMouseMove}
  onMouseUp={handleCanvasMouseUp}
  onMouseLeave={handleCanvasMouseUp}
  onTouchMove={(e) => {
    handleCanvasMouseMove(e);
    handleTouchMove(e);
  }}
  onTouchStart={handleTouchStart}
  onTouchEnd={() => {
    handleCanvasMouseUp();
    handleTouchEnd();
  }}
  onTouchCancel={() => {
    handleCanvasMouseUp();
    handleTouchEnd();
  }}
>
  <div className="min-h-full flex items-center justify-center p-4">
    <div className="relative shadow-lg">
      <Document file={file}>
      <Page
  pageNumber={currentPage + 1}
  renderTextLayer={false}
  renderAnnotationLayer={false}
  width={
    pages[currentPage]
      ? Math.min(
          Math.max(pages[currentPage].width, 400),
          canvasRef.current
            ? Math.min(canvasRef.current.clientWidth - 40, isMobileView ? 600 : 800)
            : 800
        ) * scale
      : undefined
  }
  height={
    pages[currentPage]
      ? Math.min(
          pages[currentPage].height *
            (Math.min(
              Math.max(pages[currentPage].width, 400),
              canvasRef.current
                ? Math.min(canvasRef.current.clientWidth - 40, isMobileView ? 600 : 800)
                : 800
            ) /
              pages[currentPage].width),
          canvasRef.current
            ? canvasRef.current.clientHeight - 60
            : 1000
        ) * scale
      : undefined
  }
/>
        <div className="absolute inset-0">
          {renderElements()}
        </div>
      </Document>
    </div>
  </div>
  {/* Add the mobile tool trigger here */}
  {mobileToolTrigger}
</div>
              </div>

              {/* Mobile Pagination Controls */}
              <div className="md:hidden flex justify-center items-center py-3 bg-background border-t">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handlePageChange(Math.max(0, currentPage - 1))
                    }
                    disabled={currentPage === 0}
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    {currentPage + 1} / {pages.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handlePageChange(
                        Math.min(pages.length - 1, currentPage + 1)
                      )
                    }
                    disabled={currentPage === pages.length - 1}
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Desktop Pagination Controls */}
              <div className="hidden md:flex justify-between items-center py-3 px-4 bg-background border-t">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handlePageChange(Math.max(0, currentPage - 1))
                    }
                    disabled={currentPage === 0}
                  >
                    <ChevronLeftIcon className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handlePageChange(
                        Math.min(pages.length - 1, currentPage + 1)
                      )
                    }
                    disabled={currentPage === pages.length - 1}
                  >
                    Next
                    <ChevronRightIcon className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <span className="text-sm font-medium">
                  Page {currentPage + 1} of {pages.length}
                </span>
              </div>
            </div>

            {/* Right Sidebar: Signature Tools */}
            {/* Right Sidebar: Signature Tools - Professional Redesign */}
            <div className="w-80 bg-white dark:bg-slate-900 border-l overflow-hidden hidden md:flex md:flex-col h-full shadow-sm">
              {/* Tool Selection Header */}
              <div className="p-5 border-b">
                <h3 className="font-semibold text-base mb-3">Tools</h3>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    {
                      id: "signature",
                      icon: <PenIcon className="h-4 w-4" />,
                      label: "Sign",
                    },
                    {
                      id: "text",
                      icon: <TextIcon className="h-4 w-4" />,
                      label: "Text",
                    },
                    {
                      id: "name",
                      icon: <UserIcon className="h-4 w-4" />,
                      label: "Name",
                    },
                    {
                      id: "date",
                      icon: <CalendarIcon className="h-4 w-4" />,
                      label: "Date",
                    },
                    {
                      id: "stamp",
                      icon: <StampIcon className="h-4 w-4" />,
                      label: "Stamp",
                    },
                  ].map((tool) => (
                    <Button
                      key={tool.id}
                      variant={activeTool === tool.id ? "default" : "outline"}
                      size="sm"
                      className={`flex flex-col h-16 gap-1 py-1.5 px-1 ${
                        activeTool === tool.id
                          ? "bg-primary/10 text-primary border-primary hover:bg-primary/20"
                          : "hover:bg-muted/80"
                      }`}
                      onClick={() => setActiveTool(tool.id as ElementType)}
                    >
                      <div
                        className={`p-1 rounded-full ${
                          activeTool === tool.id ? "bg-primary/10" : ""
                        }`}
                      >
                        {tool.icon}
                      </div>
                      <span className="text-xs font-medium">{tool.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Tool Content Area with inset shadow */}
              <div className="flex-1 overflow-y-auto bg-muted/5 relative">
                <div className="absolute inset-0 pointer-events-none shadow-[inset_0_5px_8px_-6px_rgba(0,0,0,0.1)]"></div>
                <div className="p-5 relative z-10">
                  {/* Signature Tool Content */}
                  {activeTool === "signature" && (
                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm">
                          Create Signature
                        </h3>
                        {signatureDataUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSignatureDataUrl("")}
                            className="h-8 text-xs text-muted-foreground"
                          >
                            <RotateCcwIcon className="h-3.5 w-3.5 mr-1" /> Reset
                          </Button>
                        )}
                      </div>

                      <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="mt-2"
                      >
                        <TabsList className="w-full grid grid-cols-3 bg-muted/30 p-1 h-9">
                          <TabsTrigger
                            value="draw"
                            className="text-xs font-medium"
                          >
                            Draw
                          </TabsTrigger>
                          <TabsTrigger
                            value="type"
                            className="text-xs font-medium"
                          >
                            Type
                          </TabsTrigger>
                          <TabsTrigger
                            value="upload"
                            className="text-xs font-medium"
                          >
                            Upload
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="draw" className="mt-4 space-y-4">
                          <div className="bg-background rounded-md shadow-sm border overflow-hidden">
                            <SignatureCanvas
                              ref={signatureCanvasRef}
                              penColor={penColor}
                              backgroundColor={backgroundColor}
                            />
                          </div>
                          <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <Label
                                htmlFor="penColor"
                                className="text-xs font-medium"
                              >
                                Pen Color
                              </Label>
                              <div
                                className="w-5 h-5 rounded-full border shadow-sm"
                                style={{ background: penColor }}
                              />
                            </div>
                            <Input
                              id="penColor"
                              type="color"
                              value={penColor}
                              onChange={(e) => setPenColor(e.target.value)}
                              className="h-8 w-full"
                            />
                          </div>
                          <div className="mt-4 flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 h-9"
                              onClick={() => {
                                if (signatureCanvasRef.current) {
                                  signatureCanvasRef.current.clear();
                                }
                              }}
                            >
                              Clear
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1 h-9"
                              onClick={handleSignatureDraw}
                            >
                              <CheckIcon className="h-3.5 w-3.5 mr-1.5" />
                              Add Signature
                            </Button>
                          </div>
                        </TabsContent>

                        <TabsContent value="type" className="mt-4 space-y-4">
                          <div className="space-y-3">
                            <div className="space-y-1.5">
                              <Label
                                htmlFor="typedName"
                                className="text-xs font-medium"
                              >
                                Type Your Name
                              </Label>
                              <Input
                                id="typedName"
                                value={nameValue}
                                onChange={(e) => setNameValue(e.target.value)}
                                placeholder="John Doe"
                                className="h-9"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1.5">
                                <Label
                                  htmlFor="fontFamily"
                                  className="text-xs font-medium"
                                >
                                  Font Style
                                </Label>
                                <select
                                  id="fontFamily"
                                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                  value={fontFamily}
                                  onChange={(e) =>
                                    setFontFamily(e.target.value)
                                  }
                                >
                                  <option value="Arial">Arial</option>
                                  <option value="Times New Roman">
                                    Times New Roman
                                  </option>
                                  <option value="Courier New">
                                    Courier New
                                  </option>
                                  <option value="Georgia">Georgia</option>
                                  <option value="Verdana">Verdana</option>
                                </select>
                              </div>
                              <div className="space-y-1.5">
                                <Label
                                  htmlFor="fontSize"
                                  className="text-xs font-medium"
                                >
                                  Size
                                </Label>
                                <Input
                                  id="fontSize"
                                  type="number"
                                  min="8"
                                  max="72"
                                  value={fontSize}
                                  onChange={(e) =>
                                    setFontSize(parseInt(e.target.value))
                                  }
                                  className="h-9"
                                />
                              </div>
                            </div>

                            {nameValue && (
                              <div className="bg-muted/20 rounded-md p-3 mt-2 text-center border">
                                <p className="text-xs text-muted-foreground mb-2">
                                  Preview:
                                </p>
                                <span
                                  style={{
                                    fontFamily,
                                    fontSize: `${fontSize}px`,
                                  }}
                                >
                                  {nameValue}
                                </span>
                              </div>
                            )}
                          </div>
                          <Button
                            className="w-full h-9"
                            onClick={() => handleAddField("name")}
                            disabled={!nameValue}
                          >
                            <CheckIcon className="h-3.5 w-3.5 mr-1.5" />
                            Add Signature
                          </Button>
                        </TabsContent>

                        <TabsContent value="upload" className="mt-4 space-y-4">
                          <div className="border-2 border-dashed rounded-md p-5 text-center bg-muted/10 transition-colors hover:bg-muted/20">
                            <input
                              type="file"
                              id="signatureUpload"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => {
                                const files = e.target.files;
                                if (!files || files.length === 0) return;

                                const file = files[0];
                                const reader = new FileReader();

                                reader.onload = (e) => {
                                  if (e.target && e.target.result) {
                                    setSignatureDataUrl(
                                      e.target.result as string
                                    );
                                  }
                                };

                                reader.readAsDataURL(file);
                              }}
                            />
                            <label
                              htmlFor="signatureUpload"
                              className="cursor-pointer"
                            >
                              <UploadIcon className="h-7 w-7 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground mb-3">
                                Upload signature image (PNG or JPG)
                              </p>
                              <Button variant="outline" size="sm" type="button">
                                <UploadIcon className="h-3.5 w-3.5 mr-1.5" />
                                Browse Files
                              </Button>
                            </label>
                          </div>

                          {signatureDataUrl &&
                            signatureDataUrl.startsWith("data:image") && (
                              <>
                                <div className="bg-background rounded-md border p-3 flex items-center justify-center">
                                  <img
                                    src={signatureDataUrl}
                                    alt="Your signature"
                                    className="max-h-20 max-w-full object-contain"
                                  />
                                </div>
                                <Button
                                  className="w-full h-9"
                                  onClick={() => handleAddField("signature")}
                                >
                                  <CheckIcon className="h-3.5 w-3.5 mr-1.5" />
                                  Add Signature
                                </Button>
                              </>
                            )}
                        </TabsContent>
                      </Tabs>
                    </div>
                  )}

                  {/* Text Tool Content */}
                  {activeTool === "text" && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm">
                        Add Text Annotation
                      </h3>

                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="textContent"
                            className="text-xs font-medium"
                          >
                            Text Content
                          </Label>
                          <Input
                            id="textContent"
                            value={textValue}
                            onChange={(e) => setTextValue(e.target.value)}
                            placeholder="Enter text to add to document"
                            className="h-9"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label
                              htmlFor="textFontFamily"
                              className="text-xs font-medium"
                            >
                              Font Style
                            </Label>
                            <select
                              id="textFontFamily"
                              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                              value={fontFamily}
                              onChange={(e) => setFontFamily(e.target.value)}
                            >
                              <option value="Arial">Arial</option>
                              <option value="Times New Roman">
                                Times New Roman
                              </option>
                              <option value="Courier New">Courier New</option>
                              <option value="Georgia">Georgia</option>
                              <option value="Verdana">Verdana</option>
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <Label
                              htmlFor="textFontSize"
                              className="text-xs font-medium"
                            >
                              Size
                            </Label>
                            <Input
                              id="textFontSize"
                              type="number"
                              min="8"
                              max="72"
                              value={fontSize}
                              onChange={(e) =>
                                setFontSize(parseInt(e.target.value))
                              }
                              className="h-9"
                            />
                          </div>
                        </div>

                        {textValue && (
                          <div className="bg-muted/20 rounded-md p-3 mt-2 text-center border">
                            <p className="text-xs text-muted-foreground mb-2">
                              Preview:
                            </p>
                            <span
                              style={{ fontFamily, fontSize: `${fontSize}px` }}
                            >
                              {textValue}
                            </span>
                          </div>
                        )}
                      </div>

                      <Button
                        className="w-full h-9"
                        onClick={() => handleAddField("text")}
                        disabled={!textValue}
                      >
                        <PlusIcon className="h-3.5 w-3.5 mr-1.5" />
                        Add Text Annotation
                      </Button>
                    </div>
                  )}

                  {/* Stamp Tool Content */}
                  {activeTool === "stamp" && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm">
                        Add Document Stamp
                      </h3>

                      <div className="space-y-3">
                        <Label className="text-xs font-medium">
                          Select Stamp Type
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: "approved", color: "#4caf50" },
                            { id: "rejected", color: "#f44336" },
                            { id: "draft", color: "#2196f3" },
                            { id: "final", color: "#ff9800" },
                            { id: "confidential", color: "#9c27b0" },
                          ].map((type) => (
                            <Button
                              key={type.id}
                              variant={
                                stampType === type.id ? "default" : "outline"
                              }
                              size="sm"
                              className={`justify-start capitalize h-9 ${
                                stampType === type.id
                                  ? "bg-muted border-2"
                                  : "border-muted hover:bg-muted/20"
                              }`}
                              style={{
                                borderColor:
                                  stampType === type.id
                                    ? type.color
                                    : undefined,
                                color: type.color,
                              }}
                              onClick={() => setStampType(type.id)}
                            >
                              <StampIcon
                                className="h-3.5 w-3.5 mr-1.5"
                                style={{ color: type.color }}
                              />
                              {type.id}
                            </Button>
                          ))}
                        </div>

                        <div className="bg-background rounded-md border p-3 flex items-center justify-center h-16 mt-2">
                          <div
                            dangerouslySetInnerHTML={{
                              __html: generateStampSvg(stampType),
                            }}
                          />
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div className="space-y-3">
                        <Label className="text-xs font-medium">
                          Upload Custom Stamp
                        </Label>
                        <div className="border-2 border-dashed rounded-md p-3 text-center bg-muted/10 transition-colors hover:bg-muted/20">
                          <input
                            type="file"
                            id="stampUpload"
                            ref={stampInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleStampUpload}
                          />
                          <label
                            htmlFor="stampUpload"
                            className="cursor-pointer"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              type="button"
                              className="h-8"
                              onClick={() => stampInputRef.current?.click()}
                            >
                              <UploadIcon className="h-3.5 w-3.5 mr-1.5" />
                              Upload Image
                            </Button>
                          </label>
                        </div>

                        {customStamp && (
                          <div className="bg-background rounded-md border p-3 flex items-center justify-center h-16">
                            <img
                              src={customStamp}
                              alt="Custom stamp"
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                        )}
                      </div>

                      <Button
                        className="w-full h-9"
                        onClick={() => handleAddField("stamp")}
                      >
                        <PlusIcon className="h-3.5 w-3.5 mr-1.5" />
                        Add Stamp
                      </Button>
                    </div>
                  )}

                  {/* Date Tool Content */}
                  {activeTool === "date" && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm">Add Date Field</h3>

                      <div className="border rounded-md p-4 bg-muted/10 space-y-3">
                        <p className="text-xs text-muted-foreground">
                          This will add today's date to the document. It will
                          appear as shown below:
                        </p>

                        <div className="bg-white dark:bg-slate-800 border rounded-md p-3 text-center shadow-sm">
                          <div className="text-base font-medium">
                            {new Date().toLocaleDateString()}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-4">
                          <div className="space-y-1.5">
                            <Label
                              htmlFor="dateFontFamily"
                              className="text-xs font-medium"
                            >
                              Font Style
                            </Label>
                            <select
                              id="dateFontFamily"
                              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                              value={fontFamily}
                              onChange={(e) => setFontFamily(e.target.value)}
                            >
                              <option value="Arial">Arial</option>
                              <option value="Times New Roman">
                                Times New Roman
                              </option>
                              <option value="Courier New">Courier New</option>
                              <option value="Georgia">Georgia</option>
                              <option value="Verdana">Verdana</option>
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <Label
                              htmlFor="dateFontSize"
                              className="text-xs font-medium"
                            >
                              Size
                            </Label>
                            <Input
                              id="dateFontSize"
                              type="number"
                              min="8"
                              max="72"
                              value={fontSize}
                              onChange={(e) =>
                                setFontSize(parseInt(e.target.value))
                              }
                              className="h-9"
                            />
                          </div>
                        </div>
                      </div>

                      <Button
                        className="w-full h-9"
                        onClick={() => handleAddField("date")}
                      >
                        <PlusIcon className="h-3.5 w-3.5 mr-1.5" />
                        Add Date Field
                      </Button>
                    </div>
                  )}

                  {/* Name Tool Content */}
                  {activeTool === "name" && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm">Add Name Field</h3>

                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="nameField"
                            className="text-xs font-medium"
                          >
                            Your Name
                          </Label>
                          <Input
                            id="nameField"
                            value={nameValue}
                            onChange={(e) => setNameValue(e.target.value)}
                            placeholder="John Doe"
                            className="h-9"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label
                              htmlFor="nameFontFamily"
                              className="text-xs font-medium"
                            >
                              Font Style
                            </Label>
                            <select
                              id="nameFontFamily"
                              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                              value={fontFamily}
                              onChange={(e) => setFontFamily(e.target.value)}
                            >
                              <option value="Arial">Arial</option>
                              <option value="Times New Roman">
                                Times New Roman
                              </option>
                              <option value="Courier New">Courier New</option>
                              <option value="Georgia">Georgia</option>
                              <option value="Verdana">Verdana</option>
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <Label
                              htmlFor="nameFontSize"
                              className="text-xs font-medium"
                            >
                              Size
                            </Label>
                            <Input
                              id="nameFontSize"
                              type="number"
                              min="8"
                              max="72"
                              value={fontSize}
                              onChange={(e) =>
                                setFontSize(parseInt(e.target.value))
                              }
                              className="h-9"
                            />
                          </div>
                        </div>

                        {nameValue && (
                          <div className="bg-muted/20 rounded-md p-3 mt-2 text-center border">
                            <p className="text-xs text-muted-foreground mb-2">
                              Preview:
                            </p>
                            <span
                              style={{ fontFamily, fontSize: `${fontSize}px` }}
                            >
                              {nameValue}
                            </span>
                          </div>
                        )}
                      </div>

                      <Button
                        className="w-full h-9"
                        onClick={() => handleAddField("name")}
                        disabled={!nameValue}
                      >
                        <PlusIcon className="h-3.5 w-3.5 mr-1.5" />
                        Add Name Field
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer with help info */}
              <div className="px-5 py-3 bg-muted/10 border-t">
                <div className="flex items-center text-xs text-muted-foreground">
                  <InfoIcon className="h-3.5 w-3.5 mr-1.5" />
                  <span>Drag elements to position them on the document</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Section */}
        {file && !processing && signedPdfUrl && (
          <div className="flex-1 flex items-center justify-center p-6">
            <Card className="w-full max-w-md">
              <CardContent className="p-8 text-center">
                <div className="mb-6 p-4 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 mx-auto w-20 h-20 flex items-center justify-center">
                  <CheckIcon className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">
                  {t("signPdf.messages.signed")}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {t("signPdf.messages.downloadReady")}
                </p>
                <div className="flex gap-4 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFile(null);
                      setElements([]);
                      setSignedPdfUrl("");
                      setPages([]);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                  >
                    <RotateCcwIcon className="h-4 w-4 mr-2" />
                    Start Over
                  </Button>
                  <Button
                    onClick={() => {
                      if (signedPdfUrl) {
                        window.open(signedPdfUrl, "_blank");
                      }
                    }}
                  >
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    Download Signed PDF
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
