// app/[lang]/admin/api-usage/page.tsx
import { Metadata } from "next";
import { ApiUsageContent } from "./api-usage-content";

export const metadata: Metadata = {
  title: "API Usage Analytics | Admin Dashboard",
  description: "Monitor API usage patterns and performance",
};

export default function ApiUsagePage() {
  return <ApiUsageContent />;
}
