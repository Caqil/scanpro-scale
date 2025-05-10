import { Suspense } from "react";
import { Metadata } from "next";
import LoginContent from "./login-content";

export const metadata: Metadata = {
  title: "Login | MegaPDF",
  description: "Sign in to your MegaPDF account to access your dashboard.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}