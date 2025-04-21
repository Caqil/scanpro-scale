// app/app/[lang]/dashboard/subscription/success/page.tsx
import { Metadata } from "next";
import { SUPPORTED_LANGUAGES } from "@/src/lib/i18n/config";
import { generatePageSeoMetadata } from "@/lib/seo/schemas";
import { SubscriptionSuccessContent } from "../subscription-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: paramLang } = await params;
  const lang = SUPPORTED_LANGUAGES.includes(paramLang as any)
    ? paramLang
    : "en";

  return generatePageSeoMetadata(lang as any, {
    translationPrefix: "subscription.success",
    canonicalPath: "dashboard/subscription/success",
  });
}

export default function SubscriptionSuccessPage() {
  return (
    <div className="container py-12">
      <SubscriptionSuccessContent />
    </div>
  );
}
