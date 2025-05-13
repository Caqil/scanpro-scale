"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LanguageLink } from "@/components/language-link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, Home, AlertCircle, Loader2 } from "lucide-react";

export default function DepositSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [amount, setAmount] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const orderId = searchParams.get("token"); // Use 'token' for PayPal order ID

    if (!orderId) {
      setVerifying(false);
      setErrorMessage("Missing order ID");
      return;
    }

    const verifyPayment = async () => {
      try {
        console.log("Verifying payment with orderId:", orderId);
        const response = await fetch("/api/user/deposit/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
          credentials: "include",
        });

        console.log("Response status:", response.status);

        if (!response.ok) {
          const text = await response.text();
          console.error("Non-OK response:", response.status, text);
          setErrorMessage(
            `Verification failed: ${response.status} ${response.statusText}`
          );
          return;
        }

        if (
          response.headers.get("content-type")?.includes("application/json")
        ) {
          const data = await response.json();
          console.log("Response data:", data);

          if (data.success) {
            setVerified(true);
            setAmount(data.amount || 0);
          } else {
            setErrorMessage(data.message || "Payment verification failed");
          }
        } else {
          const text = await response.text();
          console.error("Non-JSON response:", text);
          setErrorMessage("Invalid response from server");
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        setErrorMessage(
          "An error occurred while verifying your payment: " +
            (error instanceof Error ? error.message : "Unknown error")
        );
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  useEffect(() => {
    if (verified) {
      const redirectTimer = setTimeout(() => {
        router.push("/en/dashboard");
      }, 5000);

      return () => clearTimeout(redirectTimer);
    }
  }, [verified, router]);

  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            {verifying ? (
              <Loader2 className="h-6 w-6 mr-2 animate-spin" />
            ) : verified ? (
              <CheckCircle2 className="h-6 w-6 mr-2 text-green-500" />
            ) : (
              <AlertCircle className="h-6 w-6 mr-2 text-amber-500" />
            )}
            {verifying
              ? "Verifying Payment"
              : verified
              ? "Payment Successful"
              : "Payment Verification"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {verifying ? (
            <div className="text-center py-6">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <p>Verifying your payment with PayPal...</p>
              <p className="text-sm text-muted-foreground mt-2">
                Please wait, this won't take long.
              </p>
            </div>
          ) : verified ? (
            <div className="py-2">
              <div className="bg-green-50 text-green-800 rounded-md p-4 mb-4">
                <p className="font-medium">Your deposit was successful!</p>
                <p className="mt-2">
                  Your account has been credited with ${amount?.toFixed(2)}. You
                  will be redirected to your balance page shortly.
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Thank you for your deposit. You can now use these funds for
                operations.
              </p>
            </div>
          ) : (
            <div className="py-2">
              <div className="bg-amber-50 text-amber-800 rounded-md p-4 mb-4">
                <p className="font-medium">Payment verification issue</p>
                <p className="mt-2">
                  {errorMessage || "We couldn’t verify your payment."}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                If you believe this is an error, please contact support with
                your PayPal transaction ID.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <LanguageLink href="/en/dashboard">
            <Button variant="outline">
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </LanguageLink>
        </CardFooter>
      </Card>
    </div>
  );
}
