"use client";
"use strict";
exports.__esModule = true;
exports.ProHeader = void 0;
var react_1 = require("react");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var mode_toggle_1 = require("@/components/mode-toggle");
var button_1 = require("@/components/ui/button");
var react_icons_1 = require("@radix-ui/react-icons");
var lucide_react_1 = require("lucide-react");
var store_1 = require("@/src/store/store");
var dropdown_menu_2 = require("@/components/ui/dropdown-menu");
var language_link_1 = require("./language-link");
var language_switcher_1 = require("./language-switcher");
var site_logo_1 = require("./site-logo");
var react_2 = require("next-auth/react");
var logout_button_1 = require("./auth/logout-button");
function ProHeader(_a) {
    var _b, _c;
    var urlLanguage = _a.urlLanguage;
    var _d = store_1.useLanguageStore(), language = _d.language, setLanguage = _d.setLanguage, t = _d.t;
    var _e = react_1.useState(false), mobileMenuOpen = _e[0], setMobileMenuOpen = _e[1];
    var _f = react_1.useState(false), scrolled = _f[0], setScrolled = _f[1];
    var _g = react_1.useState(true), showAppBanner = _g[0], setShowAppBanner = _g[1];
    var _h = react_1.useState(false), isClient = _h[0], setIsClient = _h[1];
    var session = react_2.useSession().data;
    react_1.useEffect(function () {
        setIsClient(true);
        if (urlLanguage && urlLanguage !== language) {
            store_1.useLanguageStore.setState({ language: urlLanguage });
        }
        var handleScroll = function () {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return function () { return window.removeEventListener("scroll", handleScroll); };
    }, [urlLanguage, language]);
    var userMenu = session ? (React.createElement(dropdown_menu_2.DropdownMenu, null,
        React.createElement(dropdown_menu_1.DropdownMenuTrigger, { asChild: true },
            React.createElement(button_1.Button, { variant: "ghost", size: "sm", className: "gap-2" },
                React.createElement("div", { className: "w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium" }, ((_b = session.user) === null || _b === void 0 ? void 0 : _b.name) ? session.user.name[0].toUpperCase() : "A"),
                React.createElement("span", { className: "hidden sm:inline" }, ((_c = session.user) === null || _c === void 0 ? void 0 : _c.name) || "Account"),
                React.createElement(react_icons_1.ChevronDownIcon, { className: "h-4 w-4 opacity-70" }))),
        React.createElement(dropdown_menu_2.DropdownMenuContent, { align: "end", className: "w-56" },
            React.createElement(dropdown_menu_2.DropdownMenuItem, { asChild: true },
                React.createElement(language_link_1.LanguageLink, { href: "/dashboard" }, "Dashboard")),
            React.createElement(dropdown_menu_2.DropdownMenuSeparator, null),
            React.createElement(dropdown_menu_2.DropdownMenuItem, { asChild: true },
                React.createElement("div", { className: "mt-auto border-t p-4" },
                    React.createElement(logout_button_1.LogoutButton, null)))))) : (React.createElement(language_link_1.LanguageLink, { href: "/login", legacyBehavior: true, passHref: true },
        React.createElement(button_1.Button, { variant: "default", size: "sm" }, "Sign in")));
    var languages = [
        { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
        {
            code: "id",
            name: "Indonesian",
            nativeName: "Bahasa Indonesia",
            flag: "🇮🇩"
        },
        { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
        { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
        { code: "zh", name: "Chinese", nativeName: "中文 (Zhōngwén)", flag: "🇨🇳" },
        {
            code: "ar",
            name: "Arabic",
            nativeName: "العربية (al-ʿArabiyyah)",
            flag: "🇸🇦"
        },
        { code: "hi", name: "Hindi", nativeName: "हिन्दी (Hindī)", flag: "🇮🇳" },
        {
            code: "ru",
            name: "Russian",
            nativeName: "Русский (Russkiy)",
            flag: "🇷🇺"
        },
        { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇧🇷" },
        { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
        {
            code: "ja",
            name: "Japanese",
            nativeName: "日本語 (Nihongo)",
            flag: "🇯🇵"
        },
        { code: "ko", name: "Korean", nativeName: "한국어 (Hangugeo)", flag: "🇰🇷" },
        { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
        { code: "tr", name: "Turkish", nativeName: "Türkçe", flag: "🇹🇷" },
    ];
    var PDF_TOOLS = [
        {
            category: isClient
                ? t("pdfTools.categories.convertFromPdf")
                : "Convert PDF",
            description: t("pdfTools.categories.convertFromPdfDesc") ||
                "Convert PDF files to various formats and vice versa",
            tools: [
                {
                    name: t("popular.pdfToWord"),
                    href: "/convert/pdf-to-docx",
                    icon: React.createElement(lucide_react_1.FileText, { className: "h-5 w-5 text-blue-500" }),
                    description: t("popular.pdfToWordDesc")
                },
                {
                    name: t("popular.pdfToExcel"),
                    href: "/convert/pdf-to-xlsx",
                    icon: React.createElement(lucide_react_1.Table, { className: "h-5 w-5 text-green-500" }),
                    description: t("popular.pdfToExcelDesc")
                },
                {
                    name: t("popular.pdfToJpg"),
                    href: "/convert/pdf-to-jpg",
                    icon: React.createElement(lucide_react_1.Image, { className: "h-5 w-5 text-yellow-500" }),
                    description: t("popular.pdfToJpgDesc")
                },
                {
                    name: t("popular.wordToPdf"),
                    href: "/convert/docx-to-pdf",
                    icon: React.createElement(lucide_react_1.FileText, { className: "h-5 w-5 text-blue-500" }),
                    description: t("popular.wordToPdfDesc")
                },
                {
                    name: t("popular.jpgToPdf"),
                    href: "/convert/jpg-to-pdf",
                    icon: React.createElement(lucide_react_1.Image, { className: "h-5 w-5 text-yellow-500" }),
                    description: t("popular.jpgToPdfDesc")
                },
            ]
        },
        {
            category: t("pdfTools.categories.organizePdf") || "PDF Management",
            description: t("pdfTools.categories.organizePdfDesc") ||
                "Tools to organize and modify PDF files",
            tools: [
                {
                    name: t("popular.mergePdf"),
                    href: "/merge-pdf",
                    icon: React.createElement(lucide_react_1.ArrowRight, { className: "h-5 w-5 text-red-500" }),
                    description: t("popular.mergePdfDesc")
                },
                {
                    name: t("popular.splitPdf"),
                    href: "/split-pdf",
                    icon: React.createElement(lucide_react_1.ArrowDown, { className: "h-5 w-5 text-green-500" }),
                    description: t("popular.splitPdfDesc")
                },
                {
                    name: t("popular.compressPdf"),
                    href: "/compress-pdf",
                    icon: React.createElement(lucide_react_1.Download, { className: "h-5 w-5 text-purple-500" }),
                    description: t("popular.compressPdfDesc")
                },
                {
                    name: t("universalCompressor.title"),
                    href: "/compress-files",
                    icon: React.createElement(lucide_react_1.FileBoxIcon, { className: "h-5 w-5 text-purple-500" }),
                    description: t("universalCompressor.description")
                },
            ]
        },
        {
            category: t("pdfTools.categories.pdfSecurity") || "PDF Security",
            description: "Protect and manage PDF access",
            tools: [
                {
                    name: t("popular.unlockPdf"),
                    href: "/unlock-pdf",
                    icon: React.createElement(lucide_react_1.Lock, { className: "h-5 w-5 text-blue-500" }),
                    description: t("popular.unlockPdfDesc")
                },
                {
                    name: t("popular.protectPdf"),
                    href: "/protect-pdf",
                    icon: React.createElement(lucide_react_1.Shield, { className: "h-5 w-5 text-blue-500" }),
                    description: t("popular.protectPdfDesc")
                },
                {
                    name: t("popular.signPdf"),
                    href: "/sign-pdf",
                    icon: React.createElement(lucide_react_1.PenTool, { className: "h-5 w-5 text-green-500" }),
                    description: t("popular.signPdfDesc")
                },
                {
                    name: t("popular.ocr"),
                    href: "/ocr",
                    icon: React.createElement(lucide_react_1.FileCheck2, { className: "h-5 w-5 text-blue-500" }),
                    description: t("popular.ocrDesc")
                },
                {
                    name: t("ocrPdf.title"),
                    href: "/ask-pdf",
                    icon: React.createElement(lucide_react_1.ScanEyeIcon, { className: "h-5 w-5 text-blue-500" }),
                    description: t("pdfChat.description")
                },
            ]
        },
        {
            category: "AI PDF",
            description: "AI PDF",
            tools: [
                {
                    name: t("pdfChat.title"),
                    href: "/ask-pdf",
                    icon: React.createElement(react_icons_1.ChatBubbleIcon, { className: "h-5 w-5 text-blue-500" }),
                    description: t("pdfChat.description")
                },
            ]
        },
    ];
    var navItems = [
        {
            label: t("nav.convertPdf"),
            dropdown: PDF_TOOLS.filter(function (cat) {
                return cat.category ===
                    (isClient ? t("pdfTools.categories.convertFromPdf") : "Convert PDF");
            })
        },
        {
            label: t("pdfTools.categories.organizePdf"),
            dropdown: PDF_TOOLS.filter(function (cat) {
                return cat.category ===
                    (isClient ? t("pdfTools.categories.organizePdf") : "PDF Management");
            })
        },
        {
            label: t("pdfTools.categories.pdfSecurity"),
            dropdown: PDF_TOOLS.filter(function (cat) {
                return cat.category ===
                    (isClient ? t("pdfTools.categories.pdfSecurity") : "PDF Security");
            })
        },
        {
            label: "AI PDF",
            dropdown: PDF_TOOLS.filter(function (cat) { return cat.category === (isClient ? "AI PDF" : "AI PDF"); })
        },
    ];
    return (React.createElement(React.Fragment, null,
        showAppBanner && (React.createElement("div", { className: "bg-gradient-to-r from-primary/90 to-primary/70 text-primary-foreground" },
            React.createElement("div", { className: "container max-w-6xl mx-auto py-2 px-4 flex items-center justify-between" },
                React.createElement("div", { className: "flex items-center" },
                    React.createElement(react_icons_1.MobileIcon, { className: "h-4 w-4 mr-2 hidden sm:inline-block" }),
                    React.createElement("p", { className: "text-sm font-medium" }, isClient
                        ? t("nav.getApp") ||
                            "Get our mobile app for on-the-go PDF tools"
                        : "Get our mobile app for on-the-go PDF tools")),
                React.createElement("div", { className: "flex items-center gap-2" },
                    React.createElement("a", { href: "https://apps.apple.com/us/app/MegaPDF-pdf-scanner-app/id6743518395", target: "_blank", className: "text-xs font-medium bg-black text-white px-2 py-1 rounded-md flex items-center" },
                        React.createElement(lucide_react_1.Apple, { className: "h-3 w-3 mr-1" }),
                        " iOS"),
                    React.createElement("a", { href: "https://play.google.com/store/apps/details?id=com.MegaPDF.documentconverter", target: "_blank", className: "text-xs font-medium bg-primary-foreground text-primary px-2 py-1 rounded-md flex items-center" },
                        React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "mr-1" },
                            React.createElement("polygon", { points: "3 3 21 12 3 21 3 3" })),
                        "Android"),
                    React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-6 w-6 text-primary-foreground hover:bg-primary/20", onClick: function () { return setShowAppBanner(false); } },
                        React.createElement(react_icons_1.Cross1Icon, { className: "h-3 w-3" }),
                        React.createElement("span", { className: "sr-only" }, "Close banner")))))),
        React.createElement("header", { className: "sticky top-0 z-50 bg-gradient-to-r from-background/95 to-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60 " + (scrolled ? "shadow-sm" : "border-b") + " transition-all duration-200" },
            React.createElement("div", { className: "container max-w-6xl mx-auto flex h-16 items-center justify-between py-4 px-4" },
                React.createElement("div", { className: "flex items-center gap-2" },
                    React.createElement(language_link_1.LanguageLink, { href: "/", className: "flex items-center gap-2" },
                        React.createElement("span", { className: "font-bold text-xl flex items-center gap-1" },
                            React.createElement(site_logo_1.SiteLogo, { className: "h-8 w-8" }),
                            React.createElement("span", { className: "bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent" }, "MegaPDF")))),
                React.createElement("nav", { className: "hidden md:flex items-center gap-6" },
                    React.createElement(language_link_1.LanguageLink, { href: "/pricing", className: "text-sm font-medium text-foreground transition-colors hover:text-primary" }, isClient ? t("nav.pricing") || "Pricing" : "Pricing"),
                    navItems.slice(1).map(function (item) { return (React.createElement("div", { key: item.label, className: "relative group" }, item.dropdown && (React.createElement(React.Fragment, null,
                        React.createElement(language_link_1.LanguageLink, { href: "#", className: "text-sm font-medium text-foreground transition-colors hover:text-primary flex items-center gap-1" },
                            item.label,
                            React.createElement(react_icons_1.ChevronDownIcon, { className: "h-4 w-4 opacity-70" })),
                        React.createElement("div", { className: "absolute top-full left-0 mt-2 w-[600px] bg-background border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-4" }, item.dropdown.map(function (category) { return (React.createElement("div", { key: category.category, className: "mb-4" },
                            React.createElement("div", { className: "font-semibold text-sm text-foreground mb-2" }, category.category),
                            React.createElement("div", { className: "grid grid-cols-3 gap-4" }, category.tools.map(function (tool) { return (React.createElement(language_link_1.LanguageLink, { key: tool.name, href: tool.href, className: "flex items-start gap-3 p-2 hover:bg-muted rounded-md transition-colors" },
                                React.createElement("div", { className: "p-1 rounded-md bg-primary/10" }, tool.icon),
                                React.createElement("div", null,
                                    React.createElement("div", { className: "text-sm font-medium" }, tool.name),
                                    React.createElement("p", { className: "text-xs text-muted-foreground" }, tool.description)))); })))); })))))); }),
                    React.createElement(language_link_1.LanguageLink, { href: "/pdf-tools", className: "text-sm font-medium text-foreground transition-colors hover:text-primary" }, isClient
                        ? t("popular.viewAll") || "View All PDF Tools"
                        : "View All PDF Tools")),
                React.createElement("div", { className: "flex items-center gap-3" },
                    React.createElement(language_switcher_1.LanguageSwitcher, null),
                    React.createElement(mode_toggle_1.ModeToggle, null),
                    userMenu,
                    React.createElement(button_1.Button, { variant: "outline", size: "icon", className: "md:hidden", onClick: function () { return setMobileMenuOpen(!mobileMenuOpen); } },
                        mobileMenuOpen ? (React.createElement(react_icons_1.Cross1Icon, { className: "h-5 w-5" })) : (React.createElement(react_icons_1.HamburgerMenuIcon, { className: "h-5 w-5" })),
                        React.createElement("span", { className: "sr-only" }, "Toggle menu")))),
            mobileMenuOpen && (React.createElement("div", { className: "md:hidden absolute top-16 left-0 w-full bg-background/95 backdrop-blur border-t max-h-[calc(100vh-4rem)] overflow-y-auto shadow-md" },
                React.createElement("div", { className: "container max-w-6xl mx-auto py-4 space-y-4" },
                    React.createElement(language_link_1.LanguageLink, { href: "/pricing", className: "block px-3 py-3 text-lg font-medium hover:bg-primary/5 rounded-md transition-colors", onClick: function () { return setMobileMenuOpen(false); } }, isClient ? t("nav.pricing") || "Pricing" : "Pricing"),
                    navItems.slice(1).map(function (item) { return (React.createElement("div", { key: item.label, className: "space-y-2" },
                        React.createElement("div", { className: "block px-3 py-3 text-lg font-medium hover:bg-primary/5 rounded-md transition-colors" }, item.label),
                        item.dropdown && (React.createElement("div", { className: "pl-4 space-y-2" }, item.dropdown.map(function (category) { return (React.createElement("div", { key: category.category },
                            React.createElement("div", { className: "text-sm font-medium text-primary mb-2" }, category.category),
                            React.createElement("div", { className: "grid grid-cols-2 gap-2" }, category.tools.map(function (tool) { return (React.createElement(language_link_1.LanguageLink, { key: tool.name, href: tool.href, className: "flex items-start gap-3 p-2 hover:bg-muted rounded-md transition-colors", onClick: function () { return setMobileMenuOpen(false); } },
                                React.createElement("div", { className: "p-1 rounded-md bg-primary/10" }, tool.icon),
                                React.createElement("div", null,
                                    React.createElement("div", { className: "text-sm font-medium" }, tool.name)))); })))); }))))); })))))));
}
exports.ProHeader = ProHeader;
