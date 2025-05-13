// app/[lang]/admin/settings/pricing/page.tsx
import { Metadata } from "next";
import { PricingContent } from "./pricing-content";

export const metadata: Metadata = {
  title: "Operation Pricing | Admin Dashboard",
  description: "Configure operation costs for the pay-as-you-go model",
};

export default function PricingPage() {
  return <PricingContent />;
}
