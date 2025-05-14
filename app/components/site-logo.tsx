// components/site-logo.tsx
import React from "react";
import { cn } from "@/lib/utils";

interface SiteLogoProps {
  size?: number;
  className?: string;
}

export function SiteLogo({ size = 20, className }: SiteLogoProps) {
  return (
    <div
      className={cn("relative flex-shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <img
        src="/logo.png" // make sure the PNG file is placed in the `public/` directory
        alt="Site Logo"
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
      />
    </div>
  );
}
