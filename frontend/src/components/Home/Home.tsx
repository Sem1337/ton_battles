import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameRoomList from '../GameRoomList/GameRoomList';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [showGameRooms, setShowGameRooms] = useState(false);

  const handleJoinGameRoom = (roomId: string) => {
    navigate(`/gameroom/${roomId}`);
  };

  return (
    <div>
      <h1>Welcome to the Game</h1>
      <button onClick={() => setShowGameRooms(true)}>View Available Games</button>
      <button onClick={() => navigate('/create-game')}>Create Game Room</button>
      
      {showGameRooms && (
        <GameRoomList 
          onClose={() => setShowGameRooms(false)}
          onJoinGameRoom={handleJoinGameRoom}
        />
      )}
    </div>
  );
};

export default Home;
