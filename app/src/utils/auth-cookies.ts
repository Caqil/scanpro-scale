"use client";

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

export function useAuthCookieSync() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Sync localStorage/sessionStorage auth token with cookies for server-side auth
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    if (token) {
      // Set the token in cookies too for server-side middleware
      Cookies.set('authToken', token, { 
        expires: 7, // 7 days
        path: '/',
        sameSite: 'strict'
      });
    } else {
      // If no token in storage, remove it from cookies too
      Cookies.remove('authToken');
    }
    
    setInitialized(true);
  }, []);

  return initialized;
}

// Hook to use in the root layout
export function AuthCookieSyncProvider() {
  useAuthCookieSync();
  return null;
}