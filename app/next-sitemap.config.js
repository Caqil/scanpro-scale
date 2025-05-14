// next-sitemap.config.js
/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://mega-pdf.com',
    generateRobotsTxt: true,
    robotsTxtOptions: {
        policies: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/dashboard',
                    '/login',
                    '/register',
                    '/admin',
                    '/reset-password',
                    '/verify-email',
                    '/account',
                ],
            },
        ],
        additionalSitemaps: [
            `${process.env.NEXT_PUBLIC_APP_URL || 'https://mega-pdf.com'}/conversion-sitemap.xml`,
        ],
    },
    generateIndexSitemap: true,
    outDir: 'public',
    // Exclude utility pages and authenticated pages that shouldn't be indexed
    exclude: [
        '/404',
        '/500',
        '/dashboard/**',
        '/login',
        '/register',
        '/admin/**',
        '/reset-password',
        '/verify-email',
        '/account/**',
    ],
    // Handle dynamically generated pages with additional language prefixes
    alternateRefs: [
        {
            href: 'https://mega-pdf.com/en',
            hreflang: 'en',
        },
        {
            href: 'https://mega-pdf.com/es',
            hreflang: 'es',
        },
        {
            href: 'https://mega-pdf.com/fr',
            hreflang: 'fr',
        },
        {
            href: 'https://mega-pdf.com/zh',
            hreflang: 'zh',
        },
        {
            href: 'https://mega-pdf.com/id',
            hreflang: 'id',
        },
        {
            href: 'https://mega-pdf.com/ar',
            hreflang: 'ar',
        },
        {
            href: 'https://mega-pdf.com/hi',
            hreflang: 'hi',
        },
        {
            href: 'https://mega-pdf.com/ru',
            hreflang: 'ru',
        },
        {
            href: 'https://mega-pdf.com/pt',
            hreflang: 'pt',
        },
        {
            href: 'https://mega-pdf.com/de',
            hreflang: 'de',
        },
        {
            href: 'https://mega-pdf.com/ja',
            hreflang: 'ja',
        },
        {
            href: 'https://mega-pdf.com/ko',
            hreflang: 'ko',
        },
        {
            href: 'https://mega-pdf.com/it',
            hreflang: 'it',
        },
        {
            href: 'https://mega-pdf.com/tr',
            hreflang: 'tr',
        },
    ],
    transform: async (config, path) => {
        // Update regex to include new language codes
        const langRegex = /^\/(en|id|es|fr|zh|ar|hi|ru|pt|de|ja|ko|it|tr)/;
        const isLangPrefixed = langRegex.test(path);

        // Create basic config
        const defaultConfig = {
            loc: path,
            changefreq: 'weekly',
            priority: 0.7,
            lastmod: new Date().toISOString(),
        };

        // Adjust priority based on the type of page
        if (
            path === '/' ||
            path === '/en' ||
            path === '/es' ||
            path === '/fr' ||
            path === '/zh' ||
            path === '/id' ||
            path === '/ar' ||
            path === '/hi' ||
            path === '/ru' ||
            path === '/pt' ||
            path === '/de' ||
            path === '/ja' ||
            path === '/ko' ||
            path === '/it' ||
            path === '/tr'
        ) {
            defaultConfig.priority = 1.0;
        } else if (path.includes('/pdf-tools')) {
            defaultConfig.priority = 0.9;
        } else if (path.includes('/convert/')) {
            defaultConfig.priority = 0.8;
            defaultConfig.changefreq = 'daily'; // More frequent updates for conversion pages
        } else if (path.includes('/merge-pdf') || path.includes('/compress') || path.includes('/ocr')) {
            defaultConfig.priority = 0.8;
        } else if (
            path.includes('/split-pdf') ||
            path.includes('/watermark-pdf') ||
            path.includes('/unlock-pdf') ||
            path.includes('/protect-pdf') ||
            path.includes('/sign-pdf') ||
            path.includes('/repair-pdf') ||
            path.includes('/page-numbers-pdf') ||
            path.includes('/remove-pdf-page') ||
            path.includes('/ask-pdf')
        ) {
            defaultConfig.priority = 0.8;
        }

        return defaultConfig;
    },
};