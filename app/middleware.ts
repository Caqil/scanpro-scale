// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { API_OPERATIONS } from './lib/validate-key';

// Define API routes that require API key validation
const API_ROUTES = [
  '/api/convert',
  '/api/compress',
  '/api/merge',
  '/api/split',
  '/api/pdf/watermark',
  '/api/rotate',
  '/api/pdf/protect',
  '/api/pdf/unlock',
  '/api/ocr',
  '/api/pdf/sign',
  '/api/pdf/edit',
  '/api/pdf/repair',
  '/api/pdf/extract',
  '/api/pdf/annotate',
  '/api/pdf/redact',
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
  '/login',  // Exclude login route from middleware
  '/register', // Exclude register route from middleware
  '/api/auth/signin',
  '/api/auth/callback',
  '/api/auth/signin/apple',  // Specifically exclude Apple signin path
  '/api/auth/callback/apple',
  '/forgot-password', // Exclude forgot password route
  '/reset-password',  // Exclude reset password route
  '/api/pdf/chat',

  // Language-specific auth routes
  ...['en', 'id', 'es', 'fr', 'zh', 'ar', 'hi', 'ru', 'pt', 'de', 'ja', 'ko', 'it', 'tr'].flatMap(lang => [
    `/${lang}/forgot-password`,
    `/${lang}/reset-password`,
  ]),

  // Public file download/status routes
  '/api/convert/status',
  '/api/convert/download',
  '/api/compress/download',
  '/api/file',  // Important! This enables file downloads from the web UI
  '/api/health', 
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
  '/api/convert': 'convert',
  '/api/compress': 'compress',
  '/api/merge': 'merge',
  '/api/split': 'split',
  '/api/pdf/watermark': 'watermark',
  '/api/rotate': 'rotate',
  '/api/pdf/protect': 'protect',
  '/api/pdf/unlock': 'unlock',
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

  // Check if route should be excluded from API key validation
  for (const excludedRoute of EXCLUDED_ROUTES) {
    if (pathname.startsWith(excludedRoute)) {
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
    "/api/:path*",
    // Exclude authentication-related paths
    // Don't include /login or /api/auth/:path* here
  ],
};