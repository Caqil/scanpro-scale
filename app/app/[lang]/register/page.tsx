import { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LanguageLink } from "@/components/language-link";

export const metadata: Metadata = {
  title: "Register | MegaPDF",
  description: "Join the MegaPDF community to access powerful PDF tools and developer API.",
};

export default async function RegisterPage() {
  // Check if user is already logged in
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect("/en/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center sm:flex-row">
      {/* Left side - Branding and info (for medium and larger screens) */}
      <div className="flex flex-col w-full md:w-1/2 p-6 sm:p-10 justify-center items-center">
        <div className="md:hidden flex items-center gap-2 mb-10">
          <span className="font-bold text-2xl">MegaPDF</span>
        </div>

        {/* Form Section */}
        <div className="w-full max-w-md space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-center">Create your account</h2>
            <p className="text-muted-foreground text-center mt-2">
              Join MegaPDF to manage your documents
            </p>
          </div>

          <div className="p-8 rounded-lg shadow-sm">
            <RegisterForm />
            
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-10 text-sm text-muted-foreground">
          By joining, you agree to our{" "}
          <LanguageLink href="/terms" className="underline underline-offset-4 hover:text-primary">
            Terms of Service
          </LanguageLink>{" "}
          and{" "}
          <LanguageLink href="/privacy" className="underline underline-offset-4 hover:text-primary">
            Privacy Policy
          </LanguageLink>
          .<br />
          © 2025 MegaPDF. All rights reserved.
        </div>
      </div>
    </div>
  );
}