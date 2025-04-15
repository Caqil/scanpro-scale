// app/[lang]/page.tsx
"use client";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/file-uploader";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PdfToolCard } from "@/components/pdf-tool-card";
import { FeatureCard } from "@/components/feature-card";
import {
  FileIcon,
  FileTextIcon,
  ImageIcon,
  TableIcon,
  ArrowRightIcon,
  ArrowDownIcon,
  LightbulbIcon,
  FileCheck2,
  Shield,
  PenToolIcon,
} from "lucide-react";
import HeroAnimation from "@/components/hero-animation";
import { useLanguageStore } from "@/src/store/store";
import { LanguageLink } from "@/components/language-link";
import FeaturesContent from "./features-content";
import { TypingAnimation } from "@/src/components/magicui/typing-animation";

// Create a client component that uses useSearchParams
function ClientHomeContent() {
  const { t } = useLanguageStore();

  // Popular tools to showcase
  const popularTools = [
    {
      id: "pdf-to-word",
      name: t("popular.pdfToWord"),
      description: t("popular.pdfToWordDesc"),
      icon: <FileTextIcon className="h-6 w-6 text-blue-500" />,
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      href: "/convert/pdf-to-docx",
    },
    {
      id: "pdf-to-excel",
      name: t("popular.pdfToExcel"),
      description: t("popular.pdfToExcelDesc"),
      icon: <TableIcon className="h-6 w-6 text-green-500" />,
      iconBg: "bg-green-100 dark:bg-green-900/30",
      href: "/convert/pdf-to-xlsx",
    },
    {
      id: "merge-pdf",
      name: t("popular.mergePdf"),
      description: t("popular.mergePdfDesc"),
      icon: <ArrowRightIcon className="h-6 w-6 text-red-500" />,
      iconBg: "bg-red-100 dark:bg-red-900/30",
      href: "/merge-pdf",
    },
    {
      id: "compress-pdf",
      name: t("popular.compressPdf"),
      description: t("popular.compressPdfDesc"),
      icon: <ArrowDownIcon className="h-6 w-6 text-green-500" />,
      iconBg: "bg-green-100 dark:bg-green-900/30",
      href: "/compress-pdf",
    },
    {
      id: "protect",
      name: t("popular.protectPdf"),
      description: t("popular.protectPdfDesc"),
      icon: <Shield className="h-6 w-6 text-purple-500" />,
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      href: "/protect-pdf",
      isNew: true,
    },
    {
      id: "ocr",
      name: t("popular.ocr"),
      description: t("popular.ocrDesc"),
      href: "/ocr",
      icon: <FileCheck2 className="h-5 w-5 text-blue-500" />,
      iconBg: "bg-green-100 dark:bg-yellow-900/30",
      isNew: true,
    },
  ];

  return (
    <div>
      {/* Hero section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <Badge variant="outline" className="w-fit">
                  <LightbulbIcon className="mr-1 h-3 w-3" />
                  {t("hero.badge")}
                </Badge>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  {t('hero.title')}
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  {t("hero.description")}
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <LanguageLink href="/pdf-tools" className="inline-flex">
                  <Button size="lg" variant="outline">
                    {t("hero.btTools")}
                  </Button>
                </LanguageLink>
              </div>
            </div>
            <HeroAnimation />
          </div>
        </div>
      </section>

      {/* Popular Tools Section */}
      <section className="w-full py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              {t("converter.title")}
            </h2>
            <p className="max-w-[85%] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              {t("converter.description")}
            </p>
          </div>
          <div className="mx-auto grid max-w-6xl items-center gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
            {popularTools.map((tool) => (
              <PdfToolCard
                key={tool.id}
                id={tool.id}
                name={tool.name}
                description={tool.description}
                icon={tool.icon}
                iconBg={tool.iconBg}
                href={tool.href}
                isNew={tool.isNew}
              />
            ))}
          </div>
          <div className="flex justify-center">
            <LanguageLink href="/pdf-tools">
              <Button variant="outline" size="lg">
                {t("popular.viewAll")}
              </Button>
            </LanguageLink>
          </div>
        </div>
      </section>

      {/* Converter section */}
      <section
        id="converter"
        className="w-full py-12 md:py-24 lg:py-32 bg-muted/30"
      >
        <div className="container px-4 md:px-6">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              {t("converter.title")}
            </h2>
            <p className="max-w-[85%] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              {t("converter.description")}
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-1">
            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="upload" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload">
                      {t("converter.tabUpload")}
                    </TabsTrigger>
                    <TabsTrigger value="api">
                      {t("converter.tabApi")}
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload" className="mt-6">
                    <FileUploader />
                  </TabsContent>
                  <TabsContent value="api" className="mt-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">
                        {t("converter.apiTitle")}
                      </h3>
                      <p className="text-muted-foreground">
                        {t("converter.apiDesc")}
                      </p>
                      <div className="rounded-md bg-muted p-4">
                        <pre className="text-sm text-left overflow-auto">
                          <code>
                            {`curl -X POST \\
  -F "pdf=@document.pdf" \\
  -F "format=docx" \\
  https://scanpro.cc/api/convert`}
                          </code>
                        </pre>
                      </div>
                      <div className="flex justify-end">
                        <LanguageLink href="/api-docs">
                          <Button variant="outline">
                            {t("converter.apiDocs")}
                          </Button>
                        </LanguageLink>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <FeaturesContent />

      {/* CTA section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              {t("cta.title")}
            </h2>
            <p className="max-w-[85%] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              {t("cta.description")}
            </p>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <LanguageLink href="#converter">
                <Button size="lg">{t("cta.startConverting")}</Button>
              </LanguageLink>
              <LanguageLink href="/pdf-tools">
                <Button size="lg" variant="outline">
                  {t("cta.exploreTools")}
                </Button>
              </LanguageLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Main page component with Suspense boundary
export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientHomeContent />
    </Suspense>
  );
}
