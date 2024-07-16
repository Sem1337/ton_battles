import { useState, useEffect } from 'react'
import { authFetch } from '../../utils/auth' // Adjust the import path if necessary
import GameRoomCard from './GameRoomCard';
import type { GameRoom } from '../../types/types' // Import shared types
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom';

const GameRoomList = () => {
  const [gameRooms, setGameRooms] = useState<GameRoom[]>([])
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10); // Adjust limit as needed
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('roomName');
  const { token } = useAuth(); // Get the token from AuthContext
  const navigate = useNavigate(); // Get navigate function from useNavigate hook

  useEffect(() => {
    const fetchGameRooms = async () => {
      const response = await authFetch(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/gamerooms?page=${page}&limit=${limit}&sort=${sort}&filter=${filter}`, token)
      if (response.ok) {
        const data = await response.json()
        setGameRooms(data.data)
        setTotal(data.total)
      } else {
        // Handle error response
        console.error('Failed to fetch game rooms')
      }
    }
    fetchGameRooms()
  }, [page, limit, sort, filter])

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

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
    setPage(1); // Reset to first page when filtering
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value);
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Game Rooms</h2>
      <button
        onClick={() => navigate('/')} // Navigate to home on close
        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Close
      </button>
      <div className="mb-4">
        <label htmlFor="filter" className="mr-2">
          Room name:
        </label>
        <input
          id="filter"
          type="text"
          placeholder="Filter by name"
          value={filter}
          onChange={handleFilterChange}
          className="p-2 border rounded"
        />
        <label htmlFor="sortBy" className="ml-4">
          Sort by:
        </label>
        <select id="sortBy" value={sort} onChange={handleSortChange} className="ml-2 p-2 border rounded">
          <option value="roomName">Name</option>
          <option value="minBet">Min Bet</option>
          <option value="maxBet">Max Bet</option>
        </select>
      </div>
      <div className="max-h-96 overflow-y-scroll">
        {gameRooms.map(room => (
          <GameRoomCard key={room.id} room={room} onJoin={joinGameRoom} />
        ))}
      </div>
      <div className="flex justify-between mt-4">
        <button
          onClick={() => setPage(prev => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          Previous
        </button>
        <span>Page {page}</span>
        <button
          onClick={() => setPage(prev => (prev * limit < total ? prev + 1 : prev))}
          disabled={page * limit >= total}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default GameRoomList;