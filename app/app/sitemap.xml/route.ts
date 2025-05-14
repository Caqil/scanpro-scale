// app/sitemap.xml/route.ts
import { NextRequest } from 'next/server';

// Define supported languages
const SUPPORTED_LANGUAGES = ['en', 'id', 'es', 'fr', 'zh', 'ar', 'hi', 'ru', 'pt', 'de', 'ja', 'ko', 'it', 'tr'];

export async function GET(req: NextRequest) {
  try {
    // Extract hostname from request or use the default
    const host = req.headers.get('host') || '';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

    // Define the core routes that should be present for all languages
    const coreRoutes = [
      { url: '/', changefreq: 'weekly', priority: 1.0 },
      { url: '/pdf-tools', changefreq: 'weekly', priority: 0.9 },
      
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
      { url: '/rotate-pdf', changefreq: 'monthly', priority: 0.8 },
      { url: '/watermark-pdf', changefreq: 'monthly', priority: 0.8 },
      { url: '/repair-pdf', changefreq: 'monthly', priority: 0.8 },
      { url: '/ocr', changefreq: 'monthly', priority: 0.8 },
      { url: '/ocr-pdf', changefreq: 'monthly', priority: 0.8 },
      // Security tools
      { url: '/protect-pdf', changefreq: 'monthly', priority: 0.7 },
      { url: '/unlock-pdf', changefreq: 'monthly', priority: 0.7 },
      { url: '/page-numbers-pdf', changefreq: 'monthly', priority: 0.8 },
      { url: '/sign-pdf', changefreq: 'monthly', priority: 0.8 },
      { url: '/ask-pdf', changefreq: 'monthly', priority: 0.8 },
      // Info pages
      { url: '/about', changefreq: 'monthly', priority: 0.6 },
      { url: '/features', changefreq: 'monthly', priority: 0.7 },
      { url: '/contact', changefreq: 'monthly', priority: 0.6 },
      { url: '/terms', changefreq: 'yearly', priority: 0.4 },
      { url: '/privacy', changefreq: 'yearly', priority: 0.4 },
      { url: '/sitemap', changefreq: 'monthly', priority: 0.3 },
    ];

    // Manually construct XML string (more reliable than using libraries)
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';
    
    // Add root URL
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/</loc>\n`;
    xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>1.0</priority>\n';
    
    // Add language alternates for root
    for (const lang of SUPPORTED_LANGUAGES) {
      xml += `    <xhtml:link rel="alternate" hreflang="${lang}" href="${baseUrl}/${lang}" />\n`;
    }
    xml += '  </url>\n';
    
    // Add language-specific routes
    for (const lang of SUPPORTED_LANGUAGES) {
      // Add language root
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/${lang}</loc>\n`;
      xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>1.0</priority>\n';
      
      // Add language alternates
      for (const altLang of SUPPORTED_LANGUAGES) {
        xml += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${baseUrl}/${altLang}" />\n`;
      }
      xml += '  </url>\n';
      
      // Add all routes for this language
      for (const route of coreRoutes) {
        if (route.url === '/') continue; // Skip root
        
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/${lang}${route.url}</loc>\n`;
        xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
        xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
        xml += `    <priority>${route.priority}</priority>\n`;
        
        // Add language alternates
        for (const altLang of SUPPORTED_LANGUAGES) {
          xml += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${baseUrl}/${altLang}${route.url}" />\n`;
        }
        xml += '  </url>\n';
      }
    }
    
    xml += '</urlset>';

    // Return with proper content type
    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400'
      }
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return Response.json(
      { error: 'Failed to generate sitemap' },
      { status: 500 }
    );
  }
}