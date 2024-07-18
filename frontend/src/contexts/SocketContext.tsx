import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { webSocketManager } from '../utils/WebSocketManager';
import { useNotification } from './NotificationContext';
import LoadingScreen from '../components/LoadingScreen/LoadingScreen';


interface SocketContextType {
  sendMessage: (type: string, payload?: any) => void;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
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
  const { showNotification } = useNotification();
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    if (isAuthenticated && token) {
      console.log('Connecting to WebSocket server...');
      webSocketManager.connect(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}`, token);

      webSocketManager.on('NOTIFY', (data: { message: string }) => {
        console.log('received NOTIFY')
        showNotification(data.message);
      });

      const handleConnected = () => {
        setIsConnected(true);
      };

      const handleDisconnect = () => {
        setIsConnected(false);
      };
  
      webSocketManager.on('connect', handleConnected);
      webSocketManager.on('disconnect', handleDisconnect);

      return () => {
        webSocketManager.off('connect');
        webSocketManager.off('disconnect');
        webSocketManager.disconnect();
      };
    }
  }, [isAuthenticated, token]);

  const joinRoom = (roomId: string) => {
    webSocketManager.sendMessage('join', roomId);
  };

  const leaveRoom = (roomId: string) => {
    webSocketManager.sendMessage('leave', roomId);
  };

  if (!isConnected) {
    return <LoadingScreen />;
  }

  return (
    <SocketContext.Provider
      value={{
        sendMessage: webSocketManager.sendMessage.bind(webSocketManager),
        on: webSocketManager.on.bind(webSocketManager),
        off: webSocketManager.off.bind(webSocketManager),
        joinRoom,
        leaveRoom
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
