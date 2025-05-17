import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Protected routes
  const protectedRoutes = ['/dashboard', '/admin'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.includes(route));
  console.log("Middleware running for path:", pathname);
  
  if (isProtectedRoute) {
    // Get your custom auth token from cookie
    const token = request.cookies.get('authToken')?.value || '';
    console.log("Token found:", !!token);
    
    if (!token) {
      // No token, redirect to login
      const lang = pathname.split('/')[1] || 'en';
      return NextResponse.redirect(new URL(`/${lang}/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url));
    }
    
    // Optional: Validate token with your Go API
    try {
      const apiUrl = process.env.NEXT_PUBLIC_GO_API_URL || '';
      const response = await fetch(`${apiUrl}/api/validate-token`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        // Token invalid, redirect to login
        const lang = pathname.split('/')[1] || 'en';
        return NextResponse.redirect(new URL(`/${lang}/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url));
      }
      
      // For admin routes, check if user has admin role
      const isAdminRoute = pathname.includes('/admin');
      if (isAdminRoute) {
        // Get user data from response
        const data = await response.json();
        if (data.role !== 'admin') {
          const lang = pathname.split('/')[1] || 'en';
          return NextResponse.redirect(new URL(`/${lang}/dashboard`, request.url));
        }
      }
    } catch (error) {
      // Error validating token, redirect to login
      console.error("Token validation error:", error);
      const lang = pathname.split('/')[1] || 'en';
      return NextResponse.redirect(new URL(`/${lang}/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url));
    }
  }

  return NextResponse.next();
}