"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { PdfSigner } from "@/components/pdf-signer";
import { useLanguageStore } from "@/src/store/store";

export function SignPdfClient() {
  const { t } = useLanguageStore();
  const searchParams = useSearchParams();
  
  // Get initial tool selection from URL if provided
  const initialTool = searchParams.get("tool") || "signature";
  
  return (
    <div className="mb-12">
      <PdfSigner initialTool={initialTool} />
    </div>
  );
}