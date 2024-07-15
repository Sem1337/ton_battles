import { useState, useEffect } from 'react'
import { authFetch } from '../../utils/auth' // Adjust the import path if necessary
import type { GameRoom, Player } from '../../types/types' // Import shared types
import Modal from 'react-modal'; // Import react-modal
import { useAuth } from '../../contexts/AuthContext'
import { useSocket } from '../../contexts/SocketContext'
import { useNavigate, useParams } from 'react-router-dom';


const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '80%', // Ensure the modal is not too wide on mobile
    maxWidth: '500px', // Add a maximum width
    padding: '20px', // Add padding for better spacing
    boxSizing: 'border-box' as const,// Ensure padding is included in the width calculation
    backgroundColor: '#fff', // Set background color
    color: '#000', // Set text color
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Set overlay background color
  },
};

const GameRoomComponent = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [betSize, setBetSize] = useState(0)
  const [players, setPlayers] = useState<Player[]>([])
  const [timer, setTimer] = useState(60)
  const [winner, setWinner] = useState<{ id: string, name: string, bet: number } | null>(null);
  const [totalBank, setTotalBank] = useState<number | null>(null);
  const { sendMessage, on, off, joinRoom, leaveRoom } = useSocket();
  const navigate = useNavigate();

  const fetchGameRoomDetails = async () => {
    sendMessage('JOIN_GAME', { roomId });
  }

  useEffect(() => {

    fetchGameRoomDetails()

    const interval = setInterval(() => {
      setTimer(prev => prev - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [roomId])

  useEffect(() => {
    joinRoom(roomId!);
    const handleBetMade = (playersData: Player[]) => {
      console.log(playersData);
      setPlayers(playersData);
    };

    const handleGameStarted = () => {
      sendMessage('JOIN_GAME', { roomId });
    };

    const handlePlayerJoined = (data: { players: Player[], remainingTime: number }) => {
      setPlayers(data.players);
      setTimer(data.remainingTime);
    };

    const handleGameCompleted = (data: { winner: { id: string, name: string, bet: number }, totalBank: number }) => {
      setWinner(data.winner);
      setTotalBank(data.totalBank);
    };

    on('GAME_STARTED', handleGameStarted);
    on('BET_MADE', handleBetMade);
    on('PLAYER_JOINED', handlePlayerJoined);
    on('GAME_COMPLETED', handleGameCompleted);

    return () => {
      off('GAME_STARTED');
      off('BET_MADE');
      off('PLAYER_JOINED');
      off('GAME_COMPLETED');
      leaveRoom(roomId!);
    };
  }, [on, off]);

  const makeBet = () => {
    sendMessage('MAKE_BET', {roomId, betSize});
  };

  const leaveGameRoom = async () => {
    navigate(-1); // Navigates to the previous page
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
      {winner && totalBank !== null && (
        <Modal
          isOpen={true}
          onRequestClose={() => { setWinner(null); setTotalBank(null); }}
          style={customStyles}
          contentLabel="Game Completed"
        >
          <h2>Game Completed</h2>
          <p>Winner: {winner.name} (Bet: {winner.bet})</p>
          <p>Total Bank: {totalBank}</p>
          <button onClick={() => { setWinner(null); setTotalBank(null); }}>Close</button>
        </Modal>
      )}
    </div>
  );
};

Modal.setAppElement('#root'); // To avoid screen readers issues

export default GameRoomComponent;