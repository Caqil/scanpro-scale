// app/[lang]/dashboard/subscription/cancel/page.tsx

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export default function SubscriptionCancelPage() {
  const router = useRouter();

  useEffect(() => {
    // Notify user that the subscription was canceled
    toast.info("Subscription process canceled");
  }, []);

  return (
    <div className="container max-w-md py-12">
      <Card>
        <CardHeader>
          <div className="flex justify-center mb-4">
            <XCircle className="h-12 w-12 text-amber-500" />
          </div>
          <CardTitle className="text-center">Subscription Canceled</CardTitle>
          <CardDescription className="text-center">
            You've canceled the subscription process.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6">
            The subscription process was canceled. No changes have been made to
            your account. Feel free to try again when you're ready.
          </p>
          <Button onClick={() => router.push("/dashboard/subscription")}>
            Back to Subscription
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
