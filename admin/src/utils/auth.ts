// Utility function for making authenticated API requests
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
    // Get token from localStorage
    const token = localStorage.getItem('authToken');
    
    const defaultOptions: RequestInit = {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        // Include Authorization header with token if available
        ...(token && { "Authorization": `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };
  
    const response = await fetch(url, defaultOptions);
  
    // Handle unauthorized responses
    if (response.status === 401) {
      // Clear invalid token
      localStorage.removeItem('authToken');
      // Redirect to login if not authenticated
      if (typeof window !== 'undefined') {
        window.location.href = "/login";
      }
      throw new Error("Unauthorized");
    }
  
    return response;
  }
  
  // Format currency for display
  export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }
  
  // Format date for display
  export function formatDate(date: Date | string | null): string {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  
  // Format relative time
  export function formatRelativeTime(date: Date | string | null): string {
    if (!date) return "Never";
    
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return formatDate(date);
  }