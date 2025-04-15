"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LoginForm } from "./login-form";

// Component that uses useSearchParams (must be wrapped in Suspense)
function LoginFormWithParamsClient() {
  const searchParams = useSearchParams();
  const callbackUrlParam = searchParams.get("callbackUrl");
  
  // Validate the callbackUrl to ensure it's a relative path
  const callbackUrl = callbackUrlParam && callbackUrlParam.startsWith("/en/")
    ? callbackUrlParam
    : "/en/dashboard";
  
  console.log("LoginFormWithParamsClient - callbackUrl:", callbackUrl);
  
  return <LoginForm callbackUrl={callbackUrl} />;
}

// Wrapper component with Suspense
export function LoginFormWithParams() {
  return (
    <Suspense fallback={<div>Loading login form...</div>}>
      <LoginFormWithParamsClient />
    </Suspense>
  );
}