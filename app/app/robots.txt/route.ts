// app/robots.txt/route.ts
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  // Extract hostname from request or use the default
  const host = req.headers.get('host') || '';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

  // Generate robots.txt content
  const robotsTxt = `# *
User-agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard/
Disallow: /admin/

# Host
Host: ${baseUrl}

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/sitemap-index.xml
`;

  // Return with proper content type
  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400'
    }
  });
}