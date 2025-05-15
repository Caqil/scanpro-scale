// lib/auth-middleware-helpers.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { checkAnonymousUsage } from './anonymous-tracker';

/**
 * Check if user is authenticated, otherwise check anonymous usage limits
 * @returns NextResponse with redirect if limit is reached, or null if user can proceed
 */
export async function checkAuthOrAnonymousLimit(
  request: NextRequest,
  redirectUrl: string = '/en/login'
): Promise<NextResponse | null> {
  // First check if user is authenticated
  const token = await getToken({ req: request });
  
  // If user is authenticated, allow the operation
  if (token?.user) {
    return null;
  }
  
  // For anonymous users, check usage limits
  const usage = checkAnonymousUsage(request);
  
  // If anonymous user has reached limit, redirect to login
  if (!usage.allowed) {
    // Create URL with return path
    const currentPath = request.nextUrl.pathname;
    const loginUrl = new URL(redirectUrl, request.url);
    
    // Add the current path as a return URL
    loginUrl.searchParams.set('returnUrl', currentPath);
    
    // Add a message about the usage limit
    loginUrl.searchParams.set('limitReached', 'true');
    
    return NextResponse.redirect(loginUrl);
  }
  
  // User is within limits, allow operation
  return null;
}