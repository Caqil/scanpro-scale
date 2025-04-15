import { useAuth } from "@/src/context/auth-context";

/**
 * Enhanced fetch function that adds the web UI marker headers
 * This ensures the API middleware knows the request is coming from the web UI
 */
export async function apiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Set up headers
  const headers = new Headers(options.headers || {});

  // Add header indicating this is a web UI request
  headers.set('X-Source', 'web-ui');

  // If not already set, set Accept header to include HTML
  if (!headers.has('Accept')) {
    headers.set('Accept', 'text/html,application/json');
  }

  // Create new options with updated headers
  const updatedOptions = {
    ...options,
    headers
  };

  // Make the fetch request
  return fetch(url, updatedOptions);
}

/**
 * Hook to use the API client with authentication
 */
export function useApiClient() {
  const { isAuthenticated, authToken, isWebUI } = useAuth();

  /**
   * Make authenticated API calls
   */
  const apiCall = async (
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> => {
    try {
      // Set up headers
      const headers = new Headers(options.headers || {});

      // Add authentication if available
      if (isAuthenticated && authToken) {
        headers.set('Authorization', `Bearer ${authToken}`);
      }

      // Add web UI marker headers
      headers.set('X-Source', 'web-ui');

      // If not already set, set Accept header to include HTML
      if (!headers.has('Accept')) {
        headers.set('Accept', 'text/html,application/json');
      }

      // Make the request
      const response = await fetch(endpoint, {
        ...options,
        headers
      });

      // Check if response is OK
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'API request failed');
      }

      // Return the parsed JSON data
      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  return {
    apiCall,
    isAuthenticated,
    isWebUI
  };
}