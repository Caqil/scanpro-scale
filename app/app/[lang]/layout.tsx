// app/[lang]/layout.tsx
import type React from "react"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { Footer } from "@/components/footer"
import { ProHeader } from "@/components/pro-header"
import { notFound } from "next/navigation"
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import "../globals.css"
import { Analytics } from '@/lib/analytics'

// Import language configuration
import { SUPPORTED_LANGUAGES, getTranslation } from "@/src/lib/i18n/config";
import { AuthProvider } from "./providers"
import { CookieConsentBanner } from "@/components/cookie-banner-component"

// Font configuration - optimize with display: swap
export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap", // This improves performance by allowing text to display in fallback font while loading
});

// For static generation of all language variants
export function generateStaticParams() {
  return SUPPORTED_LANGUAGES.map((lang) => ({ lang }))
}

// Generate metadata based on language parameter
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  // Await the params object before accessing its properties
  const { lang } = await params

  // Validate language parameter
  if (!SUPPORTED_LANGUAGES.includes(lang)) {
    notFound()
  }

  // Create a translation function similar to t()
  const t = (key: string) => getTranslation(lang, key)

  return {
    title: {
      default: t("metadata.title"),
      template: t("metadata.template"),
    },
    description: t("metadata.description"),
    keywords:t("metadata.keywords"),
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://scanpro.cc"),
    alternates: {
      canonical: `/${lang}`,
      languages: Object.fromEntries(
        SUPPORTED_LANGUAGES.map(code => [
          code,
          `/${code}`
        ])
      ),
    },
  }
}

export default async function Layout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ lang: string }>
}>) {
  // Await the params object before accessing its properties
  const { lang } = await params

  // Validate language parameter
  if (!SUPPORTED_LANGUAGES.includes(lang)) {
    notFound()
  }
  const isRTL = lang === 'ar';
  
  return (
    <html lang={lang} dir={isRTL ? "rtl" : "ltr"} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className="relative flex min-h-screen flex-col">
              <ProHeader urlLanguage={lang} />
              <div className="flex-1 mx-auto w-full max-w-screen-xl px-4 sm:px-6 lg:px-8">
                {children}
              </div>
              <Footer />
            </div>
            <Toaster />
            <CookieConsentBanner />
          </ThemeProvider>
        </AuthProvider>
        {/* Place Analytics component at the end of body for better performance */}
        <Analytics />
      </body>
    </html>
  )
}