import React, { useState, useEffect } from 'react'
import { authFetch } from '../../utils/auth' // Adjust the import path if necessary

import type { GameRoom } from '../../types/types' // Import shared types
import { useAuth } from '../../contexts/AuthContext'

interface GameRoomListProps {
  onClose: () => void
  onJoinGameRoom: (roomId: string) => void // Add onJoinGameRoom prop
}

export const GameRoomList: React.FC<GameRoomListProps> = ({ onClose, onJoinGameRoom }) => {
  const [gameRooms, setGameRooms] = useState<GameRoom[]>([])
  const { token } = useAuth(); // Get the token from AuthContext

  useEffect(() => {
    const fetchGameRooms = async () => {
      const response = await authFetch(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/gamerooms`, token)
      if (response.ok) {
        const data: GameRoom[] = await response.json()
        setGameRooms(data)
      } else {
        // Handle error response
        console.error('Failed to fetch game rooms')
      }
    }
    fetchGameRooms()
  }, [])

  const joinGameRoom = async (roomId: string) => {
    const response = await authFetch(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/gamerooms/${roomId}/join`, token, {
      method: 'POST'
    })
    if (response.ok) {
      onJoinGameRoom(roomId) // Call onJoinGameRoom when a game room is joined
    } else {
      // Handle error response
      console.error('Failed to join game room')
    }
  }

  return (
    <div>
      <h2>Game Rooms</h2>
      <button onClick={onClose}>Close</button>
      <div style={{ maxHeight: '400px', overflowY: 'scroll' }}>
        {gameRooms.map(room => (
          <div key={room.id} onClick={() => joinGameRoom(room.id)} style={{ border: '1px solid black', padding: '10px', margin: '5px', cursor: 'pointer' }}>
            <p>Min Bet: {room.minBet}</p>
            <p>Max Bet: {room.maxBet}</p>
            <p>Players: {room.players.length}/{room.maxPlayers}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameRoomList;