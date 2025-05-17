import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Protected routes
  const protectedRoutes = ['/dashboard', '/admin'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.includes(route));
  console.log("Middleware running for path:", pathname);
  
  const token = request.cookies.get('authToken')?.value || '';
  console.log("Token found:", !!token);
  if (isProtectedRoute) {
    // Get Next-Auth session token
    const token = await getToken({ req: request as any });
    
    if (!token) {
      // No session, redirect to login
      const lang = pathname.split('/')[1] || 'en';
      return NextResponse.redirect(new URL(`/${lang}/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url));
    }
    
    // Check admin routes
    const isAdminRoute = pathname.includes('/admin');
    if (isAdminRoute && token.role !== 'admin') {
      const lang = pathname.split('/')[1] || 'en';
      return NextResponse.redirect(new URL(`/${lang}/dashboard`, request.url));
    }
  }

  return NextResponse.next();
}