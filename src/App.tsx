import './App.css'
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
    <div style={{height: '140px'}}>
      <AddressInfo />
      <WalletInfo />
    </div>
    </>
  )
}



export default App
