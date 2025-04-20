"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CreditCardIcon, CheckIcon, XIcon, CalendarIcon, AlertTriangleIcon } from "lucide-react";
import { useLanguageStore } from "@/src/store/store";

interface SubscriptionInfoProps {
  user: any;
}

export function SubscriptionInfo({ user }: SubscriptionInfoProps) {
  const { t } = useLanguageStore();
  const [loading, setLoading] = useState(false);

  // Pricing tiers
  const pricingTiers = [
    {
      name: t('pricing.planDescriptions.free'),
      price: "$0",
      features: [
        t('pricing.features.amount.free'),
        t('pricing.features.rateLimit.free'),
        t('pricing.features.apiKeys.free'),
        t('pricing.features.fileSize.free'),
        t('pricing.features.support.free'),
      ],
      limitations: [
        t('pricing.features.watermarking'),
        t('pricing.features.advancedProtection'),
        t('pricing.features.bulkProcessing'),
      ],
    },
    {
      name: t('pricing.planDescriptions.basic'),
      price: "$9.99",
      features: [
        t('pricing.features.amount.basic'),
        t('pricing.features.rateLimit.basic'),
        t('pricing.features.apiKeys.basic'),
        t('pricing.features.fileSize.basic'),
        t('pricing.features.support.free'),
      ],
      limitations: [],
    },
    {
      name: t('pricing.planDescriptions.pro'),
      price: "$29.99",
      features: [
        t('pricing.features.amount.pro'),
        t('pricing.features.rateLimit.pro'),
        t('pricing.features.apiKeys.pro'),
        t('pricing.features.fileSize.pro'),
        t('pricing.features.ocr'),
        t('pricing.features.support.priority'),
        t('pricing.features.watermarking'),
        t('pricing.features.advancedProtection'),
        t('pricing.features.bulkProcessing'),
      ],
      limitations: [],
    },
    {
      name: t('pricing.planDescriptions.enterprise'),
      price: "$99.99",
      features: [
        t('pricing.features.amount.enterprise'),
        t('pricing.features.rateLimit.enterprise'),
        t('pricing.features.apiKeys.enterprise'),
        t('pricing.features.fileSize.enterprise'),
        t('pricing.features.support.dedicated'),
        t('pricing.features.whiteLabel'),
        t('pricing.features.serviceLevel'),
      ],
      limitations: [],
    },
  ];

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Tidak Berlaku";
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Periksa apakah langganan akan kedaluwarsa dalam 3 hari
  const isExpiringSoon = (dateString: string | null) => {
    if (!dateString) return false;
    const endDate = new Date(dateString);
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    return endDate > now && endDate <= threeDaysFromNow;
  };

  // Periksa apakah langganan telah kedaluwarsa
  const isExpired = (dateString: string | null) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  // Handle subscription upgrade atau perpanjangan
  const handleUpgrade = async (tier: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });

      const data = await res.json();
      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error(data.error || "Gagal memulai upgrade/perpanjangan");
      }
    } catch (error) {
      console.error("Error upgrading subscription:", error);
      toast.error(error instanceof Error ? error.message : "Gagal memproses langganan");
    } finally {
      setLoading(false);
    }
  };

  // Handle subscription cancellation
  const handleCancel = async () => {
    if (!confirm("Apakah Anda yakin ingin membatalkan langganan? Anda akan kehilangan fitur premium di akhir periode penagihan.")) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/subscription/cancel', {
        method: 'POST',
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Langganan berhasil dibatalkan");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        throw new Error(data.error || "Gagal membatalkan langganan");
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error(error instanceof Error ? error.message : "Gagal membatalkan langganan");
    } finally {
      setLoading(false);
    }
  };

  const currentTier = user?.subscription?.tier || "free";
  const subscriptionEnd = user?.subscription?.currentPeriodEnd;
  const subscriptionStatus = user?.subscription?.status;
  const expired = isExpired(subscriptionEnd);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Langganan</h2>

      {/* Current subscription info */}
      <Card>
        <CardHeader>
          <CardTitle>Paket Saat Ini</CardTitle>
          <CardDescription>Detail langganan dan batas penggunaan Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold capitalize">{currentTier} Plan</h3>
              <p className="text-muted-foreground">
                {expired
                  ? "Kedaluwarsa (Beralih ke Free)"
                  : subscriptionStatus === "active"
                  ? "Aktif"
                  : "Tidak Aktif"}
              </p>
            </div>
            <Badge
              variant={
                currentTier === "enterprise" ? "default" :
                currentTier === "pro" ? "default" :
                currentTier === "basic" ? "outline" :
                "secondary"
              }
            >
              {currentTier === "free" ? "Gratis" : "Berbayar"}
            </Badge>
          </div>

          <div className="mt-4 space-y-2 text-sm">
            {currentTier !== "free" && subscriptionEnd && (
              <>
                <p className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Perpanjangan pada: {formatDate(subscriptionEnd)}
                  </span>
                  {isExpiringSoon(subscriptionEnd) && (
                    <AlertTriangleIcon className="h-4 w-4 text-yellow-500" />
                  )}
                </p>
                {expired && (
                  <p className="text-red-500">
                    Langganan Anda telah kedaluwarsa. Anda telah beralih ke paket Free (500 operasi/bulan).
                  </p>
                )}
              </>
            )}
            {currentTier !== "free" && !expired && (
              <p className="text-muted-foreground">
                Jika tidak diperpanjang, langganan Anda akan beralih ke paket Free (500 operasi/bulan) setelah {formatDate(subscriptionEnd)}.
              </p>
            )}
            {currentTier === "free" && (
              <p className="text-muted-foreground">
                Anda menggunakan paket Free dengan batas 500 operasi per bulan.
              </p>
            )}
          </div>
        </CardContent>
        {currentTier !== "free" && !expired && (
          <CardFooter className="space-x-2">
            <Button
              variant="default"
              onClick={() => handleUpgrade(currentTier)}
              disabled={loading}
            >
              Perpanjang Langganan
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              Batalkan Langganan
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Pricing tiers */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {pricingTiers.map((tier) => (
          <Card
            key={tier.name.toLowerCase()}
            className={
              currentTier === tier.name.toLowerCase()
                ? "border-primary ring-1 ring-primary"
                : ""
            }
          >
            <CardHeader>
              <CardTitle>{tier.name}</CardTitle>
              <CardDescription>
                <span className="text-2xl font-bold">{tier.price}</span> / bulan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Fitur:</h4>
                <ul className="space-y-1">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckIcon className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {tier.limitations.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Keterbatasan:</h4>
                  <ul className="space-y-1">
                    {tier.limitations.map((limitation, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <XIcon className="h-4 w-4 text-red-500 mt-0.5" />
                        <span>{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
            <CardFooter>
              {currentTier === tier.name.toLowerCase() ? (
                <Button className="w-full" disabled>
                  Paket Saat Ini
                </Button>
              ) : (
                <Button
                  className="w-full"
                  variant={tier.name.toLowerCase() === "free" ? "outline" : "default"}
                  disabled={
                    loading ||
                    (currentTier !== "free" &&
                      ["basic", "pro", "enterprise"].indexOf(currentTier) >=
                      ["basic", "pro", "enterprise"].indexOf(tier.name.toLowerCase()))
                  }
                  onClick={() => handleUpgrade(tier.name.toLowerCase())}
                >
                  {tier.name.toLowerCase() === "free"
                    ? "Turun ke Free"
                    : currentTier === "free"
                    ? "Upgrade"
                    : "Ubah Paket"}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}