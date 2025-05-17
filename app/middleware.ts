import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get auth token from cookies
  const token = request.cookies.get('authToken')?.value || 
                request.headers.get('authorization')?.split(' ')[1] || 
                '';

  // Protected routes that need authentication
  const protectedRoutes = ['/dashboard', '/admin'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.includes(route));

  // Check if admin route
  const isAdminRoute = pathname.includes('/admin');

  if (isProtectedRoute) {
    // If no token, redirect to login
    if (!token) {
      const lang = pathname.split('/')[1] || 'en';
      return NextResponse.redirect(new URL(`/${lang}/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url));
    }

    try {
      // Verify token with Go API
      const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_GO_API_URL}/api/auth/validate-token`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!verifyResponse.ok) {
        // Token is invalid, redirect to login
        const lang = pathname.split('/')[1] || 'en';
        return NextResponse.redirect(new URL(`/${lang}/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url));
      }

      // For admin routes, check if user has admin role
      if (isAdminRoute) {
        // Get user profile
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_GO_API_URL}/api/user/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!userResponse.ok) {
          const lang = pathname.split('/')[1] || 'en';
          return NextResponse.redirect(new URL(`/${lang}/login`, request.url));
        }

        const userData = await userResponse.json();

        if (userData.role !== 'admin') {
          const lang = pathname.split('/')[1] || 'en';
          return NextResponse.redirect(new URL(`/${lang}/dashboard`, request.url));
        }
      }
    } catch (error) {
      console.error('Auth validation error:', error);
      const lang = pathname.split('/')[1] || 'en';
      return NextResponse.redirect(new URL(`/${lang}/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/:lang/dashboard/:path*",
    "/admin/:path*",
    "/:lang/admin/:path*",
  ],
};