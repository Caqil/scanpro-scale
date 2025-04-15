// app/tools/layout.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Tools | ScanPro",
  description: "All the PDF tools you need in one place. Convert, edit, merge, split, compress, and more.",
};

export default function ToolsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-gradient-to-b from-muted/20 to-background">
      {children}
    </div>
  );
}