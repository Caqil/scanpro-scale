// app/[lang]/forgot-password/forgot-password-content.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { EnhancedForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { useAuth } from "@/src/context/auth-context";

export default function ForgotPasswordContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if already authenticated
    if (!isLoading && isAuthenticated) {
      router.push(`/en/dashboard`);
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center sm:flex-row">
      {/* Left side - Branding and info (for medium and larger screens) */}
      <div className="flex flex-col w-full md:w-1/2 p-6 sm:p-10 justify-center items-center">
        <div className="md:hidden flex items-center gap-2 mb-10">
          <span className="font-bold text-2xl">MegaPDF</span>
        </div>

        <div className="w-full max-w-md space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-center">
              Forgot your password?
            </h2>
            <p className="text-muted-foreground text-center mt-2">
              Enter your email to receive password reset instructions
            </p>
          </div>

          <EnhancedForgotPasswordForm />

          <p className="text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <a
              href="/en/login"
              className="text-primary font-medium hover:underline"
            >
              Back to login
            </a>
          </p>
        </div>

        <div className="md:hidden text-center mt-10 text-sm text-muted-foreground">
          © 2025 MegaPDF. All rights reserved.
        </div>
      </div>
    </div>
  );
}
