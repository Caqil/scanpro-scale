"use client";
import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LanguageLink } from "@/components/language-link";
import { LoginFormWithParams } from "@/components/auth/login-form-with-params";
import { useLanguageStore } from "@/src/store/store";

export default function LoginContent() {
  const { t } = useLanguageStore();
  const router = useRouter();
  

  // If loading or authenticated, show a loading state
  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col justify-center items-center sm:flex-row">
      {/* Left side - Branding and info (for medium and larger screens) */}
      <div className="flex flex-col w-full md:w-1/2 p-6 sm:p-10 justify-center items-center">
        <div className="md:hidden flex items-center gap-2 mb-10">
          <span className="font-bold text-2xl">MegaPDF</span>
        </div>

        <div className="w-full max-w-md space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-center">
              {t("login.title")}
            </h2>
            <p className="text-muted-foreground text-center mt-2">
              {t("login.description")}
            </p>
          </div>

          <Suspense fallback={<div>{t("login.loading")}</div>}>
            <LoginFormWithParams />
          </Suspense>

          <p className="text-center text-sm text-muted-foreground">
            {t("login.agreement")}{" "}
            <LanguageLink
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              {t("login.terms")}
            </LanguageLink>{" "}
            {t("login.and")}{" "}
            <LanguageLink
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              {t("login.privacy")}
            </LanguageLink>
            .
          </p>
        </div>

        <div className="md:hidden text-center mt-10 text-sm text-muted-foreground">
          {t("login.copyright")}
        </div>
      </div>
    </div>
  );
}
