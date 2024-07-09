import './App.css'
import { Header } from './components/Header/Header'
import { AddressInfo } from './components/AddressInfo/AddressInfo'
import { WalletInfo } from './components/WalletInfo/WalletInfo'
import { SendTx } from './components/SendTx/SendTx'
import { BalanceInfo } from './components/BalanceInfo/BalanceInfo';
import { GameRoomList } from './components/GameRoomList/GameRoomList'
import { CreateRoom } from './components/CreateRoom/CreateRoom'
import { GameRoomComponent } from './components/GameRoom/GameRoom' // Adjust the import path if necessary
import { useState } from 'react'
//import { webSocketClient } from './utils/WebSocketClient' // Import WebSocket client


function App() {
  const [showGameRoomList, setShowGameRoomList] = useState(false)
  const [showCreateRoom, setShowCreateRoom] = useState(false)
  const [currentGameRoomId, setCurrentGameRoomId] = useState<string | null>(null) // State for current game room ID

  const handleJoinGameRoom = (roomId: string) => {
    setCurrentGameRoomId(roomId)
    setShowGameRoomList(false)
  }

  return (
    <>
    <Header />
    <div style={{height: '140px'}}>
      <AddressInfo />
      <WalletInfo />
    </div>
    <BalanceInfo />
    <SendTx/>
      <div style={{marginTop: '20px', textAlign: 'center'}}>
        <button onClick={() => setShowGameRoomList(true)}>Battles List</button>
        <button onClick={() => setShowCreateRoom(true)}>Create Room</button>
      </div>
      {showGameRoomList && (
        <GameRoomList 
          onClose={() => setShowGameRoomList(false)}
          onJoinGameRoom={handleJoinGameRoom} // Pass the handleJoinGameRoom function
        />
      )}
      {showCreateRoom && <CreateRoom onClose={() => setShowCreateRoom(false)} />}
      {currentGameRoomId && <GameRoomComponent roomId={currentGameRoomId} />} {/* Render GameRoomComponent when a game room is joined */}
    </>
  )
}



export default App
