import { createContext, useState, useContext, useEffect, ReactNode  } from 'react';
import { authFetch } from '../utils/auth';
import WebApp from '@twa-dev/sdk';

interface AuthContextProps {
  isAuthenticated: boolean;
  authenticate: () => Promise<void>;
  tgUserId: number;
}

interface AuthProviderProps {
    children: ReactNode;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);
export const AuthProvider = ({ children } : AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [tgUserId, setTgUserId] = useState<number>(-1);

  const authenticate = async () => {
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
        const authHeader = response.headers.get('authorization');
        const token = authHeader && authHeader.split(' ')[1];
        localStorage.setItem('token', token!);
        console.log('User authenticated', result.initData);
        console.log(response.headers.getSetCookie());
        setTgUserId(result.userId);
        setIsAuthenticated(true);
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

  useEffect(() => {
    authenticate();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, authenticate, tgUserId }}>
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
