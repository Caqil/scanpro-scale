import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Function to call after user logs in successfully
 * This resets the anonymous usage tracker so previously tracked
 * operations don't count against the user after login
 */
export function onLoginSuccess() {
  try {
    // Reset anonymous usage cookie on client-side
    document.cookie = 'anonymous_usage=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    return true;
  } catch (error) {
    console.error('Error resetting anonymous usage:', error);
    return false;
  }
}

/**
 * Reset anonymous usage cookie server-side
 * To be used in API routes and server components
 */
export function resetAnonymousUsageCookie(): NextResponse {
  const response = NextResponse.next();
  
  // Set cookie to expire immediately
  response.cookies.set({
    name: 'anonymous_usage',
    value: '',
    expires: new Date(0),
    path: '/',
  });
  
  return response;
}