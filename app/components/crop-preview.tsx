"use client";

import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { CircleArrowRightIcon } from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString();

interface CropCoordinates {
  left: number;
  bottom: number;
  right: number;
  top: number;
}

interface CropPreviewProps {
  pdfUrl: string;
  cropCoordinates: CropCoordinates;
  onPageChange?: (page: number) => void;
  onTotalPagesChange?: (totalPages: number) => void;
  totalPages?: number;
}

export default function CropPreview({
  pdfUrl,
  cropCoordinates,
  onPageChange,
  onTotalPagesChange,
  totalPages = 0
}: CropPreviewProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageWidth, setPageWidth] = useState<number>(0);
  const [pageHeight, setPageHeight] = useState<number>(0);
  const [scale, setScale] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle document load success
  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    if (onTotalPagesChange) {
      onTotalPagesChange(numPages);
    }
  }

  // Handle page change
  useEffect(() => {
    if (onPageChange) {
      onPageChange(pageNumber);
    }
  }, [pageNumber, onPageChange]);

  // Update page number when external page change occurs
  useEffect(() => {
    if (totalPages > 0 && pageNumber !== totalPages) {
      setPageNumber(totalPages);
    }
  }, [totalPages, pageNumber]);

  // Handle page render success to get dimensions
  function onPageRenderSuccess(page: any) {
    const { width, height } = page;
    setPageWidth(width);
    setPageHeight(height);

    // Adjust scale if container is available
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      
      const widthScale = containerWidth / width;
      const heightScale = containerHeight / height;
      
      // Use the smaller scale to fit the page in the container
      setScale(Math.min(widthScale, heightScale, 1));
    }
  }

  // Calculate crop box dimensions in the preview
  const getCropBoxStyle = () => {
    const { left, bottom, right, top } = cropCoordinates;
    
    // Convert PDF coordinates to CSS coordinates (PDF has origin at bottom-left)
    const cssLeft = left * scale;
    const cssBottom = (pageHeight - top) * scale; // transform bottom-left to top-left origin
    const cssWidth = (right - left) * scale;
    const cssHeight = (top - bottom) * scale;
    
    return {
      position: 'absolute' as const,
      left: `${cssLeft}px`,
      top: `${cssBottom}px`,
      width: `${cssWidth}px`,
      height: `${cssHeight}px`,
      border: '2px dashed red',
      pointerEvents: 'none' as const,
      backgroundColor: 'rgba(255, 0, 0, 0.1)',
    };
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden" ref={containerRef}>
      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={
          <div className="flex items-center justify-center h-full">
            <CircleArrowRightIcon className="w-8 h-8 animate-spin text-primary" />
          </div>
        }
        error={
          <div className="text-red-500 text-center p-4">
            Failed to load PDF. Please try again.
          </div>
        }
      >
        <Page
          pageNumber={pageNumber}
          scale={scale}
          onRenderSuccess={onPageRenderSuccess}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
        {pageWidth > 0 && pageHeight > 0 && (
          <div style={getCropBoxStyle()} />
        )}
      </Document>
    </div>
  );
}