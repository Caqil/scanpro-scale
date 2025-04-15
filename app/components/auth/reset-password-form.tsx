"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Check, Eye, EyeOff, Info, LockKeyhole, ShieldCheck } from "lucide-react";
import { useLanguageStore } from "@/src/store/store";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface EnhancedResetPasswordFormProps {
  token?: string;
}

export function EnhancedResetPasswordForm({ token }: EnhancedResetPasswordFormProps) {
  const { t } = useLanguageStore();
  const router = useRouter();
  
  // Form state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // UI state
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [tokenValidating, setTokenValidating] = useState(true);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  
  // Calculate password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }
    
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 25;
    
    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 25;
    
    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 25;
    
    // Contains numbers or special characters
    if (/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 25;
    
    setPasswordStrength(strength);
  }, [password]);
  
  // Get strength text and color
  const getStrengthData = () => {
    if (passwordStrength <= 25) return { text: t('auth.passwordWeak') || "Weak", color: "bg-red-500" };
    if (passwordStrength <= 50) return { text: t('auth.passwordFair') || "Fair", color: "bg-orange-500" };
    if (passwordStrength <= 75) return { text: t('auth.passwordGood') || "Good", color: "bg-yellow-500" };
    return { text: t('auth.passwordStrong') || "Strong", color: "bg-green-500" };
  };
  // Validate token
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        console.log('No token provided');
        setTokenValid(false);
        setTokenValidating(false);
        return;
      }
      
      try {
        console.log('Validating token:', token);
        
        // First try using GET query param approach
        let res = await fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`)
          .catch(error => {
            console.log('GET validation failed:', error);
            return null;
          });
            
        // If that fails, try the POST endpoint
        if (!res || !res.ok) {
          console.log('Falling back to POST validation');
          res = await fetch('/api/auth/validate-reset-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
          }).catch(error => {
            console.log('POST validation failed:', error);
            return null;
          });
        }
        
        // Last resort
        if (!res || !res.ok) {
          console.log('All validation attempts failed, trying one more fallback');
          res = await fetch('/api/reset-password/validate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
          }).catch(() => null);
        }
        
        if (!res || !res.ok) {
          console.log('All validation methods failed');
          throw new Error('Token validation failed');
        }
        
        const data = await res.json();
        console.log('Validation response:', data);
        setTokenValid(data.valid);
      } catch (error) {
        console.error('Error validating token:', error);
        setTokenValid(false);
      } finally {
        setTokenValidating(false);
      }
    };
    
    validateToken();
  }, [token]);
  
  // Validate form fields
  const validateForm = (): boolean => {
    let isValid = true;
    
    // Validate password
    if (!password) {
      setPasswordError(t('auth.passwordRequired') || "Password is required");
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError(t('auth.passwordLength') || "Password must be at least 8 characters");
      isValid = false;
    } else {
      setPasswordError(null);
    }
    
    // Validate confirm password
    if (password !== confirmPassword) {
      setConfirmPasswordError(t('auth.passwordsDoNotMatch') || "Passwords do not match");
      isValid = false;
    } else {
      setConfirmPasswordError(null);
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
      // Call the reset password API
      const res = await fetch('/api/auth/reset-password/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          token,
          password
        })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t('auth.resetPasswordError') || "Failed to reset password");
      }
      
      // Show success message
      setSuccess(true);
      toast.success(t('auth.passwordResetSuccess') || "Password reset successfully");
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push(`/en/login`);
      }, 1500);
    } catch (error) {
      setError(error instanceof Error ? error.message : t('auth.unknownError') || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  // Show loading state while validating token
  if (tokenValidating) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        <p className="text-muted-foreground">{t('auth.validatingToken') || "Validating your reset link..."}</p>
      </div>
    );
  }
  
  // Show error if token is invalid
  if (!tokenValid) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive" className="animate-in fade-in-50 slide-in-from-top-5 duration-300">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t('auth.invalidToken') || "This password reset link is invalid or has expired. Please request a new one."}
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-center">
          <Button 
            variant="default" 
            onClick={() => router.push(`/en/forgot-password`)}
          >
            {t('auth.requestNewLink') || "Request a new reset link"}
          </Button>
        </div>
      </div>
    );
  }
  
  // Show success message
  if (success) {
    return (
      <div className="space-y-6 text-center animate-in fade-in-50 duration-300">
        <div className="flex flex-col items-center gap-3">
          <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
            <Check className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-semibold">{t('auth.passwordResetSuccess') || "Password reset successful"}</h2>
        </div>
        
        <div className="bg-muted/30 p-6 rounded-lg border text-left">
          <p className="mb-4">
            {t('auth.passwordResetSuccessMessage') || "Your password has been reset successfully. You will be redirected to the login page shortly."}
          </p>
          
          <p className="text-sm text-muted-foreground">
            {t('auth.passwordResetSuccessSubtext') || "If you're not redirected automatically, click the button below."}
          </p>
        </div>
        
        <Button 
          variant="default" 
          onClick={() => router.push(`/en/login`)}
          className="mt-4"
        >
          {t('auth.backToLogin') || "Back to login"}
        </Button>
      </div>
    );
  }
  
  const strengthData = getStrengthData();
  
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
          <ShieldCheck className="h-8 w-8" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            New Password
            {passwordError && (
              <span className="text-destructive ml-1 text-xs">
                ({passwordError})
              </span>
            )}
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className={passwordError ? "border-destructive focus-visible:ring-destructive pr-10" : "pr-10"}
              placeholder="Enter new password"
              autoComplete="new-password"
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
          
          {password && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2">
                <Progress value={passwordStrength} className={`h-1.5 flex-1 ${strengthData.color}`} />
                <span className="text-xs font-medium">{strengthData.text}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                <span className={`px-2 py-0.5 rounded-full text-xs ${password.length >= 8 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}>
                  8+ Characters
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${/[A-Z]/.test(password) ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}>
                  Uppercase
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${/[a-z]/.test(password) ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}>
                  Lowercase
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}>
                  Number/Symbol
                </span>
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirm-password" className="text-sm font-medium">
            Confirm New Password
            {confirmPasswordError && (
              <span className="text-destructive ml-1 text-xs">
                ({confirmPasswordError})
              </span>
            )}
          </Label>
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            className={confirmPasswordError ? "border-destructive focus-visible:ring-destructive" : ""}
            placeholder="Confirm new password"
            autoComplete="new-password"
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full mt-4" 
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="h-4 w-4 mr-2 rounded-full border-2 border-current border-t-transparent animate-spin" />
              {t('auth.resettingPassword') || "Resetting password..."}
            </>
          ) : (
            t('auth.resetPassword') || "Reset Password"
          )}
        </Button>
      </form>
    </div>
  );
}