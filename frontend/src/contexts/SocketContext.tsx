import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  const eventCallbacks = new Map<string, (data: any) => void>();
  const [callbacks, setCallbacks] = useState<number>(0);

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

      socketConnection.on('message', (data: { type: string, payload?: any }) => {
        console.log(`Received message of type ${data.type}`);
        const callback = eventCallbacks.get(data.type);
        console.log(eventCallbacks.size);
        if (callback) {
          try {
            callback(data.payload);
          } catch (error) {
            console.error(`Error handling ${data.type}:`, error);
          }
        } else {
          console.warn(`No callback registered for message type: ${data.type}`);
        }
      });

      setSocket(socketConnection);

      return () => {
        socketConnection.disconnect();
      };
    }
  }, [isAuthenticated, token, callbacks]);

  const sendMessage = (type: string, payload?: any) => {
    if (socket) {
      socket.emit('message', { type, payload });
    }
  };

  const on = useCallback((event: string, callback: (data: any) => void) => {
    console.log('registered callback for ', event);
    eventCallbacks.set(event, callback);
    console.log(eventCallbacks.size);
    setCallbacks(callbacks + 1);
  }, []);

  const off = useCallback((event: string) => {
    eventCallbacks.delete(event);
    setCallbacks(callbacks - 1);
  }, []);

  return (
    <SocketContext.Provider value={{ socket, sendMessage, on, off }}>
      {children}
    </SocketContext.Provider>
  );
};
