import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../../utils/auth';
import { useAuth } from '../../contexts/AuthContext';

const CreateGame = () => {
  const [gameType, setGameType] = useState<'points' | 'gems' | 'TON'>('points');
  const [minBet, setMinBet] = useState<number | ''>('');
  const [maxBet, setMaxBet] = useState<number | ''>('');
  const [maxPlayers, setMaxPlayers] = useState<number | ''>('');
  const [roomName, setRoomName] = useState('');
  const [isUnlimited, setIsUnlimited] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleMinBetChange = (value: string) => {
    const numberValue = parseFloat(value);
    if (!isNaN(numberValue)) {
      setMinBet(numberValue);
    } else {
      setMinBet('');
    }
  };

  const handleCreateGameRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (roomName.trim() === '') {
      alert('Room name is required');
      return;
    }
    const minBetValue =
      gameType === 'points'
        ? Math.max(minBet || 0, 10)
        : gameType === 'gems'
        ? Math.max(minBet || 0, 1)
        : Math.max(minBet || 0, 0.1);
    const maxBetValue = isUnlimited ? Infinity : maxBet;

    console.log(minBetValue, maxBetValue, maxPlayers, roomName, gameType);

    const response = await authFetch(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/gamerooms`, token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameType, minBet: minBetValue, maxBet: maxBetValue, maxPlayers, roomName }),
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
          <label htmlFor="gameType" className="block text-sm font-medium text-gray-700">Game Type</label>
          <select
            id="gameType"
            value={gameType}
            onChange={(e) => setGameType(e.target.value as 'points' | 'gems' | 'TON')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="points">Points</option>
            <option value="gems">Gems</option>
            <option value="TON">TON</option>
          </select>
        </div>
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
            value={minBet !== '' ? minBet : ''}
            onChange={(e) => handleMinBetChange(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
            step={gameType === 'TON' ? 0.1 : 1}
            min={gameType === 'points' ? 10 : gameType === 'gems' ? 1 : 0.1}
          />
        </div>
        <div>
          <label htmlFor="maxBet" className="block text-sm font-medium text-gray-700">Maximum Bet</label>
          <input
            type="number"
            id="maxBet"
            value={maxBet !== '' ? maxBet : ''}
            onChange={(e) => setMaxBet(parseFloat(e.target.value) || '')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            disabled={isUnlimited}
            required={!isUnlimited}
            step={gameType === 'TON' ? 0.1 : 1}
          />
          <div className="mt-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isUnlimited}
                onChange={() => setIsUnlimited(!isUnlimited)}
                className="mr-2"
              />
              Unlimited Max Bet
            </label>
          </div>
        </div>
        <div>
          <label htmlFor="maxPlayers" className="block text-sm font-medium text-gray-700">Maximum Players</label>
          <input
            type="number"
            id="maxPlayers"
            value={maxPlayers !== '' ? maxPlayers : ''}
            onChange={(e) => setMaxPlayers(parseInt(e.target.value, 10) || '')}
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
