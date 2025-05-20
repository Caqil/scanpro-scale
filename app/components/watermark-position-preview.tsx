import React from "react";

type WatermarkPositionPreviewProps = {
  position: string;
  customX?: number;
  customY?: number;
  rotation: number;
  watermarkType: string;
  text?: string;
  textColor?: string;
  fontSize?: number;
  imagePreviewUrl?: string;
  scale?: number;
};

export function WatermarkPositionPreview({
  position,
  customX = 50,
  customY = 50,
  rotation,
  watermarkType,
  text = "WATERMARK",
  textColor = "#FF0000",
  fontSize = 24,
  imagePreviewUrl,
  scale = 50,
}: WatermarkPositionPreviewProps) {
  // Calculate position classes based on the selected position
  const getPositionStyles = () => {
    switch (position) {
      case "center":
        return "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2";
      case "top-left":
        return "absolute top-4 left-4";
      case "top-right":
        return "absolute top-4 right-4";
      case "bottom-left":
        return "absolute bottom-4 left-4";
      case "bottom-right":
        return "absolute bottom-4 right-4";
      case "custom":
        return `absolute transform -translate-x-1/2 -translate-y-1/2`;
      case "tile":
        return ""; // Special case for tiling
      default:
        return "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2";
    }
  };

  // Get custom position styles
  const getCustomPositionStyle = () => {
    if (position !== "custom") return {};

    return {
      top: `${customY}%`,
      left: `${customX}%`,
    };
  };

  // Get rotation style
  const getRotationStyle = () => {
    return {
      transform: `${
        position === "custom" ? "translate(-50%, -50%) " : ""
      }rotate(${rotation}deg)`,
    };
  };

  // Calculate font size for preview (scaled down for preview)
  const previewFontSize = fontSize
    ? Math.max(12, Math.min(fontSize / 2, 36))
    : 24;

  // Create tiled watermarks for "tile" position
  const renderTiledWatermarks = () => {
    const watermarks = [];
    const gridSize = 3; // 3x3 grid

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const key = `${row}-${col}`;
        const top = `${(100 / gridSize) * row + 100 / gridSize / 2}%`;
        const left = `${(100 / gridSize) * col + 100 / gridSize / 2}%`;

        watermarks.push(
          <div
            key={key}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{
              top,
              left,
              ...getRotationStyle(),
            }}
          >
            {renderWatermarkContent()}
          </div>
        );
      }
    }

    return watermarks;
  };

  // Render the watermark content (text or image)
  const renderWatermarkContent = () => {
    if (watermarkType === "image" && imagePreviewUrl) {
      return (
        <img
          src={imagePreviewUrl}
          alt="Watermark"
          className="max-w-full max-h-full object-contain"
          style={{
            maxWidth: scale ? `${scale}%` : "50%",
            opacity: 0.5, // Show preview with opacity
          }}
        />
      );
    } else {
      return (
        <div
          className="whitespace-nowrap"
          style={{
            color: textColor || "#FF0000",
            fontSize: `${previewFontSize}px`,
            fontWeight: "bold",
            opacity: 0.5, // Show preview with opacity
          }}
        >
          {text || "WATERMARK"}
        </div>
      );
    }
  };

  return (
    <div className="relative w-full h-60 bg-gray-100 border rounded overflow-hidden">
      {/* Page representation */}
      <div className="absolute inset-0 flex items-center justify-center text-gray-300">
        <div className="text-xs uppercase text-center">
          <div className="border-b border-gray-200 w-16 mb-1 mx-auto"></div>
          <span>PDF Page</span>
          <div className="border-t border-gray-200 w-16 mt-1 mx-auto"></div>
        </div>
      </div>

      {/* Watermark preview */}
      {position === "tile" ? (
        renderTiledWatermarks()
      ) : (
        <div
          className={getPositionStyles()}
          style={{
            ...getCustomPositionStyle(),
            ...getRotationStyle(),
          }}
        >
          {renderWatermarkContent()}
        </div>
      )}
    </div>
  );
}
