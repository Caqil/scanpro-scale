// app/[lang]/admin/settings/pdf-tools/page.tsx
import { Metadata } from "next";
import { PdfToolsContent } from "./pdf-tools-content";

export const metadata: Metadata = {
  title: "PDF Tools Settings | Admin Dashboard",
  description: "Enable or disable PDF tools and configure tool options",
};

export default function PdfToolsPage() {
  return <PdfToolsContent />;
}
