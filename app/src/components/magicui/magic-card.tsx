"use client";

import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface MagicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  gradientColor?: string;
  spotlight?: boolean;
  spotlightColor?: string;
  borderColor?: string;
  noHover?: boolean;
}

export const MagicCard = ({
  children,
  className,
  gradientColor = "rgba(200, 200, 255, 0.05)",
  spotlight = false,
  spotlightColor = "rgba(170, 170, 230, 0.1)",
  borderColor = "rgba(200, 200, 255, 0.1)",
  noHover = false,
  ...props
}: MagicCardProps) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current || noHover) return;

    const div = divRef.current;
    const rect = div.getBoundingClientRect();
    
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseEnter = () => {
    if (noHover) return;
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    if (noHover) return;
    setOpacity(0);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const spotlightStyles = {
    background: spotlight
      ? `radial-gradient(circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`
      : "none",
    opacity: opacity,
  };

  return (
    <div
      ref={divRef}
      className={cn(
        "relative rounded-lg overflow-hidden",
        "transition-all duration-300",
        isFocused ? "ring-2 ring-primary/50" : "",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      style={{ 
        background: `linear-gradient(145deg, ${gradientColor}, transparent)`,
        border: `1px solid ${borderColor}`,
      }}
      {...props}
    >
      {/* Spotlight overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-300 pointer-events-none z-20"
        style={spotlightStyles}
      />
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-grid-pattern"></div>
      
      {/* Card content */}
      <div className="relative z-10">{children}</div>
      
      {/* Hover effect - radial gradient */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
        style={{
          background: `radial-gradient(circle at center, ${gradientColor} 0%, transparent 70%)`,
        }}
      />
      
      {/* Subtle animated border glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    </div>
  );
};