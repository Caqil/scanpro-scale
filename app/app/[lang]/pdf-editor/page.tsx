// app/[lang]/pdf-editor/page.tsx
import { Metadata } from "next";
import { PDFEditorContent } from "./pdf-editor-content";

export const metadata: Metadata = {
  title: "PDF Editor | MegaPDF",
  description: "Edit PDF documents online with our LibreOffice-style editor",
};

export default function PDFEditorPage() {
  return <PDFEditorContent />;
}
