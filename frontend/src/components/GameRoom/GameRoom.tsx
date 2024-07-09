import React, { useState, useEffect } from 'react'
import { authFetch } from '../../utils/auth' // Adjust the import path if necessary
import type { GameRoom, Player } from '../../types/types' // Import shared types

interface GameRoomProps {
  roomId: string
}

export const GameRoomComponent: React.FC<GameRoomProps> = ({ roomId }) => {
  const [betSize, setBetSize] = useState(0)
  const [players, setPlayers] = useState<Player[]>([])
  const [timer, setTimer] = useState(60)

  useEffect(() => {
    const fetchGameRoomDetails = async () => {
      const response = await authFetch(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/gamerooms/${roomId}`)
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

  const makeBet = async () => {
    const response = await authFetch(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/gamerooms/${roomId}/bets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ betSize })
    })
    if (response.ok) {
      const data: GameRoom = await response.json()
      setPlayers(data.players)
    } else {
      // Handle error response
      console.error('Failed to make a bet')
    }
  }

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