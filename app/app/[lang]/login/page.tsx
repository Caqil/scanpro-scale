// app/[lang]/login/page.tsx
import { Suspense } from "react";
import { SiteLogo } from "@/components/site-logo";
import Link from "next/link";
import { LoginFormWithParams } from "@/components/auth/login-form-with-params";
import { Metadata } from "next";
import { LanguageLink } from "@/components/language-link";

export const metadata: Metadata = {
  title: "Login | ScanPro",
  description: "Sign in to your ScanPro account to access your dashboard.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center sm:flex-row">
      {/* Left side - Branding and info (for medium and larger screens) */}
      <div className="flex flex-col w-full md:w-1/2 p-6 sm:p-10 justify-center items-center">
        <div className="md:hidden flex items-center gap-2 mb-10">
          <SiteLogo size={30} />
          <span className="font-bold text-2xl">ScanPro</span>
        </div>
        
        <div className="w-full max-w-md space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-center">Sign in to your account</h2>
            <p className="text-muted-foreground text-center mt-2">
              Enter your credentials to access your dashboard
            </p>
          </div>
          
          <Suspense fallback={<div>Loading login form...</div>}>
            <LoginFormWithParams />
          </Suspense>
          
          <p className="text-center text-sm text-muted-foreground">
            By signing in, you agree to our{" "}
            <LanguageLink  href="/terms" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </LanguageLink >{" "}
            and{" "}
            <LanguageLink  href="/privacy" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </LanguageLink >
            .
          </p>
        </div>
        
        <div className="md:hidden text-center mt-10 text-sm text-muted-foreground">
          © 2025 ScanPro. All rights reserved.
        </div>
      </div>
    </div>
  );
}