// components/site-logo.tsx
import React from "react";
import { cn } from "@/lib/utils";

interface SiteLogoProps {
  size?: number;
  className?: string;
}

export function SiteLogo({ size = 20, className }: SiteLogoProps) {
  return (
    <div className={cn("relative flex-shrink-0", className)} style={{ width: size, height: size }}>
      <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        {/* Background with rounded corners - using the logo's yellow color #FFEAA0 */}
        <rect width="512" height="512" rx="128" fill="#FFEAA0" />
        
        {/* Scanner Corners */}
        <path d="M104 104C104 86.3 118.3 72 136 72H180C189 72 196 79 196 88C196 97 189 104 180 104H136V148C136 157 129 164 120 164C111 164 104 157 104 148V104Z" fill="#1A2238" />
        <path d="M408 104C408 86.3 393.7 72 376 72H332C323 72 316 79 316 88C316 97 323 104 332 104H376V148C376 157 383 164 392 164C401 164 408 157 408 148V104Z" fill="#1A2238" />
        <path d="M104 408C104 425.7 118.3 440 136 440H180C189 440 196 433 196 424C196 415 189 408 180 408H136V364C136 355 129 348 120 348C111 348 104 355 104 364V408Z" fill="#1A2238" />
        <path d="M408 408C408 425.7 393.7 440 376 440H332C323 440 316 433 316 424C316 415 323 408 332 408H376V364C376 355 383 348 392 348C401 348 408 355 408 364V408Z" fill="#1A2238" />

        {/* Document Container */}
        <rect x="152" y="120" width="208" height="272" rx="40" fill="#1A2238" />
        
        {/* Document Page */}
        <rect x="168" y="136" width="176" height="240" rx="24" fill="#FFFFFF" />
        
        {/* Document Corner Fold */}
        <path d="M308 136L344 172V136H308Z" fill="#E2E8F0" />
        
        {/* Document Lines */}
        <g fill="#1A2238">
          <circle cx="194" cy="196" r="12" />
          <rect x="218" y="190" width="96" height="12" rx="6" />
          
          <circle cx="194" cy="236" r="12" />
          <rect x="218" y="230" width="96" height="12" rx="6" />
          
          <circle cx="194" cy="276" r="12" />
          <rect x="218" y="270" width="96" height="12" rx="6" />
        </g>
      </svg>
    </div>
  );
}