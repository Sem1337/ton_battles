import React, { createContext, useContext, useState, ReactNode } from 'react';
import Modal from 'react-modal';

interface NotificationContextType {
  showNotification: (message: string) => void;
  showError: (message: string) => void;
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const showNotification = (message: string) => {
    setNotification(message);
  };

  const closeNotification = () => {
    setNotification(null);
  };

  const showError = (message: string) => {
    setErrorMsg(message);
  };

  const closeError = () => {
    setErrorMsg(null);
  };

  return (
    <NotificationContext.Provider value={{ showNotification, showError }}>
      {children}
      <Modal
        isOpen={notification !== null}
        onRequestClose={closeNotification}
        className="fixed inset-0 flex items-center justify-center z-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
        contentLabel="Notification"
      >
        <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Notification</h2>
          <div className="mb-4">{notification}</div>
          <button 
            onClick={closeNotification} 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Close
          </button>
        </div>
      </Modal>
      <Modal
        isOpen={errorMsg !== null}
        onRequestClose={closeError}
        className="fixed inset-0 flex items-center justify-center z-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
        contentLabel="Error"
      >
        <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Error</h2>
          <div className="mb-4">{errorMsg}</div>
          <button 
            onClick={closeError} 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Close
          </button>
        </div>
      </Modal>
    </NotificationContext.Provider>
  );
};
