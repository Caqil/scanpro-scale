// app/[lang]/reset-password/reset-password-content.tsx
"use client";

import { useEffect, useState } from "react";
import { useLanguageStore } from "@/src/store/store";
import { EnhancedResetPasswordForm } from "@/components/auth/reset-password-form";
import { useSearchParams } from "next/navigation";

interface ResetPasswordContentProps {
  token?: string;
}

export default function ResetPasswordContent({
  token: propToken,
}: ResetPasswordContentProps) {
  const { t } = useLanguageStore();
  const [finalToken, setFinalToken] = useState<string | undefined>(propToken);

  // Get token from URL using client-side navigation
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get token from URL parameters on the client side
    const queryToken = searchParams?.get("token") || undefined;

    // Use prop token first, then fall back to URL token
    const tokenToUse = propToken || queryToken;

    console.log("[DEBUG] Reset password content - propToken:", propToken);
    console.log("[DEBUG] Reset password content - queryToken:", queryToken);
    console.log("[DEBUG] Reset password content - tokenToUse:", tokenToUse);

    setFinalToken(tokenToUse);
  }, [propToken, searchParams]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center sm:flex-row">
      <div className="flex flex-col w-full md:w-1/2 p-6 sm:p-10 justify-center items-center">
        <div className="md:hidden flex items-center gap-2 mb-10">
          <span className="font-bold text-2xl">MegaPDF</span>
        </div>

        <div className="w-full max-w-md space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-center">
              {t("auth.resetPassword") || "Reset Password"}
            </h2>
            <p className="text-muted-foreground text-center mt-2">
              {t("auth.enterNewPassword") ||
                "Enter a new password for your account"}
            </p>
          </div>

          <EnhancedResetPasswordForm token={finalToken} />
        </div>

        <div className="md:hidden text-center mt-10 text-sm text-muted-foreground">
          © {new Date().getFullYear()} MegaPDF. All rights reserved.
        </div>
      </div>
    </div>
  );
}
