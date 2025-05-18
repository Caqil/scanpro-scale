"use strict";
exports.__esModule = true;
// app/layout.tsx
var google_1 = require("next/font/google");
require("./globals.css");
var theme_provider_1 = require("@/components/theme-provider");
var auth_context_1 = require("@/src/context/auth-context");
var sonner_1 = require("sonner");
var inter = google_1.Inter({ subsets: ["latin"] });
function RootLayout(_a) {
    var children = _a.children;
    return (React.createElement("html", { lang: "en", suppressHydrationWarning: true },
        React.createElement("body", { className: inter.className },
            React.createElement(theme_provider_1.ThemeProvider, { attribute: "class", defaultTheme: "system", enableSystem: true },
                React.createElement(auth_context_1.AuthProvider, null,
                    children,
                    React.createElement(sonner_1.Toaster, { position: "top-right" }))))));
}
exports["default"] = RootLayout;
