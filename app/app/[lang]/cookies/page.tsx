// app/[lang]/cookies/page.tsx
import { Metadata } from "next";
import { CookiesContent } from "./cookies-content";

export const metadata: Metadata = {
  title: "Cookies Policy | MegaPDF",
  description: "Learn about how MegaPDF uses cookies on our website",
};

export default function CookiesPage() {
  return <CookiesContent />;
}