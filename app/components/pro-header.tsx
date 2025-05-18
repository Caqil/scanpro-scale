"use client";
import { useState, useEffect } from "react";
import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type React from "react";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  HamburgerMenuIcon,
  Cross1Icon,
  ChevronDownIcon,
  MobileIcon,
  ChatBubbleIcon,
} from "@radix-ui/react-icons";
import {
  FileText,
  Image,
  Table,
  ArrowRight,
  ArrowDown,
  Shield,
  Lock,
  Download,
  Apple,
  FileBoxIcon,
  FileCheck2,
  PenTool,
  ScanFace,
  ScanEyeIcon,
} from "lucide-react";
import { useLanguageStore } from "@/src/store/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { LanguageLink } from "./language-link";
import { LanguageSwitcher } from "./language-switcher";
import { LogoutButton } from "./auth/logout-button";
import { LineShadowText } from "@/src/components/magicui/line-shadow-text";
import { useTheme } from "next-themes";
import { useAuth } from "@/src/context/auth-context";

type ToolDefinition = {
  name: string;
  href: string;
  icon: React.ReactNode;
  description: string;
};

type CategoryDefinition = {
  category: string;
  description: string;
  tools: ToolDefinition[];
};

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

interface ProHeaderProps {
  urlLanguage: string;
}

export function ProHeader({ urlLanguage }: ProHeaderProps) {
  const theme = useTheme();
  const { language, setLanguage, t } = useLanguageStore();
  const { isAuthenticated, user, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showAppBanner, setShowAppBanner] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const shadowColor = theme.resolvedTheme === "dark" ? "white" : "black";

  useEffect(() => {
    setIsClient(true);
    if (urlLanguage && urlLanguage !== language) {
      useLanguageStore.setState({ language: urlLanguage as any });
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [urlLanguage, language]);

  const userMenu = isLoading ? (
    <Button variant="ghost" size="sm" disabled>
      Loading...
    </Button>
  ) : isAuthenticated && user ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">
            {user.name ? user.name[0].toUpperCase() : "A"}
          </div>
          <span className="hidden sm:inline">{user.name || "Account"}</span>
          <ChevronDownIcon className="h-4 w-4 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem asChild>
          <LanguageLink href="/dashboard">Dashboard</LanguageLink>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <div className="mt-auto border-t p-4">
            <LogoutButton />
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <LanguageLink href="/login" passHref>
      <Button variant="default" size="sm">
        Sign in
      </Button>
    </LanguageLink>
  );

  const languages: LanguageOption[] = [
    { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
    {
      code: "id",
      name: "Indonesian",
      nativeName: "Bahasa Indonesia",
      flag: "🇮🇩",
    },
    { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
    { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
    { code: "zh", name: "Chinese", nativeName: "中文 (Zhōngwén)", flag: "🇨🇳" },
    {
      code: "ar",
      name: "Arabic",
      nativeName: "العربية (al-ʿArabiyyah)",
      flag: "🇸🇦",
    },
    { code: "hi", name: "Hindi", nativeName: "हिन्दी (Hindī)", flag: "🇮🇳" },
    {
      code: "ru",
      name: "Russian",
      nativeName: "Русский (Russkiy)",
      flag: "🇷🇺",
    },
    { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇧🇷" },
    { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
    {
      code: "ja",
      name: "Japanese",
      nativeName: "日本語 (Nihongo)",
      flag: "🇯🇵",
    },
    { code: "ko", name: "Korean", nativeName: "한국어 (Hangugeo)", flag: "🇰🇷" },
    { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
    { code: "tr", name: "Turkish", nativeName: "Türkçe", flag: "🇹🇷" },
  ];

  const PDF_TOOLS: CategoryDefinition[] = [
    {
      category: isClient
        ? t("pdfTools.categories.convertFromPdf")
        : "Convert PDF",
      description:
        t("pdfTools.categories.convertFromPdfDesc") ||
        "Convert PDF files to various formats and vice versa",
      tools: [
        {
          name: t("popular.pdfToWord"),
          href: "/convert/pdf-to-docx",
          icon: <FileText className="h-5 w-5 text-blue-500" />,
          description: t("popular.pdfToWordDesc"),
        },
        {
          name: t("popular.pdfToExcel"),
          href: "/convert/pdf-to-xlsx",
          icon: <Table className="h-5 w-5 text-green-500" />,
          description: t("popular.pdfToExcelDesc"),
        },
        {
          name: t("popular.pdfToJpg"),
          href: "/convert/pdf-to-jpg",
          icon: <Image className="h-5 w-5 text-yellow-500" />,
          description: t("popular.pdfToJpgDesc"),
        },
        {
          name: t("popular.wordToPdf"),
          href: "/convert/docx-to-pdf",
          icon: <FileText className="h-5 w-5 text-blue-500" />,
          description: t("popular.wordToPdfDesc"),
        },
        {
          name: t("popular.jpgToPdf"),
          href: "/convert/jpg-to-pdf",
          icon: <Image className="h-5 w-5 text-yellow-500" />,
          description: t("popular.jpgToPdfDesc"),
        },
      ],
    },
    {
      category: t("pdfTools.categories.organizePdf") || "PDF Management",
      description:
        t("pdfTools.categories.organizePdfDesc") ||
        "Tools to organize and modify PDF files",
      tools: [
        {
          name: t("popular.mergePdf"),
          href: "/merge-pdf",
          icon: <ArrowRight className="h-5 w-5 text-red-500" />,
          description: t("popular.mergePdfDesc"),
        },
        {
          name: t("popular.splitPdf"),
          href: "/split-pdf",
          icon: <ArrowDown className="h-5 w-5 text-green-500" />,
          description: t("popular.splitPdfDesc"),
        },
        {
          name: t("popular.compressPdf"),
          href: "/compress-pdf",
          icon: <Download className="h-5 w-5 text-purple-500" />,
          description: t("popular.compressPdfDesc"),
        },
      ],
    },
    {
      category: t("pdfTools.categories.pdfSecurity") || "PDF Security",
      description: "Protect and manage PDF access",
      tools: [
        {
          name: t("popular.unlockPdf"),
          href: "/unlock-pdf",
          icon: <Lock className="h-5 w-5 text-blue-500" />,
          description: t("popular.unlockPdfDesc"),
        },
        {
          name: t("popular.protectPdf"),
          href: "/protect-pdf",
          icon: <Shield className="h-5 w-5 text-blue-500" />,
          description: t("popular.protectPdfDesc"),
        },
        {
          name: t("popular.signPdf"),
          href: "/sign-pdf",
          icon: <PenTool className="h-5 w-5 text-green-500" />,
          description: t("popular.signPdfDesc"),
        },
        {
          name: t("popular.ocr"),
          href: "/ocr",
          icon: <FileCheck2 className="h-5 w-5 text-blue-500" />,
          description: t("popular.ocrDesc"),
        },
      ],
    },
  ];

  const navItems = [
    {
      label: t("nav.convertPdf"),
      dropdown: PDF_TOOLS.filter(
        (cat) =>
          cat.category ===
          (isClient ? t("pdfTools.categories.convertFromPdf") : "Convert PDF")
      ),
    },
    {
      label: t("pdfTools.categories.organizePdf"),
      dropdown: PDF_TOOLS.filter(
        (cat) =>
          cat.category ===
          (isClient ? t("pdfTools.categories.organizePdf") : "PDF Management")
      ),
    },
    {
      label: t("pdfTools.categories.pdfSecurity"),
      dropdown: PDF_TOOLS.filter(
        (cat) =>
          cat.category ===
          (isClient ? t("pdfTools.categories.pdfSecurity") : "PDF Security")
      ),
    },
  ];

  return (
    <>
      {/* Main Header */}
      <header
        className={`sticky top-0 z-50 bg-gradient-to-r from-background/95 to-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${
          scrolled ? "shadow-sm" : "border-b"
        } transition-all duration-200`}
      >
        <div className="container max-w-6xl mx-auto flex h-16 items-center justify-between py-4 px-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <LanguageLink href="/" className="flex items-center gap-2">
              <span className="font-bold text-xl flex items-center gap-1">
                <span className="text-balance text-3xl font-semibold leading-none tracking-tighter sm:text-4xl md:text-4xl lg:text-2xl">
                  <LineShadowText className="italic" shadowColor={shadowColor}>
                    MegaPDF
                  </LineShadowText>
                </span>
              </span>
            </LanguageLink>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {/* Direct link to Image Tools */}
            <LanguageLink
              href="/pricing"
              className="text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              {isClient ? t("nav.pricing") || "Pricing" : "Pricing"}
            </LanguageLink>
            {/* PDF Tool Dropdowns */}
            {navItems.slice(1).map((item) => (
              <div key={item.label} className="relative group">
                {item.dropdown && (
                  <>
                    <LanguageLink
                      href="#"
                      className="text-sm font-medium text-foreground transition-colors hover:text-primary flex items-center gap-1"
                    >
                      {item.label}
                      <ChevronDownIcon className="h-4 w-4 opacity-70" />
                    </LanguageLink>

                    {/* Dropdown Menu */}
                    <div className="absolute top-full left-0 mt-2 w-[600px] bg-background border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-4">
                      {item.dropdown.map((category) => (
                        <div key={category.category} className="mb-4">
                          <div className="font-semibold text-sm text-foreground mb-2">
                            {category.category}
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            {category.tools.map((tool) => (
                              <LanguageLink
                                key={tool.name}
                                href={tool.href}
                                className="flex items-start gap-3 p-2 hover:bg-muted rounded-md transition-colors"
                              >
                                <div className="p-1 rounded-md bg-primary/10">
                                  {tool.icon}
                                </div>
                                <div>
                                  <div className="text-sm font-medium">
                                    {tool.name}
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {tool.description}
                                  </p>
                                </div>
                              </LanguageLink>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
            <LanguageLink
              href="/pdf-tools"
              className="text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              {isClient
                ? t("popular.viewAll") || "View All PDF Tools"
                : "View All PDF Tools"}
            </LanguageLink>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ModeToggle />
            {userMenu}
            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <Cross1Icon className="h-5 w-5" />
              ) : (
                <HamburgerMenuIcon className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-background/95 backdrop-blur border-t max-h-[calc(100vh-4rem)] overflow-y-auto shadow-md">
            <div className="container max-w-6xl mx-auto py-4 space-y-4">
              {/* Direct link to Image Tools */}
              <LanguageLink
                href="/pricing"
                className="block px-3 py-3 text-lg font-medium hover:bg-primary/5 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {isClient ? t("nav.pricing") || "Pricing" : "Pricing"}
              </LanguageLink>
              {navItems.slice(1).map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="block px-3 py-3 text-lg font-medium hover:bg-primary/5 rounded-md transition-colors">
                    {item.label}
                  </div>
                  {item.dropdown && (
                    <div className="pl-4 space-y-2">
                      {item.dropdown.map((category) => (
                        <div key={category.category}>
                          <div className="text-sm font-medium text-primary mb-2">
                            {category.category}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {category.tools.map((tool) => (
                              <LanguageLink
                                key={tool.name}
                                href={tool.href}
                                className="flex items-start gap-3 p-2 hover:bg-muted rounded-md transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                <div className="p-1 rounded-md bg-primary/10">
                                  {tool.icon}
                                </div>
                                <div>
                                  <div className="text-sm font-medium">
                                    {tool.name}
                                  </div>
                                </div>
                              </LanguageLink>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
