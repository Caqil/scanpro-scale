// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect non-admins trying to access admin dashboard
  if (pathname.match(/^\/[^\/]+\/dashboard$/)) {
    try {
      const token = await getToken({ req: request });

      if (token?.user && (token.user as any).role === 'admin') {
        const pathParts = pathname.split('/');
        const lang = pathParts[1] || 'en';
        return NextResponse.redirect(new URL(`/${lang}/admin/dashboard`, request.url));
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  }

  // Protect /admin routes — only allow logged-in admin users
  if (pathname.includes('/admin')) {
    try {
      const token = await getToken({ req: request });

      if (!token?.user) {
        const lang = pathname.split('/')[1] || 'en';
        return NextResponse.redirect(new URL(`/${lang}/login`, request.url));
      }

      if ((token.user as any).role !== 'admin') {
        const lang = pathname.split('/')[1] || 'en';
        return NextResponse.redirect(new URL(`/${lang}/dashboard`, request.url));
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
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
