interface ApiOptions extends RequestInit {
    requireAuth?: boolean;
  }
  
  export async function apiRequest<T = any>(
    endpoint: string,
    options: ApiOptions = {}
  ): Promise<T> {
    const { requireAuth = true, ...fetchOptions } = options;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const url = `${baseUrl}${endpoint}`;
    
    const headers = new Headers(fetchOptions.headers);
    
    // Set default content-type if not provided
    if (!headers.has('Content-Type') && fetchOptions.method !== 'GET') {
      headers.set('Content-Type', 'application/json');
    }
    
    // Add auth token if required
    if (requireAuth) {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }
    
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });
    
    if (!response.ok) {
      // Handle 401 Unauthorized - clear token and redirect to login
      if (response.status === 401 && requireAuth) {
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        window.location.href = '/en/login';
      }
      
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || response.statusText;
      } catch (e) {
        errorMessage = response.statusText;
      }
      
      throw new Error(errorMessage);
    }
    
    // Check if response is empty
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return response.text() as unknown as T;
  }