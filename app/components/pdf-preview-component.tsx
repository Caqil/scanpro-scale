"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { initPDFJS, loadPDF } from "@/lib/pdf-utils";

// Initialize PDF.js
import * as pdfjs from 'pdfjs-dist';

interface WatermarkOptions {
  text?: string;
  image?: string;
  position: string;
  opacity: number;
  scale?: number;
  rotation: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  pages: string;
  customPages?: string;
}

interface PdfWatermarkPreviewProps {
  file: File | null;
  watermarkType: "text" | "image";
  options: WatermarkOptions;
}

export function PdfWatermarkPreview({ file, watermarkType, options }: PdfWatermarkPreviewProps) {
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Initialize PDF.js when component mounts
  useEffect(() => {
    initPDFJS();
  }, []);
  
  // Load PDF when file changes
  useEffect(() => {
    if (!file) return;
    
    const loadPdfFile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Convert File to ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        
        // Load the PDF using our utility
        const pdf = await loadPDF(arrayBuffer);
        
        setPdfDocument(pdf);
        setTotalPages(pdf.numPages);
        setCurrentPage(1); // Reset to first page
        
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError('Failed to load PDF for preview');
      } finally {
        setLoading(false);
      }
    };
    
    loadPdfFile();
    
    // Cleanup
    return () => {
      if (pdfDocument) {
        pdfDocument.destroy();
      }
    };
  }, [file]);
  
  // Render PDF page with watermark
  useEffect(() => {
    if (!pdfDocument || !canvasRef.current) return;
    
    const renderPage = async () => {
      try {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const page = await pdfDocument.getPage(currentPage);
        
        // Calculate scale based on container width
        const containerWidth = containerRef.current?.clientWidth || 800;
        const viewport = page.getViewport({ scale: 1.0 });
        const scale = (containerWidth / viewport.width) * zoom;
        const scaledViewport = page.getViewport({ scale });
        
        // Set canvas dimensions
        canvas.height = scaledViewport.height;
        canvas.width = scaledViewport.width;
        
        // Render the PDF page
        const renderContext = {
          canvasContext: canvas.getContext('2d'),
          viewport: scaledViewport,
        };
        
        await page.render(renderContext).promise;
        
        // Add watermark
        renderWatermark(canvas, scaledViewport);
        
      } catch (err) {
        console.error('Error rendering page:', err);
        setError('Failed to render PDF page');
      }
    };
    
    renderPage();
  }, [pdfDocument, currentPage, zoom, options, watermarkType]);
  
  // Render watermark on canvas
  const renderWatermark = (canvas: HTMLCanvasElement, viewport: any) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Check if this page should have watermark based on pages option
    if (!shouldRenderWatermarkOnPage(currentPage)) {
      return;
    }
    
    // Positioning based on option
    let x = viewport.width / 2;
    let y = viewport.height / 2;
    
    // Position adjustments
    switch (options.position) {
      case 'top-left':
        x = viewport.width * 0.1;
        y = viewport.height * 0.1;
        break;
      case 'top-center':
        x = viewport.width / 2;
        y = viewport.height * 0.1;
        break;
      case 'top-right':
        x = viewport.width * 0.9;
        y = viewport.height * 0.1;
        break;
      case 'center-left':
        x = viewport.width * 0.1;
        y = viewport.height / 2;
        break;
      case 'center':
        x = viewport.width / 2;
        y = viewport.height / 2;
        break;
      case 'center-right':
        x = viewport.width * 0.9;
        y = viewport.height / 2;
        break;
      case 'bottom-left':
        x = viewport.width * 0.1;
        y = viewport.height * 0.9;
        break;
      case 'bottom-center':
        x = viewport.width / 2;
        y = viewport.height * 0.9;
        break;
      case 'bottom-right':
        x = viewport.width * 0.9;
        y = viewport.height * 0.9;
        break;
      case 'tile':
        renderTiledWatermark(ctx, viewport);
        return;
    }
    
    ctx.save();
    
    // Set watermark transparency
    ctx.globalAlpha = options.opacity / 100;
    
    if (watermarkType === 'text' && options.text) {
      renderTextWatermark(ctx, x, y, viewport);
    } else if (watermarkType === 'image' && options.image) {
      renderImageWatermark(ctx, x, y, viewport);
    }
    
    ctx.restore();
  };
  
  // Render text watermark
  const renderTextWatermark = (ctx: CanvasRenderingContext2D, x: number, y: number, viewport: any) => {
    if (!options.text) return;
    
    ctx.save();
    
    // Set font properties
    ctx.font = `${options.fontSize || 48}px ${options.fontFamily || 'Arial'}`;
    ctx.fillStyle = options.color || '#FF0000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Apply rotation around center
    ctx.translate(x, y);
    ctx.rotate((options.rotation || 0) * Math.PI / 180);
    
    // Draw text
    ctx.fillText(options.text, 0, 0);
    
    ctx.restore();
  };
  
  // Render image watermark
  const renderImageWatermark = (ctx: CanvasRenderingContext2D, x: number, y: number, viewport: any) => {
    if (!options.image) return;
    
    ctx.save();
    
    // Apply rotation around center
    ctx.translate(x, y);
    ctx.rotate((options.rotation || 0) * Math.PI / 180);
    
    // Create image element
    const img = new Image();
    
    // Set image opacity
    img.onload = () => {
      const scale = (options.scale || 50) / 100;
      const width = img.width * scale;
      const height = img.height * scale;
      
      // Draw image centered
      ctx.drawImage(img, -width / 2, -height / 2, width, height);
    };
    
    // Set image source
    img.src = options.image;
    
    ctx.restore();
  };
  
  // Render tiled watermark
  const renderTiledWatermark = (ctx: CanvasRenderingContext2D, viewport: any) => {
    const tileSize = viewport.width / 4; // 4 tiles across
    
    for (let x = tileSize / 2; x < viewport.width; x += tileSize) {
      for (let y = tileSize / 2; y < viewport.height; y += tileSize) {
        if (watermarkType === 'text' && options.text) {
          renderTextWatermark(ctx, x, y, viewport);
        } else if (watermarkType === 'image' && options.image) {
          renderImageWatermark(ctx, x, y, viewport);
        }
      }
    }
  };
  
  // Check if watermark should be rendered on current page
  const shouldRenderWatermarkOnPage = (pageNum: number): boolean => {
    switch (options.pages) {
      case 'all':
        return true;
      case 'even':
        return pageNum % 2 === 0;
      case 'odd':
        return pageNum % 2 === 1;
      case 'custom':
        if (!options.customPages) return false;
        
        // Parse custom page ranges
        const pageRanges = options.customPages.split(',').map(range => range.trim());
        
        for (const range of pageRanges) {
          if (range.includes('-')) {
            // Handle page range (e.g., "1-5")
            const [start, end] = range.split('-').map(Number);
            if (pageNum >= start && pageNum <= end) {
              return true;
            }
          } else {
            // Handle single page
            if (Number(range) === pageNum) {
              return true;
            }
          }
        }
        
        return false;
      default:
        return true;
    }
  };
  
  // Navigation handlers
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Zoom handlers
  const zoomIn = () => {
    setZoom(Math.min(zoom + 0.2, 3.0));
  };
  
  const zoomOut = () => {
    setZoom(Math.max(zoom - 0.2, 0.5));
  };
  
  if (!file) {
    return (
      <div className="border rounded-lg p-4 text-center bg-muted/20 aspect-video flex items-center justify-center">
        <p className="text-muted-foreground">Upload a PDF to see the preview</p>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="border rounded-lg p-4 space-y-4">
        <Skeleton className="h-[400px] w-full rounded-lg" />
        <div className="flex justify-between">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="border rounded-lg p-4 text-center bg-destructive/10 text-destructive flex items-center justify-center h-[400px]">
        <p>{error}</p>
      </div>
    );
  }
  
  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div 
        ref={containerRef}
        className="flex justify-center overflow-auto bg-muted/20 rounded-lg h-[400px]"
      >
        <canvas ref={canvasRef} className="block" />
      </div>
      
      <div className="flex justify-between items-center">
        {/* Page navigation */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousPage}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center border rounded-md px-3 py-1 text-sm">
            <span>
              Page {currentPage} of {totalPages}
            </span>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextPage}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Zoom controls */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={zoomOut}
            disabled={zoom <= 0.5}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center border rounded-md px-3 py-1 text-sm">
            <span>{Math.round(zoom * 100)}%</span>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={zoomIn}
            disabled={zoom >= 3.0}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}