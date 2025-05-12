"use client";

import dynamic from 'next/dynamic';

// Load the client component with no SSR
const CropPdfClientComponent = dynamic(
  () => import('./crop-pdf-client').then(mod => mod.CropPdfClient),
  { ssr: false }
);

export function CropPdfClientWrapper() {
  return <CropPdfClientComponent />;
}