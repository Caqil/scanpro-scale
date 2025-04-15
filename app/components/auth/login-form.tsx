"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { FaGoogle, FaGithub, FaApple } from "react-icons/fa";
import { useLanguageStore } from "@/src/store/store";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { LanguageLink } from "@/components/language-link";

interface LoginFormProps {
  callbackUrl?: string;
}

export function LoginForm({ callbackUrl = "/en/dashboard" }: LoginFormProps) {
  const { t } = useLanguageStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  
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
  
  // Handle auth errors from URL
  useEffect(() => {
    const errorParam = searchParams?.get("error");
    if (errorParam) {
      switch (errorParam) {
        case "OAuthAccountNotLinked":
          setError(
            "This email is already associated with a different login method. " +
            "Please sign in with the method you used originally."
          );
          break;
        case "CredentialsSignin":
          setError("Invalid email or password. Please try again.");
          break;
        case "AccessDenied":
          setError("Access denied. You do not have permission to access this resource.");
          break;
        default:
          setError(`An error occurred during sign in: ${errorParam}`);
      }
    }
  }, [searchParams]);
  
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
  
  // Validate form
  const validateForm = (): boolean => {
    let isValid = true;
    
    // Validate email
    if (!validateEmail(email)) {
      isValid = false;
    }
    
    // Validate password
    if (!password) {
      setPasswordError(t('auth.passwordRequired') || "Password is required");
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
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("Attempting sign in with callbackUrl:", callbackUrl);
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      
      console.log("Sign in result:", result);
      
      if (result?.error) {
        setError(t('auth.invalidCredentials') || "Invalid email or password");
        setLoading(false);
        return;
      }
      
      // Show success toast
      toast.success(t('auth.loginSuccess') || "Signed in successfully");
      
      // Fix: Use window.location.href to force a full page reload to the dashboard
      window.location.href = callbackUrl;
    } catch (error) {
      console.error("Login error:", error);
      setError(t('auth.loginError') || "An error occurred. Please try again.");
      setLoading(false);
    }
  };
  
  const handleOAuthSignIn = (provider: string) => {
    console.log("OAuth sign in with provider:", provider, "callbackUrl:", callbackUrl);
    // For Apple specifically, let's use form_post and minimize params to avoid PKCE issues
    if (provider === "apple") {
      signIn(provider, { 
        callbackUrl,
        redirect: true,
      });
    } else {
      signIn(provider, { callbackUrl });
    }
  };
  
  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive" className="mb-4 animate-in fade-in-50 slide-in-from-top-5 duration-300">
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
          <span>Google</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
        </Button>

        {/* <Button 
          variant="outline" 
          onClick={() => handleOAuthSignIn("apple")} 
          className="flex-1 relative overflow-hidden group h-11 transition-all"
          disabled={loading}
        >
          <FaApple className="w-4 h-4 mr-2" />
          <span>Apple</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
        </Button> */}
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-2 text-xs text-muted-foreground uppercase tracking-wider">
            or continue with email
          </span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
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
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={emailError ? "border-destructive focus-visible:ring-destructive" : ""}
            disabled={loading}
            required
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
              {passwordError && (
                <span className="text-destructive ml-1 text-xs">
                  ({passwordError})
                </span>
              )}
            </Label>
            <LanguageLink href={`/forgot-password`} className="text-xs text-primary hover:underline">
              {t('auth.forgotPassword') || "Forgot password?"}
            </LanguageLink>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={passwordError ? "border-destructive focus-visible:ring-destructive pr-10" : "pr-10"}
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
                {showPassword ? "Hide password" : "Show password"}
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
            {t('auth.rememberMe') || "Remember me"}
          </label>
        </div>
        
        <Button 
          type="submit" 
          className="w-full h-11"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="h-4 w-4 mr-2 rounded-full border-2 border-current border-t-transparent animate-spin" />
              {t('auth.signingIn') || "Signing in..."}
            </>
          ) : (
            t('auth.signIn') || "Sign In"
          )}
        </Button>
        
        <div className="text-center text-sm">
          {t('auth.dontHaveAccount') || "Don't have an account?"}{" "}
          <LanguageLink href={`/register`} className="text-primary font-medium hover:underline">
            {t('auth.signUp') || "Sign up"}
          </LanguageLink>
        </div>
      </form>
    </div>
  );
}