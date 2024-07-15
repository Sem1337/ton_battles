import { useState, useEffect } from 'react'
import { authFetch } from '../../utils/auth' // Adjust the import path if necessary
import GameRoomCard from './GameRoomCard';
import type { GameRoom } from '../../types/types' // Import shared types
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom';

const GameRoomList = () => {
  const [gameRooms, setGameRooms] = useState<GameRoom[]>([])
  const { token } = useAuth(); // Get the token from AuthContext
  const navigate = useNavigate(); // Get navigate function from useNavigate hook

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
      navigate(`/game-room/${roomId}`); // Call onJoinGameRoom when a game room is joined
    } else {
      // Handle error response
      console.error('Failed to join game room')
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Game Rooms</h2>
      <button
        onClick={() => navigate('ton_battles/')} // Navigate to home on close
        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Close
      </button>
      <div className="max-h-96 overflow-y-scroll">
        {gameRooms.map(room => (
          <GameRoomCard key={room.id} room={room} onJoin={joinGameRoom} />
        ))}
      </div>
    </div>
  );
};

export default GameRoomList;