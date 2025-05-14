// pages/api/sitemap.xml.js
import { SitemapStream, streamToPromise } from 'sitemap';

export default async function handler(req, res) {
    // Set response header
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=1200, stale-while-revalidate=600');

    // Create sitemap stream
    const smStream = new SitemapStream({
        hostname: 'https://mega-pdf.com'
    });

    try {
        // List of all pages
        const pages = [
            // Main pages
            { url: '/', changefreq: 'weekly', priority: 1.0 },
            { url: '/pdf-tools', changefreq: 'weekly', priority: 0.9 },

            // Conversion tools - PDF to other formats
            { url: '/convert/pdf-to-docx', changefreq: 'monthly', priority: 0.8 },
            { url: '/convert/pdf-to-xlsx', changefreq: 'monthly', priority: 0.8 },
            { url: '/convert/pdf-to-pptx', changefreq: 'monthly', priority: 0.8 },
            { url: '/convert/pdf-to-jpg', changefreq: 'monthly', priority: 0.8 },
            { url: '/convert/pdf-to-png', changefreq: 'monthly', priority: 0.8 },
            { url: '/convert/pdf-to-html', changefreq: 'monthly', priority: 0.8 },

            // Conversion tools - other formats to PDF
            { url: '/convert/docx-to-pdf', changefreq: 'monthly', priority: 0.8 },
            { url: '/convert/xlsx-to-pdf', changefreq: 'monthly', priority: 0.8 },
            { url: '/convert/pptx-to-pdf', changefreq: 'monthly', priority: 0.8 },
            { url: '/convert/jpg-to-pdf', changefreq: 'monthly', priority: 0.8 },
            { url: '/convert/png-to-pdf', changefreq: 'monthly', priority: 0.8 },
            { url: '/convert/html-to-pdf', changefreq: 'monthly', priority: 0.8 },

            // Core tools
            { url: '/merge-pdf', changefreq: 'monthly', priority: 0.8 },
            { url: '/split-pdf', changefreq: 'monthly', priority: 0.8 },
            { url: '/compress-pdf', changefreq: 'monthly', priority: 0.8 },
            { url: '/compress-file', changefreq: 'monthly', priority: 0.8 },
            { url: '/rotate-pdf', changefreq: 'monthly', priority: 0.8 },
            { url: '/watermark-pdf', changefreq: 'monthly', priority: 0.8 },
            { url: '/repair-pdf', changefreq: 'monthly', priority: 0.8 },
            { url: '/ocr', changefreq: 'monthly', priority: 0.8 },
            { url: '/ocr-pdf', changefreq: 'monthly', priority: 0.8 },

            // Security tools
            { url: '/protect-pdf', changefreq: 'monthly', priority: 0.7 },
            { url: '/unlock-pdf', changefreq: 'monthly', priority: 0.7 },
            { url: '/remove-pdf-page', changefreq: 'monthly', priority: 0.7 },

            // Enhancement tools
            { url: '/page-numbers-pdf', changefreq: 'monthly', priority: 0.8 },
            { url: '/sign-pdf', changefreq: 'monthly', priority: 0.8 },
            { url: '/ask-pdf', changefreq: 'monthly', priority: 0.8 },

            // User pages
            { url: '/dashboard', changefreq: 'weekly', priority: 0.6 },
            { url: '/login', changefreq: 'monthly', priority: 0.5 },
            { url: '/register', changefreq: 'monthly', priority: 0.5 },
            { url: '/verify-email', changefreq: 'monthly', priority: 0.4 },
            { url: '/pricing', changefreq: 'monthly', priority: 0.7 },

            // API/Developer pages
            { url: '/developer/api', changefreq: 'monthly', priority: 0.6 },
            { url: '/developer/api/conversion', changefreq: 'monthly', priority: 0.5 },
            { url: '/developer/api/manipulation', changefreq: 'monthly', priority: 0.5 },

            // Company/Info pages
            { url: '/about', changefreq: 'monthly', priority: 0.6 },
            { url: '/features', changefreq: 'monthly', priority: 0.7 },
            { url: '/contact', changefreq: 'monthly', priority: 0.6 },
            { url: '/terms', changefreq: 'yearly', priority: 0.4 },
            { url: '/privacy', changefreq: 'yearly', priority: 0.4 },
            { url: '/cookies', changefreq: 'yearly', priority: 0.4 },
            { url: '/security', changefreq: 'yearly', priority: 0.5 },
            { url: '/sitemap', changefreq: 'monthly', priority: 0.3 },
            { url: '/faq', changefreq: 'monthly', priority: 0.6 },
        ];

        // Add supported languages (match with App Router version)
        const supportedLanguages = ['en', 'id', 'es', 'fr', 'zh', 'ar', 'hi', 'ru', 'pt', 'de', 'ja', 'ko', 'it', 'tr'];

        // Add language-specific URLs for important pages
        supportedLanguages.forEach(lang => {
            if (lang !== 'en') { // Assuming 'en' is the default and already covered
                pages.push({ url: `/${lang}`, changefreq: 'weekly', priority: 0.9 });
            }
        });

        // Add each URL to the sitemap stream
        pages.forEach(page => {
            smStream.write({
                url: page.url,
                changefreq: page.changefreq,
                priority: page.priority,
                lastmod: new Date().toISOString()
            });
        });

        // End the stream
        smStream.end();

        // Generate the XML
        const sitemapOutput = await streamToPromise(smStream);

        // Return the XML
        res.write(sitemapOutput.toString());
        res.end();
    } catch (error) {
        console.log(error);
        res.status(500).end();
    }
}