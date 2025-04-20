// app/app/[lang]/dashboard/subscription/cancel/page.tsx
import { Metadata } from "next";
import { SUPPORTED_LANGUAGES } from '@/src/lib/i18n/config';
import { generatePageSeoMetadata } from "@/lib/seo/schemas";
import { SubscriptionCancelContent } from "../subscription-content";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: paramLang } = await params;
  const lang = SUPPORTED_LANGUAGES.includes(paramLang as any) ? paramLang : "en";

  return generatePageSeoMetadata(lang as any, { 
    translationPrefix: 'subscription.cancel', 
    canonicalPath: 'dashboard/subscription/cancel' 
  });
}

export default function SubscriptionCancelPage() {
  return (
    <div className="container py-12">
      <SubscriptionCancelContent />
    </div>
  );
}