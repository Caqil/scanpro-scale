// app/api/dynamic-sitemap.tsx
import { NextRequest, NextResponse } from 'next/server';
import { SitemapStream, streamToPromise } from 'sitemap';

// Define supported languages
const SUPPORTED_LANGUAGES = ['en', 'id', 'es', 'fr', 'zh', 'ar', 'hi', 'ru', 'pt', 'de', 'ja', 'ko', 'it', 'tr'];

export async function GET(req: NextRequest) {
  try {
    // Extract hostname from request or use the default
    const hostname = req.headers.get('host') || 'scanpro.cc';
    const protocol = hostname.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${hostname}`;

    // Create sitemap stream
    const smStream = new SitemapStream({
      hostname: baseUrl
    });

    // Define the core routes that should be present for all languages
    const coreRoutes = [
      { url: '/', changefreq: 'weekly', priority: 1.0 },
      { url:  '/pdf-tools', changefreq: 'weekly', priority: 0.9 },
      
      // Conversion tools
      { url: '/convert/pdf-to-docx', changefreq: 'monthly', priority: 0.8 },
      { url: '/convert/pdf-to-xlsx', changefreq: 'monthly', priority: 0.8 },
      { url: '/convert/pdf-to-pptx', changefreq: 'monthly', priority: 0.8 },
      { url: '/convert/pdf-to-jpg', changefreq: 'monthly', priority: 0.8 },
      { url: '/convert/pdf-to-png', changefreq: 'monthly', priority: 0.8 },
      { url: '/convert/pdf-to-html', changefreq: 'monthly', priority: 0.8 },
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
      { url: '/rotate', changefreq: 'monthly', priority: 0.8 },
      { url: '/watermark-pdf', changefreq: 'monthly', priority: 0.8 },
      { url: '/repair-pdf', changefreq: 'monthly', priority: 0.8 },
      { url: '/ocr', changefreq: 'monthly', priority: 0.8 },
      
      // Security tools
      { url: '/protect-pdf', changefreq: 'monthly', priority: 0.7 },
      { url: '/unlock-pdf', changefreq: 'monthly', priority: 0.7 },
      
      // Info pages
      { url: '/about', changefreq: 'monthly', priority: 0.6 },
      { url: '/features', changefreq: 'monthly', priority: 0.7 },
      { url: '/contact', changefreq: 'monthly', priority: 0.6 },
      { url: '/terms', changefreq: 'yearly', priority: 0.4 },
      { url: '/privacy', changefreq: 'yearly', priority: 0.4 },
      { url: '/sitemap', changefreq: 'monthly', priority: 0.3 },
    ];

    // Generate URLs for each language
    const allUrls = [];
    
    for (const lang of SUPPORTED_LANGUAGES) {
      for (const route of coreRoutes) {
        allUrls.push({
          ...route,
          url: `/${lang}${route.url === '/' ? '' : route.url}`,
          links: SUPPORTED_LANGUAGES.map(altLang => ({
            lang: altLang,
            url: `${baseUrl}/${altLang}${route.url === '/' ? '' : route.url}`
          }))
        });
      }
    }

    // Add each URL to the sitemap stream
    allUrls.forEach(item => {
      smStream.write({
        url: item.url,
        changefreq: item.changefreq,
        priority: item.priority,
        lastmod: new Date().toISOString(),
        links: item.links
      });
    });

    // Close stream
    smStream.end();

    // Generate sitemap XML
    const sitemapOutput = await streamToPromise(smStream);

    // Return with proper content type
    return new Response(sitemapOutput.toString(), {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400'
      }
    });
  } catch (error) {
    console.error('Error generating dynamic sitemap:', error);
    return NextResponse.json(
      { error: 'Failed to generate sitemap' },
      { status: 500 }
    );
  }
}