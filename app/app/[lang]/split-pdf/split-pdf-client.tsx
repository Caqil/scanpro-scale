// components/split-pdf/split-pdf-client.tsx
"use client";

import { useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { PdfSplitter } from "@/components/pdf-splitter";
// Import other necessary components...

export function SplitPdfClient() {
  // This is now safely using useSearchParams() in a client component
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") || "range";
  
  // Rest of the component implementation...
  
  return (
   <div className="mb-12">
          <PdfSplitter />
        </div>
  );
}