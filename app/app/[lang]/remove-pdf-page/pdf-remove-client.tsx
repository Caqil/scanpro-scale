// components/pdf-remove-client.tsx
"use client";

import dynamic from "next/dynamic";

// Dynamically import the PdfRemove component
const PdfRemove = dynamic(
  () =>
    import("@/components/pdf-remove").then((mod) => ({
      default: mod.PdfRemove,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 flex items-center justify-center">
        Loading PDF tool...
      </div>
    ),
  }
);

export function PdfRemoveClient() {
  return <PdfRemove />;
}
