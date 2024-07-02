import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import WebApp from '@twa-dev/sdk'
import { TonConnectUIProvider } from '@tonconnect/ui-react'

WebApp.ready();

const initData = WebApp.initData;
const initDataUnsafe = WebApp.initDataUnsafe
console.log("Init Data:", initData);
console.log("Init Data Unsafe:", initDataUnsafe);

// Function to send authData to backend
async function authenticateUser(authData: string) {
  const response = await fetch('https://ton-btl.ew.r.appspot.com/auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(authData)
  });

  const result = await response.json();
  console.error(authData);
  console.error(response);
  if (result.status === 'ok') {
    // User is authenticated
    console.log('User authenticated', result.authData);
  } else {
    // Authentication failed
    console.error('Authentication failed', result.message);
  }
}

// Send authData to backend for verification
authenticateUser(initData);


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TonConnectUIProvider 
      manifestUrl="https://sem1337.github.io/ton_battles/tonconnect-manifest.json"
    >
      <App />
    </TonConnectUIProvider>
  </React.StrictMode>,
)
