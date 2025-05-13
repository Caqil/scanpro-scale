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
import { FREE_OPERATIONS_MONTHLY, OPERATION_COST } from "@/lib/balance-service";
import { API_OPERATIONS } from "@/lib/validate-key";

interface OperationPrice {
  operationName: string;
  price: number;
  customPrice: boolean;
}

export function PricingContent() {
  const [globalOperationCost, setGlobalOperationCost] =
    useState(OPERATION_COST);
  const [freeOperationsLimit, setFreeOperationsLimit] = useState(
    FREE_OPERATIONS_MONTHLY
  );
  const [operationPrices, setOperationPrices] = useState<OperationPrice[]>([]);
  const [editingOperation, setEditingOperation] =
    useState<OperationPrice | null>(null);
  const [saving, setSaving] = useState(false);

  // Load initial prices
  useEffect(() => {
    // Here you would normally fetch from API
    // For now we'll use the constants from the library
    const initialPrices = API_OPERATIONS.map((op) => ({
      operationName: op,
      price: OPERATION_COST,
      customPrice: false,
    }));
    setOperationPrices(initialPrices);
  }, []);

  const handleSaveGlobalSettings = async () => {
    try {
      setSaving(true);
      // Here you would normally call your API
      // await fetch('/api/admin/settings/pricing', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     globalOperationCost,
      //     freeOperationsLimit
      //   })
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Global pricing settings updated successfully");
    } catch (error) {
      console.error("Error saving pricing settings:", error);
      toast.error("Failed to update pricing settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveOperationPrice = async () => {
    if (!editingOperation) return;

    try {
      setSaving(true);
      // Here you would normally call your API
      // await fetch('/api/admin/settings/pricing/operation', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(editingOperation)
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update local state
      setOperationPrices((prices) =>
        prices.map((p) =>
          p.operationName === editingOperation.operationName
            ? editingOperation
            : p
        )
      );

      setEditingOperation(null);
      toast.success(
        `Price updated for ${editingOperation.operationName} operation`
      );
    } catch (error) {
      console.error("Error saving operation price:", error);
      toast.error("Failed to update operation price");
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
