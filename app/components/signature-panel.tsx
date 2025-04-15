// signature-panel.tsx
"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { SignatureToolbar } from "./signature-toolbar";
import { DownloadIcon } from "lucide-react";
import { SignatureCanvas } from "./sign/signature-canvas";

interface SignaturePanelProps {
  onSave: (dataUrl: string) => void;
  onCancel?: () => void;
  defaultColor?: string;
  defaultSize?: number;
}

export function SignaturePanel({ 
  onSave, 
  onCancel, 
  defaultColor = '#000000',
  defaultSize = 2
}: SignaturePanelProps) {
  const [color, setColor] = useState(defaultColor);
  const [size, setSize] = useState(defaultSize);
  const signatureRef = useRef<any>(null);

  const handleSave = () => {
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      const dataUrl = signatureRef.current.toDataURL('image/png');
      onSave(dataUrl);
    }
  };

  const handleClear = () => {
    signatureRef.current?.clear();
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-md p-2 bg-white">
        <SignatureCanvas
          ref={signatureRef}
          penColor={color}
          canvasProps={{
            className: 'signature-canvas w-full h-48',
          }}
        />
      </div>
      
      <div className="space-y-4">
        <div>
          <Label>Pen Color</Label>
          <div className="flex items-center gap-2 mt-1">
            <input 
              type="color" 
              value={color} 
              onChange={(e) => setColor(e.target.value)} 
              className="w-8 h-8 p-0 border-0"
            />
            <span className="text-sm text-muted-foreground">{color}</span>
          </div>
        </div>
        
        <div>
          <Label>Pen Size</Label>
          <Slider 
            min={1}
            max={10}
            step={1}
            value={[size]}
            onValueChange={(value) => setSize(value[0])}
            className="mt-2"
          />
        </div>
        
        <SignatureToolbar
          onClear={handleClear}
          onDownload={handleSave}
        />
        
        <div className="flex gap-2">
          {onCancel && (
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          <Button 
            className="flex-1"
            onClick={handleSave}
          >
            <DownloadIcon className="h-4 w-4 mr-2" />
            Save Signature
          </Button>
        </div>
      </div>
    </div>
  );
}