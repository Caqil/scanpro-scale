'use client'
import { PdfMerger } from "@/components/pdf-merger"; 
import { Suspense } from "react";

export default function ClientMergePDFContent() {
  return (
    <div>
     <PdfMerger />
     
    </div>
  );
}