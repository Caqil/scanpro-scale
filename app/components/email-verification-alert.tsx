// components/email-verification-alert.tsx
"use client";

import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  AlertCircle,
  MailIcon,
  CheckCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";

interface EmailVerificationAlertProps {
  userEmail: string;
  userName?: string | null;
}

export function EmailVerificationAlert({
  userEmail,
  userName,
}: EmailVerificationAlertProps) {
  const [sending, setSending] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [devVerificationUrl, setDevVerificationUrl] = useState<string | null>(
    null
  );

  const handleResendVerification = async () => {
    setSending(true);
    setDevVerificationUrl(null);

    try {
      // Use the environment variable for the Go API URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      console.log(
        "Sending verification email request to:",
        `${apiUrl}/api/auth/verify-email`
      );

      const response = await fetch(`${apiUrl}/api/auth/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for authentication
      });

      // Check for non-JSON responses first (like "Method Not Allowed")
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Non-JSON response received:", await response.text());
        throw new Error(
          `Server returned ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();

      // Handle success - including development mode response
      if (response.ok && data.success) {
        // Check if this is a development mode response with a verification URL
        toast.success("Verification email sent successfully", {
          description: `Please check ${userEmail} to confirm your account.`,
        });
      } else {
        throw new Error(data.error || "Failed to send verification email");
      }
    } catch (error) {
      console.error("Error resending verification email:", error);
      toast.error("Could not send verification email", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setSending(false);
    }
  };

  if (hidden) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-5 w-5" />
      <div className="flex-1">
        <AlertTitle className="flex items-center text-amber-600 dark:text-amber-400">
          Verify your email address
        </AlertTitle>
        <AlertDescription className="mt-1">
          <p className="mb-2">
            Please verify your email address to unlock all features. We've sent
            a verification link to <strong>{userEmail}</strong>.
          </p>

          {devVerificationUrl && (
            <div className="bg-amber-50 dark:bg-amber-900/30 p-3 rounded-md mb-3 border border-amber-200 dark:border-amber-800">
              <p className="text-sm font-medium mb-1">
                Development Mode: SMTP not configured
              </p>
              <p className="text-xs mb-2">
                Click the link below to verify your email:
              </p>
              <a
                href={devVerificationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs flex items-center text-blue-600 dark:text-blue-400 hover:underline"
              >
                Verify Email <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center"
              onClick={handleResendVerification}
              disabled={sending}
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <MailIcon className="h-4 w-4 mr-2" />
                  Resend Verification Email
                </>
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setHidden(true)}>
              Dismiss
            </Button>
          </div>
        </AlertDescription>
      </div>
    </Alert>
  );
}

export function EmailVerifiedAlert() {
  const [hidden, setHidden] = useState(false);

  if (hidden) {
    return null;
  }

  return (
    <Alert
      variant="default"
      className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 mb-6"
    >
      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
      <div className="flex-1">
        <AlertTitle className="text-green-600 dark:text-green-400">
          Email verified
        </AlertTitle>
        <AlertDescription className="text-green-600/80 dark:text-green-400/80">
          <p className="mb-2">
            Your email has been successfully verified. Thank you!
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setHidden(true)}
            className="text-green-600 dark:text-green-400"
          >
            Dismiss
          </Button>
        </AlertDescription>
      </div>
    </Alert>
  );
}
