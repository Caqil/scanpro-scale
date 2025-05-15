// lib/anonymous-tracker.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Constants
const COOKIE_NAME = 'anonymous_usage';
const MAX_ANONYMOUS_OPERATIONS =6;
const COOKIE_EXPIRY_DAYS = 1; // How long to remember usage

/**
 * Tracks anonymous usage via cookies
 * Returns info about whether the user has reached usage limits
 */
export function trackAnonymousUsage(
  request: NextRequest,
  operation: string
): {
  allowed: boolean;
  usageCount: number;
  remainingOperations: number;
  response?: NextResponse;
} {
  // Get current cookie value
  const usageCookie = request.cookies.get(COOKIE_NAME);
  let usageData: Record<string, number> = {};
  
  // Parse existing cookie or create empty object
  if (usageCookie?.value) {
    try {
      usageData = JSON.parse(usageCookie.value);
    } catch (e) {
      console.error('Error parsing usage cookie:', e);
      usageData = {};
    }
  }
  
  // Update usage for this operation
  usageData[operation] = (usageData[operation] || 0) + 1;
  
  // Calculate total usage
  const totalUsage = Object.values(usageData).reduce((sum, count) => sum + count, 0);
  const remaining = Math.max(0, MAX_ANONYMOUS_OPERATIONS - totalUsage);
  
  // Create cookie with updated values
  const cookieValue = JSON.stringify(usageData);
  const cookieExpiry = new Date();
  cookieExpiry.setDate(cookieExpiry.getDate() + COOKIE_EXPIRY_DAYS);
  
  // Create response with cookie
  const response = NextResponse.next();
  response.cookies.set({
    name: COOKIE_NAME,
    value: cookieValue,
    expires: cookieExpiry,
    path: '/',
  });
  
  return {
    allowed: totalUsage <= MAX_ANONYMOUS_OPERATIONS,
    usageCount: totalUsage,
    remainingOperations: remaining,
    response
  };
}

/**
 * Helper function to check anonymous usage without incrementing
 */
export function checkAnonymousUsage(request: NextRequest): {
  allowed: boolean;
  usageCount: number;
  remainingOperations: number;
} {
  // Get current cookie value
  const usageCookie = request.cookies.get(COOKIE_NAME);
  let usageData: Record<string, number> = {};
  
  // Parse existing cookie or create empty object
  if (usageCookie?.value) {
    try {
      usageData = JSON.parse(usageCookie.value);
    } catch (e) {
      console.error('Error parsing usage cookie:', e);
      usageData = {};
    }
  }
  
  // Calculate total usage
  const totalUsage = Object.values(usageData).reduce((sum, count) => sum + count, 0);
  const remaining = Math.max(0, MAX_ANONYMOUS_OPERATIONS - totalUsage);
  
  return {
    allowed: totalUsage <= MAX_ANONYMOUS_OPERATIONS,
    usageCount: totalUsage,
    remainingOperations: remaining
  };
}

/**
 * Reset anonymous usage tracking (useful when a user logs in)
 */
export function resetAnonymousUsage(): NextResponse {
  const response = NextResponse.next();
  response.cookies.set({
    name: COOKIE_NAME,
    value: '',
    expires: new Date(0), // Expire immediately
    path: '/',
  });
  
  return response;
}