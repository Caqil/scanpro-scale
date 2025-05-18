// src/utils/auth.ts
import Cookies from 'js-cookie';

export const setAuthToken = (token: string) => {
  Cookies.set('authToken', token, {
    expires: 7, // 7 days
    path: '/', // Ensure cookie is available site-wide
    secure: process.env.NODE_ENV === 'production', // Secure in production
    sameSite: 'lax', // Balances security and functionality
    // Remove domain for local dev, or set explicitly for production
    domain: process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_COOKIE_DOMAIN : undefined,
  });
  console.log('setAuthToken - Cookie set:', Cookies.get('authToken'), 'All cookies:', document.cookie);
};

export const getAuthToken = (): string | null => {
  const token = Cookies.get('authToken') || null;
  console.log('getAuthToken - Token:', token ? 'Found' : 'Not found');
  return token;
};

export const removeAuthToken = () => {
  Cookies.remove('authToken', { path: '/', domain: undefined });
  console.log('removeAuthToken - Cookie removed');
};

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  console.log('fetchWithAuth - URL:', url, 'Headers:', headers);

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Ensure cookies are sent
  });
};