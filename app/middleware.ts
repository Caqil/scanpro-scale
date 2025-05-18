import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const protectedRoutes = ['/dashboard', '/admin'];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.includes(route));

  if (isProtectedRoute) {
    const token = request.cookies.get('authToken')?.value || '';
    // Transform cookies into [name, value] pairs for Object.fromEntries
    const cookies = Object.fromEntries(
      request.cookies.getAll().map((cookie) => [cookie.name, cookie.value])
    );
    console.log('Middleware - Token:', token ? 'Found' : 'Not found', 'Cookies:', cookies);

    if (!token) {
      const lang = pathname.split('/')[1] || 'en';
      return NextResponse.redirect(new URL(`/${lang}/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url));
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_GO_API_URL}/api/validate-token`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });

      console.log('Middleware - Token validation status:', response.status);

      if (!response.ok) {
        console.error('Middleware - Token validation failed:', await response.text());
        const lang = pathname.split('/')[1] || 'en';
        return NextResponse.redirect(new URL(`/${lang}/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url));
      }

      const isAdminRoute = pathname.includes('/admin');
      if (isAdminRoute) {
        const data = await response.json();
        if (data.role !== 'admin') {
          const lang = pathname.split('/')[1] || 'en';
          return NextResponse.redirect(new URL(`/${lang}/dashboard`, request.url));
        }
      }
    } catch (error) {
      console.error('Middleware - Token validation error:', error);
      const lang = pathname.split('/')[1] || 'en';
      return NextResponse.redirect(new URL(`/${lang}/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url));
    }
  }

  return NextResponse.next();
}