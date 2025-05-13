import { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { SiteLogo } from "@/components/site-logo";
import { LanguageLink } from "@/components/language-link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Home, AlertCircle, Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Deposit Success | MegaPDF",
  description:
    "Confirmation of your successful deposit to your MegaPDF account.",
};

export default async function DepositSuccessPage() {
  const headersList = headers();
  const fullUrl = (await headersList).get("x-url") || "";

  console.log("Deposit success page - Full URL:", fullUrl);

  // First try to get token from URL path segments
  let token: string | undefined;
  const pathSegments = fullUrl.split("/");

  // If the last segment doesn't contain "?", it might be the token
  const lastSegment = pathSegments[pathSegments.length - 1];
  if (lastSegment && !lastSegment.includes("?")) {
    token = lastSegment;
    console.log("Extracted token from path:", token);
  }

  // If not found in path, check query parameters
  if (!token) {
    const urlParts = fullUrl.split("?");
    console.log("URL parts:", urlParts);

    const searchParams = new URLSearchParams(
      urlParts.length > 1 ? urlParts[1] : ""
    );
    const tokenParam = searchParams.get("token");
    console.log("Extracted token from query:", tokenParam);

    token = tokenParam || undefined;
  }

  console.log("Final token value:", token);

  let verifying = true;
  let verified = false;
  let amount: number | null = null;
  let errorMessage: string | null = null;

  if (token) {
    try {
      console.log("Verifying payment with token:", token);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/deposit/verify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: token }),
          credentials: "include",
        }
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        const text = await response.text();
        console.error("Verification failed:", response.status, text);
        errorMessage = `Verification failed: ${response.status} ${response.statusText}`;
      } else if (
        response.headers.get("content-type")?.includes("application/json")
      ) {
        const data = await response.json();
        console.log("Response data:", data);

        if (data.success) {
          verified = true;
          amount = data.amount || 0;
        } else {
          errorMessage = data.message || "Payment verification failed";
        }
      } else {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        errorMessage = "Invalid response from server";
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      errorMessage =
        "An error occurred while verifying your payment: " +
        (error instanceof Error ? error.message : "Unknown error");
    } finally {
      verifying = false;
    }
  } else {
    errorMessage = "No payment token provided";
    verifying = false;
  }

  // If verified, redirect after 5 seconds
  if (verified) {
    setTimeout(() => {
      redirect("/en/dashboard");
    }, 5000);
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center sm:flex-row">
      {/* Right side - Verification content */}
      <div className="flex flex-col w-full md:w-1/2 p-6 sm:p-10 justify-center items-center">
        <div className="md:hidden flex items-center gap-2 mb-10">
          <SiteLogo size={30} />
          <span className="font-bold text-2xl">MegaPDF</span>
        </div>

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
                <p>Verifying your payment...</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Please wait, this won't take long.
                </p>
              </div>
            ) : verified ? (
              <div className="py-2">
                <div className="bg-green-50 text-green-800 rounded-md p-4 mb-4">
                  <p className="font-medium">Your deposit was successful!</p>
                  <p className="mt-2">
                    Your account has been credited with ${amount?.toFixed(2)}.
                    You will be redirected to your dashboard shortly.
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
                    {errorMessage || "We couldn't verify your payment."}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  If you believe this is an error, please contact support with
                  your payment confirmation number.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <LanguageLink href="/en/dashboard">
              <Button variant={verified ? "outline" : "default"}>
                <Home className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Button>
            </LanguageLink>
          </CardFooter>
        </Card>

        <div className="md:hidden text-center mt-10 text-sm text-muted-foreground">
          © 2025 MegaPDF. All rights reserved.
        </div>
      </div>
    </div>
  );
}
