"use client";

import dynamic from 'next/dynamic';

// Load the client component with no SSR
const RotatePdfClientComponent = dynamic(
  () => import('./rotate-pdf-client').then(mod => mod.RotatePdfClient),
  { ssr: false }
);

export function RotatePdfClientWrapper() {
  return <RotatePdfClientComponent />;
}

