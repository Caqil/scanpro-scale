"use client";

import dynamic from 'next/dynamic';

// Load the client component with no SSR
const SignPdfClientComponent = dynamic(
  () => import('./sign-pdf-client').then(mod => mod.SignPdfClient),
  { ssr: false }
);

export function SignPdfClientWrapper() {
  return <SignPdfClientComponent />;
}