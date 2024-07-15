import React, { createContext, useContext, useState, ReactNode } from 'react';
import Modal from 'react-modal';

const customModalStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#fff', // Set background color
      color: '#000', // Set text color
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Set overlay background color
    },
  };

interface NotificationContextType {
  showNotification: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (message: string) => {
    setNotification(message);
  };

  const closeNotification = () => {
    setNotification(null);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Modal
        isOpen={notification !== null}
        onRequestClose={closeNotification}
        style={customModalStyles}
        contentLabel="Notification"
      >
        <h2>Notification</h2>
        <div>{notification}</div>
        <button onClick={closeNotification}>Close</button>
      </Modal>
    </NotificationContext.Provider>
  );
};
