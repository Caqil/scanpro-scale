"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Check, Eye, EyeOff, Info, Mail } from "lucide-react";
import { useLanguageStore } from "@/src/store/store";
import { toast } from "sonner";
import { LanguageLink } from "../language-link";
import { Separator } from "../ui/separator";
import { useAuth } from "@/src/context/auth-context";

interface StrengthData {
  text: string;
  color: string;
}

export function RegisterForm() {
  const { t } = useLanguageStore();
  const router = useRouter();
  const { register } = useAuth();

  // Form state
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] =
    useState<boolean>(false);

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
    if (/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
      strength += 25;

    setPasswordStrength(strength);
  }, [password]);

  // Get strength text and color
  const getStrengthData = (): StrengthData => {
    if (passwordStrength <= 25)
      return { text: t("auth.passwordWeak") || "Weak", color: "bg-red-500" };
    if (passwordStrength <= 50)
      return { text: t("auth.passwordFair") || "Fair", color: "bg-orange-500" };
    if (passwordStrength <= 75)
      return { text: t("auth.passwordGood") || "Good", color: "bg-yellow-500" };
    return {
      text: t("auth.passwordStrong") || "Strong",
      color: "bg-green-500",
    };
  };

  // Validate email format
  const validateEmail = (email: string): boolean => {
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

  // Validate form fields
  const validateForm = (): boolean => {
    let isValid = true;

    // Validate name
    if (!name.trim()) {
      setNameError(t("auth.nameRequired") || "Name is required");
      isValid = false;
    } else {
      setNameError(null);
    }

    // Validate email
    if (!email.trim()) {
      setEmailError(t("auth.emailRequired") || "Email is required");
      isValid = false;
    } else if (!validateEmail(email)) {
      isValid = false;
    }

    // Validate password
    if (!password) {
      setPasswordError(t("auth.passwordRequired") || "Password is required");
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError(
        t("auth.passwordLength") || "Password must be at least 8 characters"
      );
      isValid = false;
    } else {
      setPasswordError(null);
    }

    // Validate confirm password
    if (password !== confirmPassword) {
      setConfirmPasswordError(
        t("auth.passwordsDoNotMatch") || "Passwords do not match"
      );
      isValid = false;
    } else {
      setConfirmPasswordError(null);
    }

    // Validate terms
    if (!agreedToTerms) {
      setError(
        t("auth.agreeToTerms") || "Please agree to the terms of service"
      );
      isValid = false;
    } else {
      setError(null);
    }

    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Use the auth context to register
      const result = await register(name, email, password);

      if (!result.success) {
        throw new Error(result.error || "Registration failed");
      }

      // Show success message
      setRegistrationSuccess(true);

      toast.success(
        t("auth.accountCreated") || "Account created successfully",
        {
          description:
            t("auth.verificationEmailSent") ||
            "Please check your email to verify your account.",
        }
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : t("auth.unknownError") || "An error occurred"
      );
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

  const strengthData = getStrengthData();

  // Show registration success message
  if (registrationSuccess) {
    return (
      <div className="space-y-6">
        <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-700 dark:text-green-300">
            {t("auth.accountCreated") || "Account created successfully!"}
          </AlertDescription>
        </Alert>

        <div className="bg-muted/20 p-6 rounded-lg border">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-medium text-lg">
                {t("auth.verifyYourEmail") || "Verify Your Email"}
              </h3>
              <p className="text-muted-foreground">
                {t("auth.checkYourInbox") ||
                  "Check your inbox to complete registration"}
              </p>
            </div>
          </div>

          <p className="mb-4">
            {t("auth.verificationEmailSentTo") ||
              "We've sent a verification email to"}{" "}
            <strong>{email}</strong>.
            {t("auth.pleaseClickLink") ||
              " Please click the link in the email to verify your account."}
          </p>

          <p className="text-sm text-muted-foreground mb-4">
            {t("auth.didntReceiveEmail") || "Didn't receive the email?"}{" "}
            {t("auth.checkSpamFolder") || "Check your spam folder or"}{" "}
            <button
              onClick={() => setRegistrationSuccess(false)}
              className="text-primary underline underline-offset-4 font-medium hover:text-primary/90"
            >
              {t("auth.tryAgain") || "try again"}
            </button>
            .
          </p>

          <div className="flex justify-between items-center border-t pt-4 mt-2">
            <p className="text-sm text-muted-foreground">
              {t("auth.alreadyVerified") || "Already verified?"}
            </p>
            <LanguageLink href="/login">
              <Button>{t("auth.signIn") || "Sign In"}</Button>
            </LanguageLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert
          variant="destructive"
          className="animate-in fade-in-50 slide-in-from-top-5 duration-300"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row gap-4"></div>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-2 text-xs text-muted-foreground uppercase tracking-wider">
            or register with email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Full Name
            {nameError && (
              <span className="text-destructive ml-1 text-xs">
                ({nameError})
              </span>
            )}
          </Label>
          <Input
            id="name"
            placeholder="Your name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            className={
              nameError
                ? "border-destructive focus-visible:ring-destructive"
                : ""
            }
          />
        </div>

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
            onChange={(e) => {
              setEmail(e.target.value);
              if (e.target.value) validateEmail(e.target.value);
            }}
            disabled={loading}
            className={
              emailError
                ? "border-destructive focus-visible:ring-destructive"
                : ""
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
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
              className={
                passwordError
                  ? "border-destructive focus-visible:ring-destructive pr-10"
                  : "pr-10"
              }
              placeholder="Create a password"
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
                <Progress
                  value={passwordStrength}
                  className={`h-1.5 flex-1 ${strengthData.color}`}
                />
                <span className="text-xs font-medium">{strengthData.text}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs ${
                    password.length >= 8
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  8+ Characters
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs ${
                    /[A-Z]/.test(password)
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  Uppercase
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs ${
                    /[a-z]/.test(password)
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  Lowercase
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs ${
                    /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  Number/Symbol
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password" className="text-sm font-medium">
            Confirm Password
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
            className={
              confirmPasswordError
                ? "border-destructive focus-visible:ring-destructive"
                : ""
            }
            placeholder="Confirm your password"
            autoComplete="new-password"
          />
        </div>

        <div className="flex items-start space-x-2 pt-2">
          <Checkbox
            id="terms"
            checked={agreedToTerms}
            onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
            className="mt-1"
          />
          <label
            htmlFor="terms"
            className="text-sm text-muted-foreground cursor-pointer"
          >
            {t("auth.agreeTerms") || "I agree to the"}{" "}
            <a
              href="/terms"
              className="text-primary underline hover:text-primary/90"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("auth.termsOfService") || "terms of service"}
            </a>{" "}
            {t("auth.and") || "and"}{" "}
            <a
              href="/privacy"
              className="text-primary underline hover:text-primary/90"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("auth.privacyPolicy") || "privacy policy"}
            </a>
          </label>
        </div>

        <div className="pt-2">
          <Alert
            variant="default"
            className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
          >
            <Info className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-700 dark:text-blue-300 text-sm">
              {t("auth.emailVerificationRequired") ||
                "Email verification is required to complete your registration. We'll send you a verification link when you sign up."}
            </AlertDescription>
          </Alert>
        </div>

        <Button type="submit" className="w-full mt-2" disabled={loading}>
          {loading ? (
            <>
              <span className="h-4 w-4 mr-2 rounded-full border-2 border-current border-t-transparent animate-spin" />
              {t("auth.creatingAccount") || "Creating account..."}
            </>
          ) : (
            t("auth.createAccount") || "Create Account"
          )}
        </Button>
      </form>

      <div className="text-center text-sm">
        {t("auth.alreadyHaveAccount") || "Already have an account?"}{" "}
        <LanguageLink
          href={`/login`}
          className="text-primary font-medium hover:underline"
        >
          {t("auth.signIn") || "Sign In"}
        </LanguageLink>
      </div>
    </div>
  );
}
