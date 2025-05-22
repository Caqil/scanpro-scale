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
        const containerHeight = Math.min(600, window.innerHeight * 0.6);
        const scaleX = containerWidth / pageWidth;
        const scaleY = containerHeight / pageHeight;
        const newScale = Math.min(scaleX, scaleY, 1.2); // Allow slight zoom up
        setScale(newScale);
        setContainerSize({ width: containerWidth, height: containerHeight });
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [pageWidth, pageHeight]);

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

  const getBlockStyle = (block: TextBlock, index: number) => {
    const isSelected = selectedBlock === index;
    const isEditing = editingBlock === index;

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
      fontSize: Math.max(block.size * scale * 0.8, 10), // Slightly smaller for better fit
      fontFamily: block.font.includes("Times")
        ? "Times, serif"
        : block.font.includes("Courier")
        ? "Courier, monospace"
        : "Arial, sans-serif",
      border: isSelected
        ? "2px solid #3b82f6"
        : isEditing
        ? "2px solid #10b981"
        : "1px solid rgba(59, 130, 246, 0.3)",
      backgroundColor: isSelected
        ? "rgba(59, 130, 246, 0.15)"
        : isEditing
        ? "rgba(16, 185, 129, 0.15)"
        : "rgba(255, 255, 255, 0.8)",
      cursor: "pointer",
      padding: "1px 2px",
      borderRadius: "3px",
      transition: "all 0.2s ease",
      overflow: "hidden",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "flex-start",
      color: `rgb(${r}, ${g}, ${b})`,
      lineHeight: "1.1",
      wordWrap: "break-word" as const,
      boxShadow: isSelected ? "0 2px 8px rgba(59, 130, 246, 0.3)" : "none",
      zIndex: isSelected ? 10 : 1,
    };
  };

  const scaledPageWidth = pageWidth * scale;
  const scaledPageHeight = pageHeight * scale;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controls */}
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <EyeOpenIcon className="h-5 w-5" />
            Visual Text Editor
          </h3>
          <div className="text-sm text-muted-foreground">
            Scale: {Math.round(scale * 100)}% • {textBlocks.length} text blocks
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setScale(Math.max(0.3, scale - 0.1))}
          >
            Zoom Out
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setScale(Math.min(2, scale + 0.1))}
          >
            Zoom In
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const containerWidth = canvasRef.current?.clientWidth || 800;
              const newScale = (containerWidth - 40) / pageWidth;
              setScale(Math.min(newScale, 1));
            }}
          >
            Fit Width
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <strong>Click</strong> on any text block to select it.{" "}
          <strong>Double-click</strong> to open the detailed editor. Selected
          blocks show position and font info below.
        </p>
      </div>

      {/* Visual Canvas */}
      <div className="border rounded-lg bg-gray-50 dark:bg-gray-900 p-4">
        <div
          ref={canvasRef}
          className="relative bg-white dark:bg-gray-100 border border-gray-300 mx-auto overflow-auto shadow-lg"
          style={{
            width: scaledPageWidth,
            height: scaledPageHeight,
            maxWidth: "100%",
            maxHeight: "70vh",
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
              backgroundSize: `${20 * scale}px ${20 * scale}px`,
            }}
          />

          {/* Text blocks */}
          {textBlocks.map((block, index) => (
            <div
              key={index}
              style={getBlockStyle(block, index)}
              onClick={(e) => handleBlockClick(index, e)}
              onDoubleClick={(e) => handleBlockDoubleClick(index, e)}
              title={`Block ${index + 1}: "${block.text.substring(0, 50)}${
                block.text.length > 50 ? "..." : ""
              }"`}
              className="group hover:shadow-md"
            >
              <span
                style={{
                  fontSize: "inherit",
                  lineHeight: "1.1",
                  wordBreak: "break-word",
                  display: "-webkit-box",
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  width: "100%",
                }}
              >
                {block.text}
              </span>

              {/* Edit button on hover/select */}
              {selectedBlock === index && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute -top-6 -right-1 h-5 w-5 p-0 opacity-90 hover:opacity-100"
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
                className={`absolute -top-4 -left-1 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold text-white ${
                  selectedBlock === index ? "bg-blue-600" : "bg-gray-400"
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
              <span>{textBlocks[selectedBlock].font}</span>
            </div>
            <div>
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                Size:
              </span>
              <br />
              <span>{textBlocks[selectedBlock].size}px</span>
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
              rows={3}
              placeholder="Edit text content..."
            />
          </div>
        </div>
      )}

      {/* Detailed Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
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
                    max="72"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Preview</Label>
                <div
                  className="p-3 border rounded bg-gray-50 dark:bg-gray-800"
                  style={{
                    fontFamily: editForm.font.includes("Times")
                      ? "Times, serif"
                      : editForm.font.includes("Courier")
                      ? "Courier, monospace"
                      : "Arial, sans-serif",
                    fontSize: `${Math.min(editForm.size, 16)}px`,
                    color: `rgb(${(editForm.color >> 16) & 255}, ${
                      (editForm.color >> 8) & 255
                    }, ${editForm.color & 255})`,
                  }}
                >
                  {editForm.text || "Preview text will appear here..."}
                </div>
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
