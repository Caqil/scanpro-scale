// app/[lang]/register/page.tsx
import { Metadata } from "next";
import RegisterContent from "./register-content";

export const metadata: Metadata = {
  title: "Create Account | MegaPDF",
  description:
    "Sign up for MegaPDF to access our powerful PDF tools and services.",
};

export default function RegisterPage() {
  return <RegisterContent />;
}
