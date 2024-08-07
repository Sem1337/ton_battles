import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import WebApp from '@twa-dev/sdk'
import { BrowserRouter } from 'react-router-dom';
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import { AuthProvider } from './contexts/AuthContext.tsx'; // Adjust import path
import { SocketProvider } from './contexts/SocketContext.tsx'
import { NotificationProvider } from './contexts/NotificationContext.tsx'

WebApp.ready();

// Call expand to make the app full screen
WebApp.expand();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename="/">
      <TonConnectUIProvider
        manifestUrl="https://www.tonbattles.ru/tonconnect-manifest.json"
      >
        <AuthProvider>
          <NotificationProvider>
            <SocketProvider>
              <App />
            </SocketProvider>
          </NotificationProvider>
        </AuthProvider>
      </TonConnectUIProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
