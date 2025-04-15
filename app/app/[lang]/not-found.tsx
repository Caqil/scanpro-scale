// app/[lang]/not-found.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLanguageStore } from "@/src/store/store";
import { LanguageLink } from "@/components/language-link";

export default function NotFoundPage() {
  const { t } = useLanguageStore();

  return (
    <div className="container max-w-5xl py-12 mx-auto">
      <div className="flex flex-col items-center justify-center text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-9xl font-bold">404</h1>
          <h2 className="text-3xl font-bold">
            {t('error.notFound') || "Page Not Found"}
          </h2>
        </div>
        
        <p className="text-muted-foreground max-w-md">
          {t('error.notFoundDesc') || "The page you're looking for doesn't exist or has been moved."}
        </p>
        
        <div className="flex gap-4 pt-4">
          
          
          <LanguageLink href="/">
            <Button>
              {t('error.goHome') || "Return to Home"}
            </Button>
          </LanguageLink>
        </div>
      </div>
    </div>
  );
}