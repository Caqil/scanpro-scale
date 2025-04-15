"use client";

import { useState } from "react";
import { useLanguageStore } from "@/src/store/store";
import { PdfRotator } from "@/components/pdf-rotator";
import {
  RotateHeaderSection,
  HowToRotateSection,
  WhyRotateSection,
  RotateFaqSection,
  RelatedToolsSection,
  BestPracticesSection
} from "./rotate-content";

export function RotatePdfClient() {
  const { t } = useLanguageStore();

  return (
    <div className="container max-w-5xl py-12 mx-auto">
      <RotateHeaderSection />

      {/* Main Tool Card */}
      <div className="mb-12">
        <PdfRotator />
      </div>

      {/* How It Works */}
      <HowToRotateSection />

      {/* Benefits Section */}
      <WhyRotateSection />

      {/* FAQ Section */}
      <RotateFaqSection />

      {/* Best Practices Section */}
      <BestPracticesSection />

      {/* Related Tools Section */}
      <RelatedToolsSection />
    </div>
  );
}