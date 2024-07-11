import React, { useState, useEffect } from 'react'
import { authFetch } from '../../utils/auth' // Adjust the import path if necessary
import type { GameRoom, Player } from '../../types/types' // Import shared types
import { useAuth } from '../../contexts/AuthContext'
import { useSocket } from '../../contexts/SocketContext'

interface GameRoomProps {
  roomId: string
}

export const GameRoomComponent: React.FC<GameRoomProps> = ({ roomId }) => {
  const [betSize, setBetSize] = useState(0)
  const [players, setPlayers] = useState<Player[]>([])
  const [timer, setTimer] = useState(60)
  const { token } = useAuth(); // Get the token from AuthContext
  const { sendMessage, on, off } = useSocket();

  const fetchGameRoomDetails = async () => {
    const response = await authFetch(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/gamerooms/${roomId}`, token)
    if (response.ok) {
      const data: GameRoom = await response.json()
      setPlayers(data.players)
      setTimer(60); // Reset timer to 60 seconds
    } else {
      // Handle error response
      console.error('Failed to fetch game room details')
    }
  }

  useEffect(() => {

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

    const handleGameCompleted = async () => {
      await fetchGameRoomDetails(); // Fetch updated game room details
    };

    on('BET_MADE', handleBetMade);
    on('GAME_COMPLETED', handleGameCompleted);

    return () => {
      off('BET_MADE');
      off('GAME_COMPLETED');
    };
  }, [on, off]);

  const makeBet = () => {
    sendMessage('MAKE_BET', {roomId, betSize});
  };

  const leaveGameRoom = async () => {
    try {
      const response = await authFetch(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/gamerooms/${roomId}/leave`, token, {
        method: 'POST',
      });
      if (response.ok) {
        const data: GameRoom = await response.json();
        setPlayers(data.players);
        if (data.status === 'closed') {
          // Handle game room closure, e.g., navigate to a different page
          alert('Game room has been closed due to no players.');
        }
      } else {
        console.error('Failed to leave game room');
      }
    } catch (error) {
      console.error('Error leaving game room', error);
    }
  };

  return (
    <div>
      <h2>Game Room {roomId}</h2>
      <div>Time left: {timer} seconds</div>
      <div>
      <label htmlFor="betSize">Bet Size:</label>
        <input
          type="number"
          id="betSize"
          name="betSize"
          value={betSize}
          onChange={(e) => setBetSize(Number(e.target.value))}
        />
        <button onClick={makeBet}>Make Bet</button>
        <button onClick={leaveGameRoom}>Leave GameRoom</button>
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