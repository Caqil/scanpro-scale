"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Key, Plus, Trash2, AlertTriangle, DownloadIcon, CopyIcon, CheckIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { API_OPERATIONS } from "@/lib/validate-key";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  lastUsed: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export function ApiKeyManager() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [creatingKey, setCreatingKey] = useState(false);
  const [newKey, setNewKey] = useState<ApiKey | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [usageStats, setUsageStats] = useState<{ totalOperations: number; operationCounts: Record<string, number> } | null>(null);

  // Group operations into categories for better UI organization
  const operationCategories = {
    "Basic Operations": ["convert", "compress", "merge", "split", "rotate", "organize"],
    "Security & Signing": ["protect", "unlock", "watermark", "sign", "redact"],
    "Content & Analysis": ["ocr", "repair", "edit", "annotate", "extract"],
  };

  // Function to check if all permissions in a category are selected
  const isCategorySelected = (category: string[]): boolean => {
    return category.every(permission => selectedPermissions.includes(permission));
  };

  // Function to toggle all permissions in a category
  const toggleCategory = (category: string[], selected: boolean) => {
    if (selected) {
      // Add all permissions from this category that aren't already selected
      const newPermissions = [...selectedPermissions];
      category.forEach(permission => {
        if (!newPermissions.includes(permission)) {
          newPermissions.push(permission);
        }
      });
      setSelectedPermissions(newPermissions);
    } else {
      // Remove all permissions from this category
      setSelectedPermissions(selectedPermissions.filter(p => !category.includes(p)));
    }
  };

  // Load API keys on component mount
  useEffect(() => {
    loadApiKeys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load API keys from the API
  const loadApiKeys = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/keys");
      if (!response.ok) throw new Error("Failed to load API keys");
      const data = await response.json();
      setApiKeys(data.keys || []);
      
      // Also load usage statistics if we have keys
      if (data.keys && data.keys.length > 0) {
        loadUsageStats();
      }
    } catch (error) {
      console.error("Error loading API keys:", error);
      toast.error("Could not load API keys");
    } finally {
      setLoading(false);
    }
  };

  // Load usage statistics
  const loadUsageStats = async () => {
    try {
      const response = await fetch("/api/track-usage");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUsageStats(data);
        }
      }
    } catch (error) {
      console.error("Error loading usage statistics:", error);
    }
  };

  // Create new API key
  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a name for your API key");
      return;
    }

    if (selectedPermissions.length === 0) {
      toast.error("Please select at least one permission");
      return;
    }

    setCreatingKey(true);
    try {
      const response = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newKeyName,
          permissions: selectedPermissions,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create API key");
      }

      const data = await response.json();
      if (data.success && data.key) {
        setNewKey(data.key);
        toast.success("API key created successfully");
        loadApiKeys();
      } else {
        throw new Error("Failed to create API key");
      }
    } catch (error) {
      console.error("Error creating API key:", error);
      toast.error(error instanceof Error ? error.message : "Could not create API key");
    } finally {
      setCreatingKey(false);
    }
  };

  // Revoke API key
  const revokeApiKey = async (keyId: string) => {
    if (!confirm("Are you sure you want to revoke this API key? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/keys/${keyId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to revoke API key");
      
      toast.success("API key revoked successfully");
      loadApiKeys();
    } catch (error) {
      console.error("Error revoking API key:", error);
      toast.error("Could not revoke API key");
    }
  };

  // Handle copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setIsCopied(true);
        toast.success("API key copied to clipboard");
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
        toast.error("Failed to copy to clipboard");
      });
  };

  // Reset new key form when dialog closes
  const resetNewKeyForm = () => {
    setNewKeyName("");
    setSelectedPermissions([]);
    setNewKey(null);
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">API Keys</h2>
          <p className="text-muted-foreground">Manage your API keys for programmatic access to ScanPro services.</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) resetNewKeyForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create New API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            {!newKey ? (
              <>
                <DialogHeader>
                  <DialogTitle>Create New API Key</DialogTitle>
                  <DialogDescription>
                    Create an API key to access ScanPro services programmatically.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">API Key Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Development, Production, Test"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                    />
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-2">
                    <Label>Permissions</Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      Select the operations this API key will be allowed to perform.
                    </p>
                    
                    {/* Permissions by category */}
                    {Object.entries(operationCategories).map(([category, operations]) => (
                      <div key={category} className="border rounded-md p-4 space-y-3 mb-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id={`category-${category}`}
                            checked={isCategorySelected(operations)}
                            onCheckedChange={(checked) => toggleCategory(operations, !!checked)}
                          />
                          <Label htmlFor={`category-${category}`} className="font-medium">{category}</Label>
                        </div>
                        
                        <div className="ml-6 grid grid-cols-2 gap-2">
                          {operations.map((permission) => (
                            <div key={permission} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`permission-${permission}`}
                                checked={selectedPermissions.includes(permission)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedPermissions([...selectedPermissions, permission]);
                                  } else {
                                    setSelectedPermissions(selectedPermissions.filter(p => p !== permission));
                                  }
                                }}
                              />
                              <Label htmlFor={`permission-${permission}`} className="capitalize">{permission}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    {/* Allow all permissions option */}
                    <div className="border rounded-md p-4 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="permission-all"
                          checked={selectedPermissions.includes('*')}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedPermissions(['*']);
                            } else {
                              setSelectedPermissions([]);
                            }
                          }}
                        />
                        <Label htmlFor="permission-all" className="font-medium">Grant All Permissions</Label>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">
                        This will allow the API key to perform all operations, including any added in the future.
                      </p>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createApiKey} disabled={creatingKey}>
                    {creatingKey ? "Creating..." : "Create API Key"}
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>API Key Created</DialogTitle>
                  <DialogDescription>
                    Your new API key has been created. Make sure to copy it now as it won't be shown again.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <div className="flex">
                      <Input value={newKey.key} readOnly className="flex-1 font-mono text-sm" />
                      <Button 
                        variant="outline" 
                        className="ml-2" 
                        onClick={() => copyToClipboard(newKey.key)}
                        size="icon"
                      >
                        {isCopied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="rounded-md bg-amber-50 p-4 border border-amber-200 dark:bg-amber-950 dark:border-amber-800">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden="true" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">Important</h3>
                        <div className="mt-2 text-sm text-amber-700 dark:text-amber-400">
                          <p>
                            This API key will only be displayed once. Please save it somewhere secure. If you lose this key, you'll need to create a new one.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Permissions</Label>
                    <div className="flex flex-wrap gap-2">
                      {newKey.permissions.includes('*') ? (
                        <Badge variant="outline">All Permissions</Badge>
                      ) : (
                        newKey.permissions.map(permission => (
                          <Badge key={permission} variant="outline" className="capitalize">{permission}</Badge>
                        ))
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => {
                    setCreateDialogOpen(false);
                    resetNewKeyForm();
                  }}>
                    Done
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Usage Stats Card */}
      {usageStats && (
        <Card>
          <CardHeader>
            <CardTitle>API Usage This Month</CardTitle>
            <CardDescription>
              Your API usage statistics for the current billing period.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Operations</span>
                <span className="font-mono text-lg">{usageStats.totalOperations}</span>
              </div>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium mb-2">Operations Breakdown</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.entries(usageStats.operationCounts).map(([operation, count]) => (
                    <div key={operation} className="flex justify-between">
                      <span className="text-sm capitalize">{operation}</span>
                      <span className="text-sm font-mono">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* API Keys List */}
      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
          <CardDescription>
            Manage your existing API keys for accessing ScanPro services programmatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-8">
              <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No API Keys</h3>
              <p className="text-muted-foreground mb-4">You haven't created any API keys yet.</p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Create API Key
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>API Key</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((apiKey) => (
                  <TableRow key={apiKey.id}>
                    <TableCell className="font-medium">{apiKey.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm">{apiKey.key}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7" 
                          onClick={() => copyToClipboard(apiKey.key)}
                        >
                          <CopyIcon className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {apiKey.permissions.includes('*') ? (
                          <Badge>All</Badge>
                        ) : apiKey.permissions.length > 3 ? (
                          <>
                            {apiKey.permissions.slice(0, 2).map(perm => (
                              <Badge key={perm} variant="outline" className="capitalize">{perm}</Badge>
                            ))}
                            <Badge variant="outline">+{apiKey.permissions.length - 2} more</Badge>
                          </>
                        ) : (
                          apiKey.permissions.map(perm => (
                            <Badge key={perm} variant="outline" className="capitalize">{perm}</Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(apiKey.lastUsed)}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => revokeApiKey(apiKey.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* API Documentation Link */}
      <div className="text-center py-6">
        <p className="text-muted-foreground mb-4">Need help integrating with our API?</p>
        <a 
          href="/documentation/api" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:text-primary/80 inline-flex items-center"
        >
          <DownloadIcon className="h-4 w-4 mr-2" />
          View API Documentation
        </a>
      </div>
    </div>
  );
}
