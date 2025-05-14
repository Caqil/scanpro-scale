// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { API_OPERATIONS } from './lib/validate-key';

// Define API routes that require API key validation
const API_ROUTES = [
  '/api/pdf/convert',
  '/api/pdf/compress',
  '/api/pdf/merge',
  '/api/pdf/split',
  '/api/pdf/watermark',
  '/api/pdf/protect',
  '/api/pdf/unlock',
  '/api/pdf/remove',
  '/api/ocr',
  '/api/pdf/sign',
  '/api/pdf/edit',
  '/api/pdf/repair',
  '/api/pdf/extract',
  '/api/pdf/annotate',
  '/api/pdf/redact',
  '/api/pdf/rotate',
  '/api/pdf/redact/detect',
  '/api/pdf/organize',
  '/api/pdf/process',
  '/api/pdf/save',
  '/api/pdf/info',
  '/api/pdf/pagenumber',
];

// Routes that should be excluded from API key validation
const EXCLUDED_ROUTES = [
  // Auth related routes
  '/api/webhooks/paypal',
  '/api/auth',
  '/api/webhooks',
  '/api/admin',
  '/login',
  '/register',
  '/api/auth/signin',
  '/api/auth/callback',
  '/api/auth/signin/apple',
  '/api/auth/callback/apple',
  '/forgot-password',
  '/reset-password',
  '/api/pdf/chat',
  '/api/file',
  '/api/health', 
];

const ADMIN_ROUTES = [
  '/admin',
  '/api/admin',
];

// User agent patterns for browsers (to identify web UI requests)
const BROWSER_USER_AGENT_PATTERNS = [
  'Mozilla/',
  'Chrome/',
  'Safari/',
  'Firefox/',
  'Edge/',
  'Opera/'
];


// Function to check if request is from a browser (web UI)
function isWebUIRequest(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent') || '';
  const acceptHeader = request.headers.get('accept') || '';
  const referer = request.headers.get('referer') || '';

  // Check user agent for browser signatures
  const fromBrowser = BROWSER_USER_AGENT_PATTERNS.some(pattern =>
    userAgent.includes(pattern)
  );

  // Check if accepts HTML
  const acceptsHtml = acceptHeader.includes('text/html');

  // Check if referred from our own website
  const ownSiteReferer = referer.includes(process.env.NEXT_PUBLIC_APP_URL || '');

  // Consider it a web UI request if it comes from a browser and accepts HTML or is from our site
  return fromBrowser && (acceptsHtml || ownSiteReferer);
}

// Map API route patterns to operation types
const ROUTE_TO_OPERATION_MAP: Record<string, string> = {
  '/api/pdf/convert': 'convert',
  '/api/pdf/compress': 'compress',
  '/api/pdf/merge': 'merge',
  '/api/pdf/split': 'split',
  '/api/pdf/watermark': 'watermark',
  '/api/pdf/rotate': 'rotate',
  '/api/pdf/protect': 'protect',
  '/api/pdf/unlock': 'unlock',
  '/api/pdf/remove': 'remove',
  '/api/ocr': 'ocr',
  '/api/pdf/sign': 'sign',
  '/api/pdf/edit': 'edit',
  '/api/pdf/repair': 'repair',
  '/api/pdf/extract': 'extract',
  '/api/pdf/annotate': 'annotate',
  '/api/pdf/redact': 'redact',
  '/api/pdf/redact/detect': 'detect',
  '/api/pdf/organize': 'organize',
  '/api/pdf/process': 'process',
  '/api/pdf/save': 'edit',
  '/api/pdf/info': 'extract',
  '/api/pdf/pagenumber': 'edit',
  '/api/pdf/chat': 'chat',
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this is a dashboard route and user is admin
  if (pathname.match(/^\/[^\/]+\/dashboard$/)) {
    try {
      const token = await getToken({ req: request });
      
      if (token?.user && (token.user as any).role === 'admin') {
        // Extract language from pathname
        const pathParts = pathname.split('/');
        const lang = pathParts[1] || 'en';
        
        // Redirect to admin dashboard
        return NextResponse.redirect(new URL(`/${lang}/admin/dashboard`, request.url));
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  }

  // Check if route should be excluded from API key validation
  for (const excludedRoute of EXCLUDED_ROUTES) {
    if (pathname.startsWith(excludedRoute)) {
      return NextResponse.next();
    }
  }

  // Handle admin routes - ensure user is authenticated and has admin role
  for (const adminRoute of ADMIN_ROUTES) {
    if (pathname.startsWith(adminRoute)) {
      try {
        const token = await getToken({ req: request });
        
        if (!token?.user) {
          // No user session, redirect to login
          const lang = pathname.split('/')[1] || 'en';
          return NextResponse.redirect(new URL(`/${lang}/login`, request.url));
        }

        // Check if user has admin role (if not in API route)
        if (!pathname.startsWith('/api/') && (token.user as any).role !== 'admin') {
          // Non-admin trying to access admin page, redirect to regular dashboard
          const lang = pathname.split('/')[1] || 'en';
          return NextResponse.redirect(new URL(`/${lang}/dashboard`, request.url));
        }
      } catch (error) {
        console.error('Error checking admin access:', error);
      }
      
      return NextResponse.next();
    }
  }

  // Check if this is an API route that needs authentication
  let requiresApiKey = false;
  let operationType = '';

  for (const apiRoute of API_ROUTES) {
    if (pathname.startsWith(apiRoute)) {
      requiresApiKey = true;

      // Determine operation type for this route
      for (const [routePattern, operation] of Object.entries(ROUTE_TO_OPERATION_MAP)) {
        if (pathname.startsWith(routePattern)) {
          operationType = operation;
          break;
        }
      }

      // If no specific mapping is found, use the last part of the path
      if (!operationType) {
        const pathParts = pathname.split('/');
        operationType = pathParts[pathParts.length - 1];
      }

      break;
    }
  }

  if (!requiresApiKey) {
    // Not an API route that needs validation
    return NextResponse.next();
  }

  // Skip API key validation for requests from the web UI
  if (isWebUIRequest(request)) {
    console.log(`Bypassing API key check for web UI request to ${pathname}`);
    return NextResponse.next();
  }

  // For programmatic API access, check API key
  const apiKey = request.headers.get('x-api-key') || request.nextUrl.searchParams.get('api_key');

  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key is required' },
      { status: 401 }
    );
  }

  // Add operation type to the request headers for the API route to use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-operation-type', operationType);

  // Simply pass the API key to the endpoint
  // Let the endpoint handle validation directly with the database
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/api/auth/callback/:path*",
    "/dashboard/:path*",
    "/:lang/dashboard/:path*",
    "/api/:path*",
    "/admin/:path*",  
    "/:lang/admin/:path*",
  ],
};