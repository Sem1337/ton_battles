import './App.css'
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import WebApp from '@twa-dev/sdk'
import { Header } from './components/Header/Header'
import { AddressInfo } from './components/AddressInfo/AddressInfo'
import { WalletInfo } from './components/WalletInfo/WalletInfo'

/*
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
};*/



function App() {
  return (
    <>
    <Header />
    <AddressInfo />
    <WalletInfo />
    </>
  )
}



export default App
