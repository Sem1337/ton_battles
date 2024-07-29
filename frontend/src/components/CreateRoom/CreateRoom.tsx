import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateRoom.css';
import { useAuth } from '../../contexts/AuthContext';

const CreateGame = () => {
  const [gameType, setGameType] = useState<'points' | 'gems' | 'TON'>('points');
  const [minBet, setMinBet] = useState<number | ''>('');
  const [maxBet, setMaxBet] = useState<number | ''>('');
  const [maxPlayers, setMaxPlayers] = useState<number | ''>('');
  const [roomName, setRoomName] = useState('');
  const [isUnlimited, setIsUnlimited] = useState(false);
  const navigate = useNavigate();
  const { authFetch } = useAuth();

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

    const response = await authFetch(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/gamerooms`, {
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
    <div className="create-room-container">
      <h2 className="create-room-title">Create Game Room</h2>
      <form onSubmit={handleCreateGameRoom} className="create-room-form">
        <div className="form-group">
          <label htmlFor="gameType" className="form-label">Game Type</label>
          <select
            id="gameType"
            value={gameType}
            onChange={(e) => setGameType(e.target.value as 'points' | 'gems' | 'TON')}
            className="form-input"
          >
            <option value="points">Points</option>
            <option value="gems">Gems</option>
            <option value="TON">TON</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="roomName" className="form-label">Room Name</label>
          <input
            type="text"
            id="roomName"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="form-input"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="minBet" className="form-label">Minimum Bet</label>
          <input
            type="number"
            id="minBet"
            value={minBet !== '' ? minBet : ''}
            onChange={(e) => handleMinBetChange(e.target.value)}
            className="form-input"
            required
            step={gameType === 'TON' ? 0.1 : 1}
            min={gameType === 'points' ? 10 : gameType === 'gems' ? 1 : 0.1}
          />
        </div>
        <div className="form-group">
          <label htmlFor="maxBet" className="form-label">Maximum Bet</label>
          <input
            type="number"
            id="maxBet"
            value={maxBet !== '' ? maxBet : ''}
            onChange={(e) => setMaxBet(parseFloat(e.target.value) || '')}
            className="form-input"
            disabled={isUnlimited}
            required={!isUnlimited}
            step={gameType === 'TON' ? 0.1 : 1}
          />
          <div className="form-checkbox">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isUnlimited}
                onChange={() => setIsUnlimited(!isUnlimited)}
                className="checkbox-input"
              />
              Unlimited Max Bet
            </label>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="maxPlayers" className="form-label">Maximum Players</label>
          <input
            type="number"
            id="maxPlayers"
            value={maxPlayers !== '' ? maxPlayers : ''}
            onChange={(e) => setMaxPlayers(parseInt(e.target.value, 10) || '')}
            className="form-input"
            required
            max={100}
            min={2}
          />
        </div>
        <button
          type="submit"
          className="form-button create-room-button"
        >
          Create Room
        </button>
      </form>
      <button
        onClick={() => navigate('/')}
        className="form-button cancel-button"
      >
        Cancel
      </button>
    </div>
  );
};

export default CreateGame;
