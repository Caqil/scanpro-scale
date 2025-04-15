// app/[lang]/dashboard/dashboard-content.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserProfile } from "@/components/user-profile";
import { ApiKeyManager } from "@/components/dashboard/api-key-manager";
import { UsageStats } from "@/components/dashboard/usage-stats";
import { SubscriptionInfo } from "@/components/dashboard/subscription-info";
import { useSearchParams } from "next/navigation";
import { EmailVerificationAlert, EmailVerifiedAlert } from "@/components/email-verification-alert";

interface DashboardContentProps {
  user: any;
  usageStats: {
    totalOperations: number;
    operationCounts: Record<string, number>;
  };
}

export function DashboardContent({ 
  user, 
  usageStats
}: DashboardContentProps) {
  const [showVerifiedAlert, setShowVerifiedAlert] = useState(false);
  const searchParams = useSearchParams();
  const justVerified = searchParams?.get("verified") === "true";
  
  // Show verified alert if the user just verified their email
  useEffect(() => {
    if (justVerified && user.isEmailVerified) {
      setShowVerifiedAlert(true);
    }
  }, [justVerified, user.isEmailVerified]);
  
  return (
    <div className="space-y-6">
      {/* Show appropriate alert based on verification status */}
      {!user.isEmailVerified && (
        <EmailVerificationAlert 
          userEmail={user.email} 
          userName={user.name} 
        />
      )}
      
      {showVerifiedAlert && <EmailVerifiedAlert />}
      
      <Tabs 
        defaultValue="overview" 
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <UsageStats user={user} usageStats={usageStats} />
        </TabsContent>
        
        <TabsContent value="api-keys" className="space-y-6">
          <ApiKeyManager />
        </TabsContent>
        
        <TabsContent value="subscription" className="space-y-6">
          <SubscriptionInfo user={user} />
        </TabsContent>
        
        <TabsContent value="profile" className="space-y-6">
          <UserProfile user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
}