"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pencil1Icon,
  Cross2Icon,
  CheckIcon,
  EyeOpenIcon,
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons";

interface TextBlock {
  text: string;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  font: string;
  size: number;
  color: number;
  flags?: number;
  width?: number;
  height?: number;
}

interface VisualTextBlockEditorProps {
  textBlocks: TextBlock[];
  pageWidth: number;
  pageHeight: number;
  onTextBlockUpdate: (index: number, updatedBlock: TextBlock) => void;
  className?: string;
}

export function VisualTextBlockEditor({
  textBlocks,
  pageWidth,
  pageHeight,
  onTextBlockUpdate,
  className = "",
}: VisualTextBlockEditorProps) {
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null);
  const [editingBlock, setEditingBlock] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<TextBlock | null>(null);
  const [scale, setScale] = useState(1);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedBlocks, setHighlightedBlocks] = useState<number[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({
    width: 800,
    height: 600,
  });

  // Calculate scale to fit the page in the container
  useEffect(() => {
    const updateScale = () => {
      if (canvasRef.current) {
        const containerWidth = canvasRef.current.clientWidth - 40;
        const containerHeight = Math.min(700, window.innerHeight * 0.7);
        const scaleX = containerWidth / pageWidth;
        const scaleY = containerHeight / pageHeight;
        const newScale = Math.min(scaleX, scaleY, 1.5); // Allow more zoom
        setScale(newScale);
        setContainerSize({ width: containerWidth, height: containerHeight });
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [pageWidth, pageHeight]);

  // Search functionality
  useEffect(() => {
    if (searchTerm.trim()) {
      const matches = textBlocks
        .map((block, index) => ({ block, index }))
        .filter(({ block }) =>
          block.text.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map(({ index }) => index);
      setHighlightedBlocks(matches);
    } else {
      setHighlightedBlocks([]);
    }
  }, [searchTerm, textBlocks]);

  const handleBlockClick = (index: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedBlock(selectedBlock === index ? null : index);
  };

  const handleBlockDoubleClick = (index: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setEditingBlock(index);
    setEditForm({ ...textBlocks[index] });
    setIsEditDialogOpen(true);
  };

  const handleCanvasClick = () => {
    setSelectedBlock(null);
  };

  const handleSaveEdit = () => {
    if (editingBlock !== null && editForm) {
      onTextBlockUpdate(editingBlock, editForm);
      setIsEditDialogOpen(false);
      setEditingBlock(null);
      setEditForm(null);
      setSelectedBlock(null);
    }
  };

  const handleCancelEdit = () => {
    setIsEditDialogOpen(false);
    setEditingBlock(null);
    setEditForm(null);
  };

  // Quick edit text inline
  const handleQuickEdit = (index: number, newText: string) => {
    const updatedBlock = { ...textBlocks[index], text: newText };
    onTextBlockUpdate(index, updatedBlock);
  };

  // Fit to width
  const handleFitToWidth = () => {
    if (canvasRef.current) {
      const containerWidth = canvasRef.current.clientWidth - 40;
      const newScale = containerWidth / pageWidth;
      setScale(Math.min(newScale, 2)); // Cap at 200%
    }
  };

  // Reset zoom
  const handleResetZoom = () => {
    setScale(1);
  };

  const getBlockStyle = (block: TextBlock, index: number) => {
    const isSelected = selectedBlock === index;
    const isEditing = editingBlock === index;
    const isHighlighted = highlightedBlocks.includes(index);

    // Convert color integer to RGB
    const r = (block.color >> 16) & 255;
    const g = (block.color >> 8) & 255;
    const b = block.color & 255;

    return {
      position: "absolute" as const,
      left: block.x0 * scale,
      top: block.y0 * scale,
      width: Math.max((block.x1 - block.x0) * scale, 20),
      height: Math.max((block.y1 - block.y0) * scale, 16),
      fontSize: Math.max(block.size * scale * 0.8, 10),
      fontFamily: block.font.includes("Times")
        ? "Times, serif"
        : block.font.includes("Courier")
        ? "Courier, monospace"
        : "Arial, sans-serif",
      border: isSelected
        ? "2px solid #3b82f6"
        : isEditing
        ? "2px solid #10b981"
        : isHighlighted
        ? "2px solid #f59e0b"
        : "1px solid rgba(59, 130, 246, 0.3)",
      backgroundColor: isSelected
        ? "rgba(59, 130, 246, 0.15)"
        : isEditing
        ? "rgba(16, 185, 129, 0.15)"
        : isHighlighted
        ? "rgba(245, 158, 11, 0.15)"
        : "rgba(255, 255, 255, 0.9)",
      cursor: "pointer",
      padding: "1px 3px",
      borderRadius: "4px",
      transition: "all 0.2s ease",
      overflow: "hidden",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "flex-start",
      color: `rgb(${r}, ${g}, ${b})`,
      lineHeight: "1.2",
      wordWrap: "break-word" as const,
      boxShadow: isSelected
        ? "0 2px 8px rgba(59, 130, 246, 0.3)"
        : isHighlighted
        ? "0 2px 8px rgba(245, 158, 11, 0.3)"
        : "none",
      zIndex: isSelected ? 10 : isHighlighted ? 5 : 1,
    };
  };

  const scaledPageWidth = pageWidth * scale;
  const scaledPageHeight = pageHeight * scale;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controls */}
      <div className="space-y-4">
        {/* Main controls */}
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <EyeOpenIcon className="h-5 w-5" />
              Visual Text Editor
            </h3>
            <div className="text-sm text-muted-foreground">
              {textBlocks.length} text blocks • Scale: {Math.round(scale * 100)}
              %
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScale(Math.max(0.2, scale - 0.1))}
              disabled={scale <= 0.2}
            >
              Zoom Out
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScale(Math.min(3, scale + 0.1))}
              disabled={scale >= 3}
            >
              Zoom In
            </Button>
            <Button variant="outline" size="sm" onClick={handleFitToWidth}>
              Fit Width
            </Button>
            <Button variant="outline" size="sm" onClick={handleResetZoom}>
              Reset Zoom
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg">
          <MagnifyingGlassIcon className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search text in this page..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          {highlightedBlocks.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {highlightedBlocks.length} matches
            </span>
          )}
          {searchTerm && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchTerm("")}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <strong>Click</strong> on any text block to select it.{" "}
          <strong>Double-click</strong> to open the detailed editor. Use the
          search box above to find specific text.{" "}
          <strong>Yellow highlights</strong> show search matches.
        </p>
      </div>

      {/* Visual Canvas */}
      <div className="border rounded-lg bg-gray-50 dark:bg-gray-900 p-4">
        <div
          ref={canvasRef}
          className="relative bg-white dark:bg-gray-100 border border-gray-300 mx-auto overflow-auto shadow-lg"
          style={{
            width: Math.min(scaledPageWidth, containerSize.width),
            height: Math.min(scaledPageHeight, containerSize.height),
            maxWidth: "100%",
            maxHeight: "75vh",
          }}
          onClick={handleCanvasClick}
        >
          {/* Page background grid for better visualization */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `
                linear-gradient(to right, #000 1px, transparent 1px),
                linear-gradient(to bottom, #000 1px, transparent 1px)
              `,
              backgroundSize: `${25 * scale}px ${25 * scale}px`,
            }}
          />

          {/* Page dimensions indicator */}
          <div className="absolute top-2 left-2 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
            {Math.round(pageWidth)} × {Math.round(pageHeight)} px
          </div>

          {/* Text blocks */}
          {textBlocks.map((block, index) => (
            <div
              key={index}
              style={getBlockStyle(block, index)}
              onClick={(e) => handleBlockClick(index, e)}
              onDoubleClick={(e) => handleBlockDoubleClick(index, e)}
              title={`Block ${index + 1}: "${block.text.substring(0, 50)}${
                block.text.length > 50 ? "..." : ""
              }"\nFont: ${block.font} ${Math.round(
                block.size
              )}px\nPosition: (${Math.round(block.x0)}, ${Math.round(
                block.y0
              )})`}
              className="group hover:shadow-md transition-shadow"
            >
              <span
                style={{
                  fontSize: "inherit",
                  lineHeight: "1.2",
                  wordBreak: "break-word",
                  display: "-webkit-box",
                  WebkitLineClamp: Math.max(
                    1,
                    Math.floor(
                      ((block.y1 - block.y0) * scale) /
                        (block.size * scale * 1.2)
                    )
                  ),
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  width: "100%",
                }}
              >
                {block.text}
              </span>

              {/* Edit button on hover/select */}
              {(selectedBlock === index ||
                highlightedBlocks.includes(index)) && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute -top-6 -right-1 h-5 w-5 p-0 opacity-90 hover:opacity-100 z-20"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBlockDoubleClick(index, e);
                  }}
                >
                  <Pencil1Icon className="h-3 w-3" />
                </Button>
              )}

              {/* Block number indicator */}
              <div
                className={`absolute -top-4 -left-1 w-5 h-4 rounded-full text-xs flex items-center justify-center font-bold text-white ${
                  selectedBlock === index
                    ? "bg-blue-600"
                    : highlightedBlocks.includes(index)
                    ? "bg-yellow-500"
                    : "bg-gray-400"
                }`}
              >
                {index + 1}
              </div>
            </div>
          ))}

          {/* Empty state */}
          {textBlocks.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Pencil1Icon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No text blocks found on this page</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected Block Info */}
      {selectedBlock !== null && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-blue-800 dark:text-blue-200">
              Selected: Block #{selectedBlock + 1}
            </h4>
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleBlockDoubleClick(selectedBlock, e as any);
              }}
            >
              <Pencil1Icon className="h-4 w-4 mr-2" />
              Edit Block
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
            <div>
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                Position:
              </span>
              <br />
              <span>
                ({Math.round(textBlocks[selectedBlock].x0)},{" "}
                {Math.round(textBlocks[selectedBlock].y0)})
              </span>
            </div>
            <div>
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                Size:
              </span>
              <br />
              <span>
                {Math.round(
                  textBlocks[selectedBlock].x1 - textBlocks[selectedBlock].x0
                )}{" "}
                ×{" "}
                {Math.round(
                  textBlocks[selectedBlock].y1 - textBlocks[selectedBlock].y0
                )}
                px
              </span>
            </div>
            <div>
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                Font:
              </span>
              <br />
              <span className="truncate" title={textBlocks[selectedBlock].font}>
                {textBlocks[selectedBlock].font}
              </span>
            </div>
            <div>
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                Font Size:
              </span>
              <br />
              <span>{Math.round(textBlocks[selectedBlock].size)}px</span>
            </div>
          </div>

          {/* Quick edit */}
          <div>
            <Label className="text-blue-600 dark:text-blue-400 font-medium">
              Quick Edit Text:
            </Label>
            <Textarea
              className="mt-1"
              value={textBlocks[selectedBlock].text}
              onChange={(e) => handleQuickEdit(selectedBlock, e.target.value)}
              rows={Math.min(
                4,
                Math.max(
                  2,
                  Math.ceil(textBlocks[selectedBlock].text.length / 80)
                )
              )}
              placeholder="Edit text content..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              {textBlocks[selectedBlock].text.length} characters
            </p>
          </div>
        </div>
      )}

      {/* Search Results Summary */}
      {highlightedBlocks.length > 0 && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MagnifyingGlassIcon className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Found {highlightedBlocks.length} matches for "{searchTerm}"
              </span>
            </div>
            <div className="flex gap-1">
              {highlightedBlocks.slice(0, 5).map((blockIndex) => (
                <Button
                  key={blockIndex}
                  size="sm"
                  variant="outline"
                  className="h-6 w-8 p-0 text-xs"
                  onClick={() => setSelectedBlock(blockIndex)}
                >
                  {blockIndex + 1}
                </Button>
              ))}
              {highlightedBlocks.length > 5 && (
                <span className="text-xs text-muted-foreground flex items-center">
                  +{highlightedBlocks.length - 5} more
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detailed Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil1Icon className="h-5 w-5" />
              Edit Text Block #{editingBlock !== null ? editingBlock + 1 : ""}
            </DialogTitle>
            <DialogDescription>
              Modify the text content and properties of this text block.
            </DialogDescription>
          </DialogHeader>

          {editForm && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="text" className="text-base font-medium">
                  Text Content
                </Label>
                <Textarea
                  id="text"
                  value={editForm.text}
                  onChange={(e) =>
                    setEditForm({ ...editForm, text: e.target.value })
                  }
                  rows={6}
                  placeholder="Enter text content..."
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {editForm.text.length} characters
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="x0">X Position</Label>
                  <Input
                    id="x0"
                    type="number"
                    step="0.1"
                    value={editForm.x0.toFixed(1)}
                    onChange={(e) => {
                      const newX0 = parseFloat(e.target.value) || 0;
                      const width = editForm.x1 - editForm.x0;
                      setEditForm({
                        ...editForm,
                        x0: newX0,
                        x1: newX0 + width,
                      });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="y0">Y Position</Label>
                  <Input
                    id="y0"
                    type="number"
                    step="0.1"
                    value={editForm.y0.toFixed(1)}
                    onChange={(e) => {
                      const newY0 = parseFloat(e.target.value) || 0;
                      const height = editForm.y1 - editForm.y0;
                      setEditForm({
                        ...editForm,
                        y0: newY0,
                        y1: newY0 + height,
                      });
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="font">Font Family</Label>
                  <Input
                    id="font"
                    value={editForm.font}
                    onChange={(e) =>
                      setEditForm({ ...editForm, font: e.target.value })
                    }
                    placeholder="e.g., Helvetica, Times-Roman"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size">Font Size (px)</Label>
                  <Input
                    id="size"
                    type="number"
                    step="0.5"
                    value={editForm.size}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        size: parseFloat(e.target.value) || 12,
                      })
                    }
                    min="6"
                    max="144"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Live Preview</Label>
                <div
                  className="p-4 border rounded bg-white dark:bg-gray-800 min-h-[60px] flex items-center"
                  style={{
                    fontFamily: editForm.font.includes("Times")
                      ? "Times, serif"
                      : editForm.font.includes("Courier")
                      ? "Courier, monospace"
                      : "Arial, sans-serif",
                    fontSize: `${Math.min(editForm.size, 24)}px`,
                    color: `rgb(${(editForm.color >> 16) & 255}, ${
                      (editForm.color >> 8) & 255
                    }, ${editForm.color & 255})`,
                    lineHeight: "1.3",
                  }}
                >
                  {editForm.text || (
                    <span className="text-gray-400 italic">
                      Preview text will appear here...
                    </span>
                  )}
                </div>
              </div>

              {/* Dimensions info */}
              <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                <strong>Block dimensions:</strong>{" "}
                {Math.round(editForm.x1 - editForm.x0)} ×{" "}
                {Math.round(editForm.y1 - editForm.y0)} px
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit}>
              <Cross2Icon className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckIcon className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
