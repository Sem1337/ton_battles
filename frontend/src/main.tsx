import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import WebApp from '@twa-dev/sdk'
import { BrowserRouter } from 'react-router-dom';
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import { AuthProvider } from './contexts/AuthContext.tsx'; // Adjust import path
import { SocketProvider } from './contexts/SocketContext.tsx'

WebApp.ready();

// Call expand to make the app full screen
WebApp.expand();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TonConnectUIProvider
      manifestUrl="https://sem1337.github.io/ton_battles/tonconnect-manifest.json"
    >
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </TonConnectUIProvider>
  </React.StrictMode>,
)
