import { createContext, useState, useContext, useEffect, ReactNode  } from 'react';
import WebApp from '@twa-dev/sdk';
import dotenv from 'dotenv';

dotenv.config();

interface AuthContextProps {
  isAuthenticated: boolean;
  authenticate: () => Promise<void>;
}

interface AuthProviderProps {
    children: ReactNode;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);
export const AuthProvider = ({ children } : AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const authenticate = async () => {
    const initData = WebApp.initData;
    console.log("Init Data:", initData);

    if (!initData) {
      console.error('initData is missing');
      setIsAuthenticated(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData }),
        credentials: 'include', // Include cookies in the request
      });

      const result = await response.json();
      if (result.status === 'ok') {
        // User is authenticated
        console.log('User authenticated', result.initData);
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
    <AuthContext.Provider value={{ isAuthenticated, authenticate }}>
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