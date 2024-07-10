// frontend/src/utils/auth.ts
export function authFetch(url: string, token: string | null, options: RequestInit = {}): Promise<Response> {
    // Get token from localStorage or your preferred storage
  
    // Don't add Authorization header for /auth endpoints
    if (url.includes('/auth')) {
      return fetch(url, options);
    }
  
    // Add Authorization header
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };
  
    return fetch(url, {
      ...options,
      headers,
    });
  }
  