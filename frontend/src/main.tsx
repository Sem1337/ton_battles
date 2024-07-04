import { Buffer } from 'buffer';
// @ts-ignore
window.Buffer = Buffer;
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

// Function to send initData to backend
async function authenticateUser(initData: string) {
  const response = await fetch('https://ton-btl.ew.r.appspot.com/auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({initData})
  });

  const result = await response.json();
  if (result.status === 'ok') {
    // User is authenticated
    console.log('User authenticated', result.initData);
    localStorage.setItem('userId', result.userId);
    localStorage.setItem('balance', result.balance);  // Store balance in localStorage
  } else {
    // Authentication failed
    console.error('Authentication failed', result.message);
  }
}

// Send initData to backend for verification
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
