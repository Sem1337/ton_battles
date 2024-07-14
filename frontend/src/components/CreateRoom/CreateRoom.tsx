import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../../utils/auth';
import { useAuth } from '../../contexts/AuthContext';

const CreateGame = () => {
  const [minBet, setMinBet] = useState(0);
  const [maxBet, setMaxBet] = useState(0);
  const [maxPlayers, setMaxPlayers] = useState(0);
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleCreateGameRoom = async () => {
    console.log(minBet, maxBet, maxPlayers);
    const response = await authFetch(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/gamerooms`, token, {
      method: 'POST',
      body: JSON.stringify({ minBet, maxBet, maxPlayers }),
    });

    if (response.ok) {
      const data = await response.json();
      navigate(`/gameroom/${data.id}`);
    } else {
      console.error('Failed to create game room');
    }
  };

  const handleCancel = () => {
    navigate(-1); // Navigates to the previous page
  };

  return (
    <div>
      <h1>Create Game Room</h1>
      <label>
        Min Bet:
        <input type="number" value={minBet} onChange={(e) => setMinBet(Number(e.target.value))} />
      </label>
      <label>
        Max Bet:
        <input type="number" value={maxBet} onChange={(e) => setMaxBet(Number(e.target.value))} />
      </label>
      <label>
        Max Players:
        <input type="number" value={maxPlayers} onChange={(e) => setMaxPlayers(Number(e.target.value))} />
      </label>
      <button onClick={handleCreateGameRoom}>Create Game Room</button>
      <button onClick={handleCancel}>Cancel</button>
    </div>
  );
};

export default CreateGame;
