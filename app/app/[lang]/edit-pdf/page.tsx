"use client";

import { PdfEditor } from "@/components/pdf-editor";
import { Toaster } from "sonner";

export default function PdfEditorPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <Toaster position="top-right" richColors />
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Edit Your PDF</h1>
        <PdfEditor />
      </div>
    </div>
  );
}