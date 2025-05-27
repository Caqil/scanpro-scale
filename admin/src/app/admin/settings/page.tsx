"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/utils/auth";
import { Settings as SettingsIcon, Save, DollarSign } from "lucide-react";

interface PricingSettings {
  operationCost: number;
  freeOperationsMonthly: number;
  customPrices?: Record<string, number>;
}

export default function SettingsPage() {
  const [pricing, setPricing] = useState<PricingSettings>({
    operationCost: 0.005,
    freeOperationsMonthly: 500,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPricingSettings();
  }, []);

  const fetchPricingSettings = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/pricing`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.pricing) {
          setPricing(data.pricing);
        }
      } else {
        console.log("Using default pricing settings");
      }
    } catch (error) {
      console.error("Error fetching pricing settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const savePricingSettings = async () => {
    try {
      setSaving(true);
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/pricing`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(pricing),
        }
      );

      if (response.ok) {
        alert("Pricing settings saved successfully!");
      } else {
        alert("Failed to save pricing settings");
      }
    } catch (error) {
      console.error("Error saving pricing settings:", error);
      alert("Error saving pricing settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure system settings and pricing
          </p>
        </div>
      </div>

      {/* Pricing Settings */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-medium">Pricing Settings</h3>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Configure operation costs for the pay-as-you-go model
          </p>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Default Operation Cost (USD)
              </label>
              <input
                type="number"
                step="0.001"
                min="0.001"
                value={pricing.operationCost}
                onChange={(e) =>
                  setPricing({
                    ...pricing,
                    operationCost: parseFloat(e.target.value) || 0.005,
                  })
                }
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
                placeholder="0.005"
              />
              <p className="text-xs text-muted-foreground">
                Cost charged per API operation
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Free Operations Monthly Limit
              </label>
              <input
                type="number"
                min="0"
                value={pricing.freeOperationsMonthly}
                onChange={(e) =>
                  setPricing({
                    ...pricing,
                    freeOperationsMonthly: parseInt(e.target.value) || 500,
                  })
                }
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
                placeholder="500"
              />
              <p className="text-xs text-muted-foreground">
                Number of free operations per user each month
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={savePricingSettings}
              disabled={saving}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-medium">System Information</h3>
          </div>
        </div>

        <div className="p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium">API Version</p>
              <p className="text-sm text-muted-foreground">v1.0.0</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Environment</p>
              <p className="text-sm text-muted-foreground">
                {process.env.NODE_ENV || "development"}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">API URL</p>
              <p className="text-sm text-muted-foreground font-mono">
                {process.env.NEXT_PUBLIC_API_URL}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Admin Panel Version</p>
              <p className="text-sm text-muted-foreground">v1.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
