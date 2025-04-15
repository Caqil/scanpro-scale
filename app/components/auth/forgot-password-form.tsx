"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, CheckCircle, Mail } from "lucide-react";
import { useLanguageStore } from "@/src/store/store";
import { toast } from "sonner";
import { LanguageLink } from "@/components/language-link";

interface EnhancedForgotPasswordFormProps {
  lang?: string;
}

export function EnhancedForgotPasswordForm() {
  const { t } = useLanguageStore();
  const router = useRouter();
  
  // Form state
  const [email, setEmail] = useState("");
  
  // UI state
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  
  // Validate email format
  const validateEmail = (email: string): boolean => {
    if (!email) {
      setEmailError(t('auth.emailRequired') || "Email is required");
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    
    if (!isValid) {
      setEmailError(t('auth.invalidEmail') || "Please enter a valid email address");
    } else {
      setEmailError(null);
    }
    
    return isValid;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate email
    if (!validateEmail(email)) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Call the password reset API
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t('auth.resetPasswordError') || "Failed to send reset email");
      }
      
      // Show success message
      setEmailSent(true);
      toast.success(t('auth.resetEmailSent') || "Password reset email sent");
    } catch (error) {
      // We don't show the exact error for security reasons
      // Just tell the user that if the email exists, they'll receive instructions
      setEmailSent(true);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle going back to login
  const handleBackToLogin = () => {
    router.push(`en/login`);
  };
  
  if (emailSent) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
            <Mail className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-semibold">{t('auth.checkYourEmail') || "Check your email"}</h2>
        </div>
        
        <div className="bg-muted/30 p-6 rounded-lg border text-left">
          <p className="mb-4">
            {t('auth.resetInstructions') || "If an account exists with that email, we've sent instructions to reset your password."}
          </p>
          
          <p className="mb-4 text-sm">
            The email should arrive within 5 minutes. Be sure to check your spam folder if you don't see it.
          </p>
          
          <div className="text-sm text-muted-foreground">
            <p>
              <strong>Email sent to:</strong> {email}
            </p>
          </div>
        </div>
        
        <div className="space-y-4 pt-4">
          <p className="text-sm text-muted-foreground">
            {t('auth.didntReceiveEmail') || "Didn't receive an email?"} {" "}
            <button 
              type="button" 
              onClick={() => {
                setEmailSent(false);
                setEmail("");
              }}
              className="text-primary font-medium hover:underline"
            >
              {t('auth.tryAgain') || "Try again"}
            </button>
          </p>
          
          <Button
            type="button"
            variant="outline"
            onClick={handleBackToLogin}
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('auth.backToLogin') || "Back to login"}
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive" className="animate-in fade-in-50 slide-in-from-top-5 duration-300">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="mb-4 flex justify-center">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Mail className="h-8 w-8" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email address
            {emailError && (
              <span className="text-destructive ml-1 text-xs">
                ({emailError})
              </span>
            )}
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={emailError ? "border-destructive focus-visible:ring-destructive" : ""}
            disabled={loading}
            required
            autoComplete="email"
          />
          <p className="text-xs text-muted-foreground">
            We'll send a password reset link to this email address
          </p>
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="h-4 w-4 mr-2 rounded-full border-2 border-current border-t-transparent animate-spin" />
              {t('auth.sending') || "Sending..."}
            </>
          ) : (
            t('auth.sendResetLink') || "Send Reset Link"
          )}
        </Button>
      </form>
      
      <div className="text-center pt-2">
        <LanguageLink 
          href={`/en/login`}
          className="text-sm text-primary hover:underline inline-flex items-center font-medium"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t('auth.backToLogin') || "Back to login"}
        </LanguageLink>
      </div>
    </div>
  );
}