import './App.css'
import { Header } from './components/Header/Header'
import { AddressInfo } from './components/AddressInfo/AddressInfo'
import { WalletInfo } from './components/WalletInfo/WalletInfo'
import { SendTx } from './components/SendTx/SendTx'
//import { BalanceInfo } from './components/BalanceInfo/BalanceInfo';

function App() {
  return (
    <>
    <Header />
    <div style={{height: '140px'}}>
      <AddressInfo />
      <WalletInfo />
    </div>
  
    <SendTx/>
    </>
  )
}



export default App
