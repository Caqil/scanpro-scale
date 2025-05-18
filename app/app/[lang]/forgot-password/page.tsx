// app/[lang]/forgot-password/page.tsx
import { Metadata } from "next";
import ForgotPasswordContent from "./forgot-password-content";

export const metadata: Metadata = {
  title: "Forgot Password | MegaPDF",
  description: "Reset your password to regain access to your MegaPDF account.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordContent />;
}
