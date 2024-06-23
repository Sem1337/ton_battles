import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import WebApp from '@twa-dev/sdk'
import { TonConnectUIProvider, TonConnectButton, useTonAddress, useTonWallet } from '@tonconnect/ui-react';

export const Address = () => {
  const userFriendlyAddress = useTonAddress();
  const rawAddress = useTonAddress(false);

  return (
    userFriendlyAddress && (
          <div>
              <span>User-friendly address: {userFriendlyAddress}</span>
              <span>Raw address: {rawAddress}</span>
          </div>
      )
  );
};

export const Wallet = () => {
  const wallet = useTonWallet();

  return (
      wallet && (
          <div>
              <span>Connected wallet: {wallet.account.address}</span>
              <span>Device: {wallet.device.appName}</span>
          </div>
      )
  );
};

export const Header = () => {
  return (
      <header>
          <TonConnectButton />
          <Address />
          <Wallet />
      </header>
  );
};

function App() {
  const [count, setCount] = useState(0)
  return (
    <TonConnectUIProvider 
      manifestUrl="https://sem1337.github.io/tonconnect-manifest.json"
      actionsConfiguration={{
        twaReturnUrl: 'https://t.me/ton_battles_bot'
      }}
    > 
    {
      <>
      <Header />
        <div>
          <a href="https://vitejs.dev" target="_blank">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>
        <h1>Vite + React</h1>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
        </div>
          {/* Here we add our button with alert callback */}
        <div className="card">
          <button onClick={() => WebApp.showAlert(`Hello World! Current count is ${count}`)}>
              Show Alert
          </button>
        </div>
      </>
    }
    </TonConnectUIProvider>
  )
}



export default App
