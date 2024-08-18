import { createContext, useState, useContext, useEffect, ReactNode  } from 'react';
import { fetchNewAuthToken } from '../utils/auth';
import WebApp from '@twa-dev/sdk';

interface AuthContextProps {
  isAuthenticated: boolean;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
  tgUserId: number;
  token: string | null;
}

interface AuthProviderProps {
    children: ReactNode;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);
export const AuthProvider = ({ children } : AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [tgUserId, setTgUserId] = useState<number>(-1);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
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

  const authenticate = async () => {
    if (isAuthenticated) return;
    const initData = WebApp.initData;
    console.log("Init Data:", initData);

    if (!initData) {
      console.error('initData is missing');
      setIsAuthenticated(false);
      return;
    }

    try {
      const response = await authFetch(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData }),
        mode: 'cors',
        credentials: 'include', // Include cookies in the request
      });

      const result = await response.json();
      if (result.status === 'ok') {
        // User is authenticated
        const authHeader = response.headers.get('Authorization');
        const token = authHeader && authHeader.split(' ')[1];
        const refreshToken = result.refreshToken;

        localStorage.setItem('refreshToken', refreshToken!);
        localStorage.setItem('token', token!);

        console.log('User authenticated', result.initData);
        setTgUserId(result.userId);
        setIsAuthenticated(true);
        setToken(token);
        setRefreshToken(refreshToken);
      } else {
        // Authentication failed
        console.error('Authentication failed', result.message);
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setIsAuthenticated(false);
    }
  };

  const refreshAuthToken = async (): Promise<string | null> => {
    const newToken = await fetchNewAuthToken(refreshToken);
    if (newToken) {
      setToken(newToken);
    }
    return newToken;
  };

  useEffect(() => {
    authenticate();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, authFetch, tgUserId, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
