"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useLanguageStore } from "@/src/store/store";
import { PdfPageNumberer } from "@/components/page-number-component";

export function AddPageNumbersClient() {
  const { t } = useLanguageStore();
  const searchParams = useSearchParams();
  
  // Get any format preference from URL params
  const [initialFormat, setInitialFormat] = useState<string>("numeric");
  
  useEffect(() => {
    const format = searchParams.get("format");
    if (format && ["numeric", "roman", "alphabetic"].includes(format)) {
      setInitialFormat(format);
    }
  }, [searchParams]);

  return (
    <div className="mb-12">
      <PdfPageNumberer />
    </div>
  );
}