// app/[lang]/register/page.tsx
import { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SiteLogo } from "@/components/site-logo";
import { authOptions } from "@/lib/auth";
import { LanguageLink } from "@/components/language-link";

export const metadata: Metadata = {
  title: "Register | ScanPro",
  description: "Join the ScanPro community to access powerful PDF tools and developer API.",
};

export default async function RegisterPage() {
  // Check if user is already logged in
  const session = await getServerSession(authOptions);
  
  if (session?.user) {
    const callbackUrl = `/en/dashboard`;
    redirect(callbackUrl);
  }

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 p-6"
      style={{
        backgroundImage: 'url("/community-pattern.png")', // Subtle repeating pattern
        backgroundSize: 'contain',
        backgroundRepeat: 'repeat',
        backgroundBlendMode: 'overlay',
      }}
    >
      {/* Header */}
      <div className="flex flex-col items-center mb-12">
        <div className="flex items-center gap-3 mb-4">
          <SiteLogo size={40} />
          <span className="font-bold text-3xl">ScanPro</span>
        </div>
        <h1 className="text-4xl font-bold text-center">Join Our Document Community</h1>
        <p className="text-muted-foreground text-center mt-3 max-w-xl">
          Connect with professionals and enthusiasts to manage your documents like never before.
        </p>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-12">
        {/* Community Benefits */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Why Join ScanPro?</h2>
          <p className="text-muted-foreground">
            Be part of a vibrant community shaping the future of document management.
          </p>
          
          <div className="space-y-5">
            {[
              { title: "Master Your PDFs", desc: "Convert, edit, and secure with powerful tools" },
              { title: "Share & Learn", desc: "Exchange tips with fellow users" },
              { title: "Build with Us", desc: "Access our developer API for custom solutions" },
              { title: "Grow Together", desc: "Influence new features with your feedback" },
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center text-primary flex-shrink-0">
                  ✓
                </div>
                <div>
                  <p className="font-medium text-lg">{item.title}</p>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Register Form */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-center">Get Started</h2>
          <div className="bg-white/90 p-8 rounded-lg shadow-sm">
            <RegisterForm />
            <p className="text-center text-sm text-muted-foreground mt-4">
              Already part of us?{" "}
              <LanguageLink href="/login" className="underline underline-offset-4 text-primary hover:text-primary/80">
                Sign in
              </LanguageLink>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center space-y-3">
        <p className="text-sm text-muted-foreground">
          By joining, you agree to our{" "}
          <LanguageLink href="/terms" className="underline underline-offset-4 hover:text-primary">
            Terms of Service
          </LanguageLink>{" "}
          and{" "}
          <LanguageLink href="/privacy" className="underline underline-offset-4 hover:text-primary">
            Privacy Policy
          </LanguageLink>
        </p>
        <p className="text-sm text-muted-foreground">
          © 2025 ScanPro. Together, we make documents work.
        </p>
      </div>
    </div>
  );
}