// components/pdf/tool-disabled.tsx
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ToolDisabledProps {
  toolName: string;
  message?: string;
}

export function ToolDisabled({ toolName, message }: ToolDisabledProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 min-h-[300px] text-center border rounded-lg bg-muted/10">
      <div className="mb-4 p-4 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
        <AlertTriangle className="h-8 w-8 text-yellow-600 dark:text-yellow-500" />
      </div>
      <h3 className="text-xl font-medium mb-2">Tool Currently Unavailable</h3>
      <p className="text-muted-foreground mb-4 max-w-md">
        {message ||
          `The ${toolName} tool is currently disabled by the administrator. Please try again later or contact support for assistance.`}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" asChild>
          <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
        <Button variant="default" asChild>
          <Link href="/help">Contact Support</Link>
        </Button>
      </div>
    </div>
  );
}
