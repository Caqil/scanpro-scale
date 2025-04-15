"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  PlusIcon,
  MinusIcon
} from "lucide-react";
import * as pdfjsLib from 'pdfjs-dist';

interface PdfPreviewProps {
  file: File;
  onPositionChange: (x: number, y: number, pageNumber: number, scale: number, pageHeight: number) => void; // Added pageHeight
}

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export function PdfPreview({
  file,
  onPositionChange,
}: PdfPreviewProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [pageHeight, setPageHeight] = useState<number>(0); // Added to store page height
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const signatureRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<pdfjsLib.PDFDocumentProxy | undefined>(undefined);

  useEffect(() => {
    const loadPdf = async () => {
      try {
        setLoading(true);
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        pdfRef.current = pdf;
        setNumPages(pdf.numPages);
        setLoading(false);
      } catch (err) {
        console.error("Error loading PDF:", err);
        setError("Failed to load PDF");
        setLoading(false);
      }
    };

    if (file) {
      loadPdf();
    }

    return () => {
      if (pdfRef.current) {
        pdfRef.current.destroy();
      }
    };
  }, [file]);

  useEffect(() => {
    const renderPage = async () => {
      if (!pdfRef.current || !canvasRef.current) return;

      try {
        const page = await pdfRef.current.getPage(pageNumber);
        const viewport = page.getViewport({ scale });
        
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;
        setPageHeight(viewport.height / scale); // Store unscaled page height

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };

        await page.render(renderContext).promise;
      } catch (err) {
        console.error("Error rendering page:", err);
        setError("Failed to render PDF page");
      }
    };

    if (!loading && !error) {
      renderPage();
    }
  }, [pageNumber, scale, loading, error]);

  const goToPrevPage = () => setPageNumber(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setPageNumber(prev => Math.min(prev + 1, numPages));
  const zoomIn = () => setScale(prev => Math.min(prev + 0.1, 2.0));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));

  const handleDragStart = (e: React.MouseEvent) => {
    if (!signatureRef.current) return;
    
    setIsDragging(true);
    const rect = signatureRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    e.preventDefault();
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.stopPropagation();
    e.preventDefault();
  };


  const LoadingComponent = () => (
    <div className="flex items-center justify-center h-80">
      <div className="animate-spin mr-2 h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
      <span>Loading PDF...</span>
    </div>
  );

  const ErrorComponent = () => (
    <div className="flex flex-col items-center justify-center h-80 text-red-500">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="mb-2"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <span>{error || "Failed to load PDF preview"}</span>
    </div>
  );

  return (
    <div className="flex flex-col items-center border rounded-lg p-4 bg-muted/10">
      <div className="flex justify-between w-full mb-4">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={goToPrevPage} disabled={pageNumber <= 1 || loading}>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <span className="text-sm mx-2">Page {pageNumber} of {numPages}</span>
          <Button variant="outline" size="sm" onClick={goToNextPage} disabled={pageNumber >= numPages || loading}>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={zoomOut} disabled={scale <= 0.5 || loading}>
            <MinusIcon className="h-4 w-4" />
          </Button>
          <span className="text-sm mx-2">{Math.round(scale * 100)}%</span>
          <Button variant="outline" size="sm" onClick={zoomIn} disabled={scale >= 2.0 || loading}>
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div 
        ref={containerRef} 
        className="relative border overflow-hidden bg-white rounded-md w-full"
        style={{ minHeight: 500, maxHeight: 700 }}
      >
        {loading ? (
          <LoadingComponent />
        ) : error ? (
          <ErrorComponent />
        ) : (
          <div className="relative">
            <canvas ref={canvasRef} className="w-full" />
            
          </div>
        )}
      </div>
    </div>
  );
}