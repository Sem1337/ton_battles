import React, { useState, useEffect } from 'react'
import { authFetch } from '../../utils/auth' // Adjust the import path if necessary
import type { GameRoom, Player } from '../../types/types' // Import shared types
import { useAuth } from '../AuthContext'
import { webSocketClient } from '../../utils/WebSocketClient'

interface GameRoomProps {
  roomId: string
}

export const GameRoomComponent: React.FC<GameRoomProps> = ({ roomId }) => {
  const [betSize, setBetSize] = useState(0)
  const [players, setPlayers] = useState<Player[]>([])
  const [timer, setTimer] = useState(60)
  const { token } = useAuth(); // Get the token from AuthContext

  useEffect(() => {
    const fetchGameRoomDetails = async () => {
      const response = await authFetch(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/gamerooms/${roomId}`, token)
      if (response.ok) {
        const data: GameRoom = await response.json()
        setPlayers(data.players)
      } else {
        // Handle error response
        console.error('Failed to fetch game room details')
      }
    }
    fetchGameRoomDetails()

    const interval = setInterval(() => {
      setTimer(prev => prev - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [roomId])

  useEffect(() => {
    const handleBetMade = (data: { players: Player[] }) => {
      setPlayers(data.players);
    };

    webSocketClient.on('BET_MADE', handleBetMade);

    // Cleanup listener on component unmount
    return () => {
      webSocketClient.off('BET_MADE', handleBetMade);
    };
  }, []);

  const makeBet = () => {
    webSocketClient.sendMessage({ type: 'MAKE_BET', roomId, betSize });
  };

  return (
    <div>
      <h2>Game Room {roomId}</h2>
      <div>Time left: {timer} seconds</div>
      <div>
        <label>
          Bet Size:
          <input type="number" value={betSize} onChange={e => setBetSize(Number(e.target.value))} />
        </label>
        <button onClick={makeBet}>Make Bet</button>
      </div>
      <div>
        <h3>Players</h3>
        <ul>
          {players.map(player => (
            <li key={player.id}>{player.name}: {player.bet}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}