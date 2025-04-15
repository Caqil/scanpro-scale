"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import { useLanguageStore } from "@/src/store/store";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { CopyIcon, KeyIcon, LockIcon, ArrowRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export function ApiKeyDisplay() {
  const { t } = useLanguageStore();
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    // Only fetch if the user is logged in
    if (session?.user) {
      fetchApiKey();
    } else {
      setLoading(false);
    }
  }, [session]);

  const fetchApiKey = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/keys');
      const data = await res.json();
      
      if (data.keys && data.keys.length > 0) {
        setApiKey(data.keys[0].key);
      } else {
        setApiKey(null);
      }
    } catch (error) {
      console.error("Error fetching API key:", error);
      toast.error("Failed to load API keys");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey)
        .then(() => {
          setIsCopied(true);
          toast.success("API key copied to clipboard");
          setTimeout(() => setIsCopied(false), 2000);
        })
        .catch(() => {
          toast.error("Failed to copy API key");
        });
    }
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard/api-keys');
  };

  if (!session?.user) {
    return (
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
              <LockIcon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium">{t('developer.authentication.loginRequired') || "Login Required"}</h3>
            <p className="text-sm text-muted-foreground">
              {t('developer.authentication.loginMessage') || "Sign in to your account to access your API keys."}
            </p>
            <Button onClick={() => router.push('/login')} className="mt-2">
              {t('developer.authentication.signIn') || "Sign In"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-muted/30">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <KeyIcon className="h-4 w-4 text-primary" />
            {t('developer.authentication.yourApiKey') || "Your API Key"}
          </h3>
          
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <div className="flex justify-end">
                <Button variant="outline" onClick={handleGoToDashboard}>
                  {t('developer.authentication.managementKeys') || "Manage API Keys"}
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t('developer.authentication.noApiKeys') || "You don't have any API keys yet."}
              </p>
              <Button onClick={handleGoToDashboard}>
                {t('developer.authentication.createApiKey') || "Create API Key"}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}