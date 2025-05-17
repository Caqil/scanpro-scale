// src/lib/http-client.ts
interface FetchOptions extends RequestInit {
    includeAuth?: boolean;
  }
  
  export async function fetchWithAuth(
    url: string,
    options: FetchOptions = {}
  ): Promise<Response> {
    const { includeAuth = true, ...fetchOptions } = options;
    
    const headers = new Headers(fetchOptions.headers || {});
    
    // Set default content type if not provided
    if (!headers.has('Content-Type') && !options.method?.toLowerCase().includes('get')) {
      headers.set('Content-Type', 'application/json');
    }
    
    // Add auth token if needed
    if (includeAuth) {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }
    
    const response = await fetch(url, {
      ...fetchOptions,
      headers
    });
    
    // Handle 401 Unauthorized - Token expired or invalid
    if (response.status === 401) {
      // Clear token if it's invalid
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      
      // Redirect to login if not already on an auth page
      if (!window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/register') &&
          !window.location.pathname.includes('/forgot-password')) {
        window.location.href = '/login?error=session_expired';
      }
    }
    
    return response;
  }