// next-sitemap.config.js
/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://scanpro.cc',
    generateRobotsTxt: true,
    robotsTxtOptions: {
        policies: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    // Add other paths you want to block from indexing
                ],
            },
        ],
    },
    generateIndexSitemap: true,
    outDir: 'public',
    // Exclude utility pages that shouldn't be indexed
    exclude: [
        '/404',
        '/500',
        // Add any other pages you want to exclude
    ],
    // Handle dynamically generated pages with language prefixes
    alternateRefs: [
        {
            href: 'https://scanpro.cc/en',
            hreflang: 'en',
        },
        {
            href: 'https://scanpro.cc/es',
            hreflang: 'es',
        },
        {
            href: 'https://scanpro.cc/fr',
            hreflang: 'fr',
        },
        {
            href: 'https://scanpro.cc/zh',
            hreflang: 'zh',
        },
        {
            href: 'https://scanpro.cc/id',
            hreflang: 'id',
        },
        // Add other languages as needed
    ],
    transform: async (config, path) => {
        // Handle language-specific URLs
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
        if (path === '/' || path === '/en' || path === '/es' || path === '/fr') {
            defaultConfig.priority = 1.0;
        } else if (path.includes('/pdf-tools')) {
            defaultConfig.priority = 0.9;
        } else if (path.includes('/convert/')) {
            defaultConfig.priority = 0.8;
        } else if (path.includes('/merge-pdf') || path.includes('/compress') || path.includes('/ocr')) {
            defaultConfig.priority = 0.8;
        }

        return defaultConfig;
    },
};