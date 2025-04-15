// components/WatermarkPositionPreview.tsx
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface WatermarkPositionPreviewProps {
  position: string;
  customX: number;
  customY: number;
  rotation: number;
  watermarkType: "text" | "image";
  text?: string;
  textColor?: string;
  fontSize?: number;
  imagePreviewUrl?: string;
  scale?: number;
}

export function WatermarkPositionPreview({
  position,
  customX,
  customY,
  rotation,
  watermarkType,
  text = "WATERMARK",
  textColor = "#FF0000",
  fontSize = 48,
  imagePreviewUrl,
  scale = 50,
}: WatermarkPositionPreviewProps) {
  const containerWidth = 200; // Fixed width for preview
  const containerHeight = 300; // Fixed height for preview
  const padding = 0.05; // 5% padding, matching API
  const paddingX = containerWidth * padding;
  const paddingY = containerHeight * padding;

  // State to store the actual dimensions of the watermark
  const [watermarkDimensions, setWatermarkDimensions] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  const watermarkRef = useRef<HTMLDivElement>(null);

  // Calculate scale factor to fit watermark in preview (proportional to A4 page: 612x792pt)
  const scaleFactor = Math.min(containerWidth / 612, containerHeight / 792);
  const previewFontSize = fontSize * scaleFactor;
  const previewImgWidth = 100 * (scale / 100) * scaleFactor;
  const previewImgHeight = 100 * (scale / 100) * scaleFactor;

  // Measure the actual dimensions of the watermark after rendering
  useEffect(() => {
    if (watermarkRef.current) {
      const { width, height } = watermarkRef.current.getBoundingClientRect();
      setWatermarkDimensions({ width, height });
    }
  }, [text, previewFontSize, textColor, imagePreviewUrl, previewImgWidth, previewImgHeight]);

  // Use the actual dimensions for centering
  const watermarkWidth = watermarkDimensions.width;
  const watermarkHeight = watermarkDimensions.height;

  let positions: { x: number; y: number }[] = [];

  switch (position.toLowerCase()) {
    case "center":
      positions.push({
        x: containerWidth / 2 - watermarkWidth / 2,
        y: containerHeight / 2 - watermarkHeight / 2,
      });
      break;

    case "tile": {
      // Estimate dimensions for tiling if actual dimensions aren't available yet
      const tileWidth = containerWidth / 3;
      const tileHeight = containerHeight / 3;
      for (let x = tileWidth / 2; x < containerWidth; x += tileWidth) {
        for (let y = tileHeight / 2; y < containerHeight; y += tileHeight) {
          positions.push({
            x: x - watermarkWidth / 2,
            y: y - watermarkHeight / 2,
          });
        }
      }
      break;
    }

    case "top-left":
      positions.push({
        x: paddingX,
        y: paddingY,
      });
      break;

    case "top-right":
      positions.push({
        x: containerWidth - paddingX - watermarkWidth,
        y: paddingY,
      });
      break;

    case "bottom-left":
      positions.push({
        x: paddingX,
        y: containerHeight - paddingY - watermarkHeight,
      });
      break;

    case "bottom-right":
      positions.push({
        x: containerWidth - paddingX - watermarkWidth,
        y: containerHeight - paddingY - watermarkHeight,
      });
      break;

    case "custom":
      positions.push({
        x: (customX / 100) * containerWidth - watermarkWidth / 2,
        y: (customY / 100) * containerHeight - watermarkHeight / 2,
      });
      break;

    default:
      positions.push({
        x: containerWidth / 2 - watermarkWidth / 2,
        y: containerHeight / 2 - watermarkHeight / 2,
      });
  }

  return (
    <div
      className="relative border rounded-lg bg-gray-100"
      style={{ width: containerWidth, height: containerHeight }}
    >
      {positions.map((pos, index) => (
        <div
          key={index}
          ref={watermarkRef}
          className="absolute"
          style={{
            left: `${pos.x}px`,
            top: `${pos.y}px`,
            transform: `rotate(${rotation}deg)`,
            transformOrigin: "center",
          }}
        >
          {watermarkType === "text" ? (
            <span
              style={{
                color: textColor,
                fontSize: `${previewFontSize}px`,
                whiteSpace: "nowrap",
              }}
            >
              {text}
            </span>
          ) : (
            imagePreviewUrl && (
              <img
                src={imagePreviewUrl}
                alt="Watermark"
                style={{
                  width: `${previewImgWidth}px`,
                  height: `${previewImgHeight}px`,
                }}
              />
            )
          )}
        </div>
      ))}
    </div>
  );
}