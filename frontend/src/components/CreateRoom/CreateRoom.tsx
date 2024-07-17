import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../../utils/auth';
import { useAuth } from '../../contexts/AuthContext';

const CreateGame = () => {
  const [minBet, setMinBet] = useState('');
  const [maxBet, setMaxBet] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('');
  const [roomName, setRoomName] = useState('');
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleCreateGameRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (roomName.trim() === '') {
      alert('Room name is required');
      return;
    }
    console.log(minBet, maxBet, maxPlayers, roomName);
    const response = await authFetch(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/gamerooms`, token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ minBet, maxBet, maxPlayers, roomName }),
    });

    if (response.ok) {
      const data = await response.json();
      navigate(`/game-room/${data.id}`);
    } else {
      console.error('Failed to create game room');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Create Game Room</h2>
      <form onSubmit={handleCreateGameRoom} className="space-y-4">
        <div>
          <label htmlFor="roomName" className="block text-sm font-medium text-gray-700">Room Name</label>
          <input
            type="text"
            id="roomName"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="minBet" className="block text-sm font-medium text-gray-700">Minimum Bet</label>
          <input
            type="number"
            id="minBet"
            value={minBet}
            onChange={(e) => setMinBet(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="maxBet" className="block text-sm font-medium text-gray-700">Maximum Bet</label>
          <input
            type="number"
            id="maxBet"
            value={maxBet}
            onChange={(e) => setMaxBet(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="maxPlayers" className="block text-sm font-medium text-gray-700">Maximum Players</label>
          <input
            type="number"
            id="maxPlayers"
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded"
        >
          Create Room
        </button>
      </form>
      <button
        onClick={() => navigate('/')}
        className="bg-gray-500 text-white py-2 px-4 rounded mt-4"
      >
        Cancel
      </button>
    </div>
  );
};

export default CreateGame;
