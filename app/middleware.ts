import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const protectedRoutes = ['/dashboard', '/admin'];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.includes(route));

  if (isProtectedRoute) {
    const token = request.cookies.get('authToken')?.value || '';
    const cookies = Object.fromEntries(
      request.cookies.getAll().map((cookie) => [cookie.name, cookie.value])
    );
    console.log('Middleware - Token:', token ? 'Found' : 'Not found', 'Cookies:', cookies);

    if (!token) {
      const lang = pathname.split('/')[1] || 'en';
      return NextResponse.redirect(new URL(`/${lang}/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url));
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${apiUrl}/api/validate-token`, {
        method: 'GET',
        credentials: 'include', // Send cookies, including authToken
      });

      console.log('Middleware - Token validation status:', response.status);

      if (!response.ok) {
        console.error('Middleware - Token validation failed:', await response.text());
        const lang = pathname.split('/')[1] || 'en';
        return NextResponse.redirect(new URL(`/${lang}/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url));
      }

      const data = await response.json();
      if (!data.success) {
        console.error('Middleware - Token validation failed: Invalid response', data);
        const lang = pathname.split('/')[1] || 'en';
        return NextResponse.redirect(new URL(`/${lang}/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url));
      }

      const isAdminRoute = pathname.includes('/admin');
      if (isAdminRoute && data.user?.role !== 'admin') {
        const lang = pathname.split('/')[1] || 'en';
        return NextResponse.redirect(new URL(`/${lang}/dashboard`, request.url));
      }
    } catch (error) {
      console.error('Middleware - Token validation error:', error);
      const lang = pathname.split('/')[1] || 'en';
      return NextResponse.redirect(new URL(`/${lang}/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};