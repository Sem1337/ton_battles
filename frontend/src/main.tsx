import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import WebApp from '@twa-dev/sdk'
import { TonConnectUIProvider } from '@tonconnect/ui-react'

WebApp.ready();

// Function to parse query string
function parseQuery(queryString: string) {
  console.error(queryString);
  const query: { [key: string]: string } = {};
  const pairs = (queryString[0] === '?' ? queryString.slice(1) : queryString).split('&');
  for (const pair of pairs) {
    const [key, value] = pair.split('=');
    query[decodeURIComponent(key)] = decodeURIComponent(value || '');
  }
  return query;
}

// Extract authData from the URL
const authData = parseQuery(window.location.search);

// Function to send authData to backend
async function authenticateUser(authData: { [key: string]: string }) {
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
authenticateUser(authData);


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TonConnectUIProvider 
      manifestUrl="https://sem1337.github.io/ton_battles/tonconnect-manifest.json"
    >
      <App />
    </TonConnectUIProvider>
  </React.StrictMode>,
)
