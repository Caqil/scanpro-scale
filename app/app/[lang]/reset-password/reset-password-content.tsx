"use client";

import { useAuth } from "@/src/context/auth-context";
import { useRouter } from "next/navigation";
import { LanguageLink } from "@/components/language-link";
import { EnhancedResetPasswordForm } from "@/components/auth/reset-password-form";

interface ResetPasswordContentProps {
  token?: string;
}

export default function ResetPasswordContent({
  token,
}: ResetPasswordContentProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

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
              Reset your password
            </h2>
            <p className="text-muted-foreground text-center mt-2">
              Enter a new password for your account
            </p>
          </div>

          <EnhancedResetPasswordForm token={token} />

          <p className="text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <LanguageLink
              href="/login"
              className="text-primary font-medium hover:underline"
            >
              Back to login
            </LanguageLink>
          </p>
        </div>

        <div className="md:hidden text-center mt-10 text-sm text-muted-foreground">
          © 2025 MegaPDF. All rights reserved.
        </div>
      </div>
    </div>
  );
}
