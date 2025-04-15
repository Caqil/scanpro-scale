import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { SiteLogo } from "@/components/site-logo";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { LanguageLink } from "@/components/language-link";
import { EnhancedResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password | ScanPro",
  description: "Reset your password and regain access to your ScanPro account.",
};

export default async function ResetPasswordPage() {
  // Check if user is already logged in
  const session = await getServerSession(authOptions);
  
  if (session?.user) {
    redirect("/en/dashboard");
  }

  const headersList = headers();
  const fullUrl = (await headersList).get("x-url") || "";
  
  console.log('Reset password page - Full URL:', fullUrl);
  
  // First try to get token from URL path segments (if format is /reset-password/<token>)
  let token: string | undefined;
  const pathSegments = fullUrl.split('/');
  
  // If the last segment doesn't contain "?", it might be the token
  const lastSegment = pathSegments[pathSegments.length - 1];
  if (lastSegment && !lastSegment.includes('?')) {
    token = lastSegment;
    console.log('Extracted token from path:', token);
  }
  
  // If not found in path, check query parameters
  if (!token) {
    // Extract token from URL using query parameters
    const urlParts = fullUrl.split("?");
    console.log('URL parts:', urlParts);
    
    const searchParams = new URLSearchParams(urlParts.length > 1 ? urlParts[1] : "");
    const tokenParam = searchParams.get("token");
    console.log('Extracted token from query:', tokenParam);
    
    token = tokenParam || undefined;
  }
  
  console.log('Final token value:', token);
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
            <h2 className="text-2xl font-bold text-center">Reset your password</h2>
            <p className="text-muted-foreground text-center mt-2">
              Enter a new password for your account
            </p>
          </div>
          
          <EnhancedResetPasswordForm token={token} />
          
          <p className="text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <LanguageLink href="/login" className="text-primary font-medium hover:underline">
              Back to login
            </LanguageLink>
          </p>
        </div>
        
        <div className="md:hidden text-center mt-10 text-sm text-muted-foreground">
          © 2025 ScanPro. All rights reserved.
        </div>
      </div>
    </div>
  );
}