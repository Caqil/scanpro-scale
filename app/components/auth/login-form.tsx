"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { useLanguageStore } from "@/src/store/store";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { LanguageLink } from "@/components/language-link";
import { useAuth } from "@/src/context/auth-context";

interface LoginFormProps {
  callbackUrl?: string;
}

export function LoginForm({ callbackUrl = "/en/dashboard" }: LoginFormProps) {
  const { t } = useLanguageStore();
  const router = useRouter();
  const { login } = useAuth();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Validate email format
  const validateEmail = (email: string): boolean => {
    if (!email) {
      setEmailError(t("auth.emailRequired") || "Email is required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);

    if (!isValid) {
      setEmailError(
        t("auth.invalidEmail") || "Please enter a valid email address"
      );
    } else {
      setEmailError(null);
    }

    return isValid;
  };

  // Validate form
  const validateForm = (): boolean => {
    let isValid = true;

    // Validate email
    if (!validateEmail(email)) {
      isValid = false;
    }

    // Validate password
    if (!password) {
      setPasswordError(t("auth.passwordRequired") || "Password is required");
      isValid = false;
    } else {
      setPasswordError(null);
    }

    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await login(email, password);

      if (!result.success) {
        throw new Error(result.error || "Login failed");
      }

      toast.success(t("auth.loginSuccess") || "Signed in successfully");

      // Add a small delay to ensure the cookie is set
      setTimeout(() => {
        // Redirect to the callback URL
        router.push(callbackUrl);
      }, 300);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = (provider: string) => {
    // Sanitize provider to prevent XSS
    const sanitizedProvider = encodeURIComponent(provider);
    const apiUrl = process.env.NEXT_PUBLIC_GO_API_URL || "";

    // Validate URL
    if (!apiUrl.match(/^https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)) {
      setError("Invalid OAuth configuration");
      return;
    }

    window.location.href = `${apiUrl}/api/auth/${sanitizedProvider}`;
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert
          variant="destructive"
          className="mb-4 animate-in fade-in-50 slide-in-from-top-5 duration-300"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          variant="outline"
          onClick={() => handleOAuthSignIn("google")}
          className="flex-1 relative overflow-hidden group h-11 transition-all"
          disabled={loading}
        >
          <FaGoogle className="w-4 h-4 mr-2" />
          <span>{t("auth.googleSignIn") || "Google"}</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-2 text-xs text-muted-foreground uppercase tracking-wider">
            {t("auth.orContinueWith") || "or continue with email"}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            {t("auth.email") || "Email"}
            {emailError && (
              <span className="text-destructive ml-1 text-xs">
                ({emailError})
              </span>
            )}
          </Label>
          <Input
            id="email"
            type="email"
            placeholder={t("auth.emailPlaceholder") || "name@example.com"}
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={
              emailError
                ? "border-destructive focus-visible:ring-destructive"
                : ""
            }
            disabled={loading}
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium">
              {t("auth.password") || "Password"}
              {passwordError && (
                <span className="text-destructive ml-1 text-xs">
                  ({passwordError})
                </span>
              )}
            </Label>
            <LanguageLink
              href={`/forgot-password`}
              className="text-xs text-primary hover:underline"
            >
              {t("auth.forgotPassword") || "Forgot password?"}
            </LanguageLink>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder={t("auth.passwordPlaceholder") || "Your password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={
                passwordError
                  ? "border-destructive focus-visible:ring-destructive pr-10"
                  : "pr-10"
              }
              disabled={loading}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="sr-only">
                {showPassword
                  ? t("auth.hidePassword") || "Hide password"
                  : t("auth.showPassword") || "Show password"}
              </span>
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember-me"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
          />
          <label
            htmlFor="remember-me"
            className="text-sm text-muted-foreground cursor-pointer"
          >
            {t("auth.rememberMe") || "Remember me"}
          </label>
        </div>

        <Button type="submit" className="w-full h-11" disabled={loading}>
          {loading ? (
            <>
              <span className="h-4 w-4 mr-2 rounded-full border-2 border-current border-t-transparent animate-spin" />
              {t("auth.signingIn") || "Signing in..."}
            </>
          ) : (
            t("auth.signIn") || "Sign In"
          )}
        </Button>

        <div className="text-center text-sm">
          {t("auth.dontHaveAccount") || "Don't have an account?"}{" "}
          <LanguageLink
            href={`/register`}
            className="text-primary font-medium hover:underline"
          >
            {t("auth.signUp") || "Sign up"}
          </LanguageLink>
        </div>
      </form>
    </div>
  );
}
