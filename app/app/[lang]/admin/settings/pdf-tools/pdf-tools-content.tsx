// app/[lang]/admin/settings/pdf-tools/pdf-tools-content.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Info, AlertTriangle, CheckCircle } from "lucide-react";
import { fetchWithAuth } from "@/src/utils/auth";

interface ToolStatus {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: string;
  operationCost: number;
}

export function PdfToolsContent() {
  const [tools, setTools] = useState<ToolStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      setLoading(true);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetchWithAuth(
        `${apiUrl}/api/admin/settings/pdf-tools`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch tool settings");
      }

      const data = await response.json();

      if (data.success && data.tools) {
        setTools(data.tools);
      } else {
        // If API isn't implemented yet, use default tools for UI development
        setTools(getDefaultTools());
      }
    } catch (error) {
      console.error("Error fetching PDF tool settings:", error);
      toast.error("Failed to load PDF tool settings");
      // Load defaults for development
      setTools(getDefaultTools());
    } finally {
      setLoading(false);
    }
  };

  const toggleTool = async (toolId: string, enabled: boolean) => {
    try {
      setSaving(toolId);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetchWithAuth(
        `${apiUrl}/api/admin/settings/pdf-tools/${toolId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ enabled }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update tool status");
      }

      // Update local state
      setTools((prevTools) =>
        prevTools.map((tool) =>
          tool.id === toolId ? { ...tool, enabled } : tool
        )
      );

      toast.success(`${enabled ? "Enabled" : "Disabled"} tool successfully`);
    } catch (error) {
      console.error("Error updating tool status:", error);
      toast.error("Failed to update tool status");
    } finally {
      setSaving(null);
    }
  };

  const enableAllTools = async () => {
    try {
      setSaving("all");

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetchWithAuth(
        `${apiUrl}/api/admin/settings/pdf-tools/enable-all`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to enable all tools");
      }

      // Update local state
      setTools((prevTools) =>
        prevTools.map((tool) => ({ ...tool, enabled: true }))
      );

      toast.success("All tools enabled successfully");
    } catch (error) {
      console.error("Error enabling all tools:", error);
      toast.error("Failed to enable all tools");
    } finally {
      setSaving(null);
    }
  };

  const disableAllTools = async () => {
    try {
      setSaving("all");

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetchWithAuth(
        `${apiUrl}/api/admin/settings/pdf-tools/disable-all`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to disable all tools");
      }

      // Update local state
      setTools((prevTools) =>
        prevTools.map((tool) => ({ ...tool, enabled: false }))
      );

      toast.success("All tools disabled successfully");
    } catch (error) {
      console.error("Error disabling all tools:", error);
      toast.error("Failed to disable all tools");
    } finally {
      setSaving(null);
    }
  };

  // Helper to get tool categories for tabs
  const getCategories = () => {
    const categories = new Set(tools.map((tool) => tool.category));
    return Array.from(categories);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          PDF Tools Settings
        </h1>
        <p className="text-muted-foreground">
          Enable or disable PDF tools and configure tool options
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tool Status Overview</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={enableAllTools}
                disabled={saving === "all"}
              >
                {saving === "all" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Enable All
              </Button>
              <Button
                variant="outline"
                onClick={disableAllTools}
                disabled={saving === "all"}
              >
                {saving === "all" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <AlertTriangle className="mr-2 h-4 w-4" />
                )}
                Disable All
              </Button>
            </div>
          </div>
          <CardDescription>
            Enable or disable specific PDF tools for all users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center mb-6">
            <div className="flex items-center px-4 py-2 bg-muted rounded-md gap-2">
              <Info className="h-4 w-4 text-blue-500" />
              <p className="text-sm">
                Disabling a tool will make it unavailable for all users.
                Existing processes will complete, but new operations will be
                blocked.
              </p>
            </div>
          </div>

          <Tabs defaultValue={getCategories()[0]} className="space-y-4">
            <TabsList>
              {getCategories().map((category) => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            {getCategories().map((category) => (
              <TabsContent
                key={category}
                value={category}
                className="space-y-4"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  {tools
                    .filter((tool) => tool.category === category)
                    .map((tool) => (
                      <Card key={tool.id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-medium">
                              {tool.name}
                            </CardTitle>
                            <Badge
                              variant={tool.enabled ? "default" : "destructive"}
                            >
                              {tool.enabled ? "Enabled" : "Disabled"}
                            </Badge>
                          </div>
                          <CardDescription>{tool.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <Label>Status</Label>
                              <div className="text-sm text-muted-foreground">
                                Operation Cost: {tool.operationCost.toFixed(3)}{" "}
                                USD
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`switch-${tool.id}`}
                                checked={tool.enabled}
                                disabled={saving === tool.id}
                                onCheckedChange={(checked) =>
                                  toggleTool(tool.id, checked)
                                }
                              />
                              {saving === tool.id && (
                                <Loader2 className="h-4 w-4 animate-spin ml-2" />
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Default tools for development and testing
function getDefaultTools(): ToolStatus[] {
  return [
    {
      id: "convert",
      name: "Convert PDF",
      description: "Convert to and from PDF format",
      enabled: true,
      category: "Conversion",
      operationCost: 0.005,
    },
    {
      id: "compress",
      name: "Compress PDF",
      description: "Reduce file size of PDF documents",
      enabled: true,
      category: "Optimization",
      operationCost: 0.003,
    },
    {
      id: "merge",
      name: "Merge PDFs",
      description: "Combine multiple PDFs into one document",
      enabled: true,
      category: "Organization",
      operationCost: 0.005,
    },
    {
      id: "split",
      name: "Split PDF",
      description: "Split a PDF into multiple documents",
      enabled: true,
      category: "Organization",
      operationCost: 0.005,
    },
    {
      id: "protect",
      name: "Protect PDF",
      description: "Add password protection to PDF files",
      enabled: true,
      category: "Security",
      operationCost: 0.004,
    },
    {
      id: "unlock",
      name: "Unlock PDF",
      description: "Remove password protection from PDF files",
      enabled: true,
      category: "Security",
      operationCost: 0.005,
    },
    {
      id: "watermark",
      name: "Add Watermark",
      description: "Add text or image watermarks to PDFs",
      enabled: true,
      category: "Editing",
      operationCost: 0.005,
    },
    {
      id: "sign",
      name: "Sign PDF",
      description: "Add signature to PDF documents",
      enabled: true,
      category: "Security",
      operationCost: 0.005,
    },
    {
      id: "rotate",
      name: "Rotate PDF",
      description: "Rotate pages in PDF documents",
      enabled: true,
      category: "Editing",
      operationCost: 0.005,
    },
    {
      id: "ocr",
      name: "OCR",
      description: "Optical Character Recognition for scanned PDFs",
      enabled: true,
      category: "Conversion",
      operationCost: 0.01,
    },
    {
      id: "repair",
      name: "Repair PDF",
      description: "Fix corrupted PDF files",
      enabled: true,
      category: "Optimization",
      operationCost: 0.005,
    },
    {
      id: "edit",
      name: "Edit PDF",
      description: "Edit text and images in PDF documents",
      enabled: true,
      category: "Editing",
      operationCost: 0.005,
    },
    {
      id: "remove",
      name: "Remove Pages",
      description: "Remove specific pages from PDF documents",
      enabled: true,
      category: "Editing",
      operationCost: 0.005,
    },
    {
      id: "pagenumber",
      name: "Add Page Numbers",
      description: "Add page numbers to PDF documents",
      enabled: true,
      category: "Editing",
      operationCost: 0.005,
    },
  ];
}
