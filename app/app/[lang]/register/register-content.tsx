// app/[lang]/register/register-content.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";
import { useAuth } from "@/src/context/auth-context";

export default function RegisterContent() {
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
      <div className="flex flex-col w-full md:w-1/2 p-6 sm:p-10 justify-center items-center">
        <div className="md:hidden flex items-center gap-2 mb-10">
          <span className="font-bold text-2xl">MegaPDF</span>
        </div>

        <div className="w-full max-w-md space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-center">
              Create an Account
            </h2>
            <p className="text-muted-foreground text-center mt-2">
              Sign up to access our powerful PDF tools and services
            </p>
          </div>

          <RegisterForm />
        </div>

        <div className="md:hidden text-center mt-10 text-sm text-muted-foreground">
          © 2025 MegaPDF. All rights reserved.
        </div>
      </div>
    </div>
  );
}
