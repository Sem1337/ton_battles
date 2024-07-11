import React, { createContext, useContext, useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  sendMessage: (message: any) => void;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback: (data: any) => void) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (isAuthenticated && token) {
      const socketConnection = io(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}`, {
        query: { token },
        transports: ['websocket'],
      });

      socketConnection.on('connect', () => {
        console.log('Connected to WebSocket server');
      });

      socketConnection.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
      });

      setSocket(socketConnection);

      return () => {
        socketConnection.disconnect();
      };
    }
  }, [isAuthenticated, token]);

  const sendMessage = (message: any) => {
    if (socket) {
      socket.emit('message', message);
    }
  };

  const on = (event: string, callback: (data: any) => void) => {
    if (socket) {
      socket.on(event, callback);
    }
  };

  const off = (event: string, callback: (data: any) => void) => {
    if (socket) {
      socket.off(event, callback);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, sendMessage, on, off }}>
      {children}
    </SocketContext.Provider>
  );
};
