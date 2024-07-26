import { useAuth } from "../contexts/AuthContext";

// frontend/src/utils/auth.ts
export async function authFetch(url: string, token: string | null, options: RequestInit = {}): Promise<Response> {
  const { refreshAuthToken } = useAuth();
    // Don't add Authorization header for /auth endpoints
    if (url.includes('/auth')) {
      return await fetch(url, options);
    }
  
    // Add Authorization header
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };
  
    let response = await fetch(url, {
      ...options,
      headers,
    });

      // If the token is expired, try to refresh it
  if (response.status === 401) {
    const newToken = await refreshAuthToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(url, {
        ...options,
        headers,
      });
    }
  }

  return response;
  }
  

  export async function fetchNewAuthToken(refreshToken: string | null): Promise<string | null> {
    if (!refreshToken) {
      return null;
    }
  
    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: refreshToken }),
      });
  
      if (response.ok) {
        const data = await response.json();
        return data.token;
      } else {
        console.error('Failed to refresh token');
        return null;
      }
    } catch (error) {
      console.error('Error refreshing token', error);
      return null;
    }
  }