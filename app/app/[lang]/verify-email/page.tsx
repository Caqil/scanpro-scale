// app/[lang]/verify-email/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { LanguageLink } from "@/components/language-link";
import { useLanguageStore } from "@/src/store/store";
import { Suspense } from "react";

function VerifyEmailContent() {
  const { t } = useLanguageStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");
  
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("");
  
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus("error");
        setMessage("No verification token provided");
        return;
      }
      
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();
        
        if (response.ok && data.success) {
          setStatus("success");
          setMessage(data.message || "Your email has been successfully verified!");
          
          // Redirect to dashboard after a few seconds
          setTimeout(() => {
            router.push("/en/dashboard");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(data.error || "Failed to verify your email. The link may be invalid or expired.");
        }
      } catch (error) {
        console.error("Error verifying email:", error);
        setStatus("error");
        setMessage("An unexpected error occurred. Please try again later.");
      }
    };
    
    verifyToken();
  }, [token, router]);
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        {status === "verifying" && (
          <>
            <div className="mx-auto mb-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
            <CardTitle>Verifying Your Email</CardTitle>
            <CardDescription>
              Please wait while we confirm your email address...
            </CardDescription>
          </>
        )}
        
        {status === "success" && (
          <>
            <div className="mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle>Email Verified!</CardTitle>
            <CardDescription>
              Your email has been successfully verified
            </CardDescription>
          </>
        )}
        
        {status === "error" && (
          <>
            <div className="mx-auto mb-4">
              <XCircle className="h-12 w-12 text-red-500" />
            </div>
            <CardTitle>Verification Failed</CardTitle>
            <CardDescription>
              We couldn't verify your email address
            </CardDescription>
          </>
        )}
      </CardHeader>
      
      <CardContent>
        <p className="text-center">{message}</p>
      </CardContent>
      
      <CardFooter className="flex justify-center">
        {status === "verifying" ? (
          <Button disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying...
          </Button>
        ) : (
          <LanguageLink href="/dashboard">
            <Button>{status === "success" ? "Go to Dashboard" : "Back to Dashboard"}</Button>
          </LanguageLink>
        )}
      </CardFooter>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="container max-w-md py-12">
      <Suspense fallback={
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Verifying Email</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      }>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}