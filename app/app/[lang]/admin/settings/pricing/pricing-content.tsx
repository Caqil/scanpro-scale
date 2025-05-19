// app/[lang]/admin/settings/pricing/pricing-content.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/src/context/auth-context";

// API operations array from Go API
const API_OPERATIONS = [
  "convert",
  "compress",
  "merge",
  "split",
  "protect",
  "unlock",
  "watermark",
  "sign",
  "rotate",
  "ocr",
  "repair",
  "edit",
  "annotate",
  "extract",
  "redact",
  "organize",
  "chat",
  "remove",
];

// Constants for default values
const OPERATION_COST = 0.005;
const FREE_OPERATIONS_MONTHLY = 500;

interface OperationPrice {
  operationName: string;
  price: number;
  customPrice: boolean;
}

export function PricingContent() {
  const { isAuthenticated, user } = useAuth();
  const [globalOperationCost, setGlobalOperationCost] =
    useState(OPERATION_COST);
  const [freeOperationsLimit, setFreeOperationsLimit] = useState(
    FREE_OPERATIONS_MONTHLY
  );
  const [operationPrices, setOperationPrices] = useState<OperationPrice[]>([]);
  const [editingOperation, setEditingOperation] =
    useState<OperationPrice | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load initial pricing data
  useEffect(() => {
    async function loadPricingData() {
      try {
        setLoading(true);

        if (!isAuthenticated) {
          console.error("User not authenticated");
          toast.error("Authentication required");
          return;
        }

        // Call the Go backend API directly
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/pricing`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch pricing data: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.pricing) {
          // Set global pricing values
          setGlobalOperationCost(data.pricing.operationCost);
          setFreeOperationsLimit(data.pricing.freeOperationsMonthly);

          // Initialize operation prices from API
          const operations = data.pricing.operations || API_OPERATIONS;
          const initialPrices = operations.map((op: string) => {
            // Check if there's a custom price for this operation
            const hasCustomPrice =
              data.pricing.customPrices &&
              data.pricing.customPrices[op] !== undefined;

            return {
              operationName: op,
              price: hasCustomPrice
                ? data.pricing.customPrices[op]
                : data.pricing.operationCost,
              customPrice: hasCustomPrice,
            };
          });

          setOperationPrices(initialPrices);
          console.log("Loaded pricing data:", data.pricing);
        } else {
          // Fallback to defaults
          const initialPrices = API_OPERATIONS.map((op) => ({
            operationName: op,
            price: OPERATION_COST,
            customPrice: false,
          }));
          setOperationPrices(initialPrices);
          console.log("Using default pricing (no data from API)");
        }
      } catch (error) {
        console.error("Error loading pricing data:", error);

        // Fallback to defaults on error
        const initialPrices = API_OPERATIONS.map((op) => ({
          operationName: op,
          price: OPERATION_COST,
          customPrice: false,
        }));
        setOperationPrices(initialPrices);

        toast.error("Failed to load pricing settings");
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated) {
      loadPricingData();
    }
  }, [isAuthenticated]);

  const handleSaveGlobalSettings = async () => {
    try {
      if (!isAuthenticated) {
        toast.error("Authentication required");
        return;
      }

      setSaving(true);

      // Call Go backend API directly
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/pricing`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            operationCost: globalOperationCost,
            freeOperationsMonthly: freeOperationsLimit,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to save global settings: ${response.status}`);
      }

      // Update operation prices with new global cost for non-custom prices
      setOperationPrices((prev) =>
        prev.map((op) => ({
          ...op,
          price: op.customPrice ? op.price : globalOperationCost,
        }))
      );

      toast.success("Global pricing settings saved successfully");
    } catch (error) {
      console.error("Error saving global settings:", error);
      toast.error("Failed to save global settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveOperationPrice = async () => {
    if (!editingOperation) return;

    try {
      if (!isAuthenticated) {
        toast.error("Authentication required");
        return;
      }

      setSaving(true);

      // Update the local state first
      const updatedPrices = operationPrices.map((op) =>
        op.operationName === editingOperation.operationName
          ? editingOperation
          : op
      );

      setOperationPrices(updatedPrices);

      // Collect all custom prices
      const customPrices = updatedPrices
        .filter((p) => p.customPrice)
        .reduce(
          (acc, p) => ({
            ...acc,
            [p.operationName]: p.price,
          }),
          {}
        );

      // Call Go backend API directly
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/operation-pricing`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            customPrices,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to save operation price: ${response.status}`);
      }

      setEditingOperation(null);
      toast.success(
        `Price updated for ${editingOperation.operationName} operation`
      );
    } catch (error) {
      console.error("Error saving operation price:", error);
      toast.error("Failed to save operation price");
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 3,
    }).format(amount);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center p-8">
        Authentication required
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        Loading pricing settings...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pricing Settings</h1>
        <p className="text-muted-foreground">
          Configure operation costs for the pay-as-you-go model
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Global Pricing Settings</CardTitle>
          <CardDescription>
            Configure the default pricing for all operations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="globalOperationCost">
              Default Operation Cost (USD)
            </Label>
            <Input
              id="globalOperationCost"
              type="number"
              step="0.001"
              min="0.001"
              value={globalOperationCost}
              onChange={(e) =>
                setGlobalOperationCost(parseFloat(e.target.value))
              }
              placeholder="0.005"
            />
            <p className="text-sm text-muted-foreground">
              This is the default cost per operation for all API endpoints
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="freeOperationsLimit">
              Free Operations Monthly Limit
            </Label>
            <Input
              id="freeOperationsLimit"
              type="number"
              min="0"
              value={freeOperationsLimit}
              onChange={(e) => setFreeOperationsLimit(parseInt(e.target.value))}
              placeholder="500"
            />
            <p className="text-sm text-muted-foreground">
              Number of free operations allowed per user each month
            </p>
          </div>

          <Button onClick={handleSaveGlobalSettings} disabled={saving}>
            {saving ? "Saving..." : "Save Global Settings"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Operation-Specific Pricing</CardTitle>
          <CardDescription>
            Set custom prices for specific operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Operation</TableHead>
                <TableHead>Price (USD)</TableHead>
                <TableHead>Custom Price</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operationPrices.map((op) => (
                <TableRow key={op.operationName}>
                  <TableCell className="font-medium">
                    {op.operationName}
                  </TableCell>
                  <TableCell>{formatCurrency(op.price)}</TableCell>
                  <TableCell>
                    {op.customPrice ? (
                      <span className="text-green-500">Custom</span>
                    ) : (
                      <span className="text-muted-foreground">Default</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingOperation(op)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Operation Price Dialog */}
      <Dialog
        open={!!editingOperation}
        onOpenChange={() => setEditingOperation(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Operation Price</DialogTitle>
            <DialogDescription>
              Set a custom price for this specific operation
            </DialogDescription>
          </DialogHeader>

          {editingOperation && (
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="operationName">Operation</Label>
                <Input
                  id="operationName"
                  value={editingOperation.operationName}
                  disabled
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="customPrice">Use Custom Price</Label>
                  <Switch
                    id="customPrice"
                    checked={editingOperation.customPrice}
                    onCheckedChange={(checked) =>
                      setEditingOperation({
                        ...editingOperation,
                        customPrice: checked,
                        price: checked
                          ? editingOperation.price
                          : globalOperationCost,
                      })
                    }
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Toggle to set a custom price for this operation
                </p>
              </div>

              <div className="space-y-1">
                <Label htmlFor="operationPrice">Price (USD)</Label>
                <Input
                  id="operationPrice"
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={editingOperation.price}
                  onChange={(e) =>
                    setEditingOperation({
                      ...editingOperation,
                      price: parseFloat(e.target.value),
                      customPrice: true,
                    })
                  }
                  disabled={!editingOperation.customPrice}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingOperation(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveOperationPrice} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
