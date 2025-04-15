// signature-toolbar.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Trash2Icon, DownloadIcon, RotateCwIcon } from "lucide-react";

interface SignatureToolbarProps {
  onClear: () => void;
  onDownload: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  disabled?: boolean;
}

export function SignatureToolbar({ 
  onClear, 
  onDownload, 
  onUndo, 
  onRedo, 
  disabled = false 
}: SignatureToolbarProps) {
  return (
    <div className="flex gap-2 justify-between">
      <div className="flex gap-2">
        {onUndo && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onUndo}
            disabled={disabled}
          >
            <RotateCwIcon className="h-4 w-4 rotate-90" />
          </Button>
        )}
        
        {onRedo && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRedo}
            disabled={disabled}
          >
            <RotateCwIcon className="h-4 w-4 -rotate-90" />
          </Button>
        )}
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClear}
          disabled={disabled}
        >
          <Trash2Icon className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="default" 
          size="sm" 
          onClick={onDownload}
          disabled={disabled}
        >
          <DownloadIcon className="h-4 w-4 mr-1" />
          Save
        </Button>
      </div>
    </div>
  );
}