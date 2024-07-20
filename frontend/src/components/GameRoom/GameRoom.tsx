import { useState, useEffect, useMemo, useCallback } from 'react'
import type { Player } from '../../types/types' // Import shared types
import Modal from 'react-modal'; // Import react-modal
import { useSocket } from '../../contexts/SocketContext'
import { useNavigate, useParams } from 'react-router-dom';
import PointsCounter from '../PointsCounter/PointsCounter';


const GameRoomComponent = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [betSize, setBetSize] = useState('')
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
    console.log('GameRoom rendered');
    joinRoom(roomId!);
    const interval = setInterval(() => {
      if (timer > 0) setTimer(prev => prev - 1)
    }, 1000);

    const handleBetMade = (playersData: Player[]) => {
      console.log(playersData);
      setPlayers(playersData);
    };

    const handleGameStarted = () => {
      sendMessage('JOIN_GAME', { roomId });
      sendMessage('UPDATE_POINTS');
    };

    const handlePlayerJoined = (data: { players: Player[], remainingTime: number }) => {
      setPlayers(data.players);
      setTimer(data.remainingTime);
    };


    const handleGameCompleted = (data: { winner: { id: string, name: string, bet: number }, totalBank: number }) => {
      setWinner(data.winner);
      setTotalBank(data.totalBank);
      sendMessage('GET_BALANCE');
    };

    on('GAME_STARTED', handleGameStarted);
    on('BET_MADE', handleBetMade);
    on('PLAYER_JOINED', handlePlayerJoined);
    on('GAME_COMPLETED', handleGameCompleted);
    fetchGameRoomDetails()
    return () => {
      console.log('return from gameRoom');
      off('GAME_STARTED');
      off('BET_MADE');
      off('PLAYER_JOINED');
      off('GAME_COMPLETED');
      clearInterval(interval)
      leaveRoom(roomId!);
    };
  }, [on, off]);

  const makeBet = useCallback(() => {
    sendMessage('MAKE_BET', { roomId, betSize });
  }, [roomId, betSize, sendMessage]);

  const leaveGameRoom = useCallback(async () => {
    navigate('/'); // Navigates to the previous page
  }, [navigate]);

  const memoizedPlayersList = useMemo(() => (
    <ul className="list-disc list-inside">
      {players.map((player) => (
        <li key={player.id}>
          {player.name}: {player.bet}
        </li>
      ))}
    </ul>
  ), [players]);

  const memoizedModal = useMemo(() => (
    winner && totalBank !== null && (
      <Modal
        isOpen={true}
        onRequestClose={() => {
          setWinner(null);
          setTotalBank(null);
        }}
        className="fixed inset-0 flex items-center justify-center z-50"
        contentLabel="Game Completed"
        overlayClassName="overlay-custom-style"
      >
        <h2 className="text-xl font-bold mb-4">Game Completed</h2>
        <p className="mb-2">Winner: {winner.name} (Bet: {winner.bet})</p>
        <p className="mb-4">Total Bank: {totalBank}</p>
        <button
          onClick={() => {
            setWinner(null);
            setTotalBank(null);
          }}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Close
        </button>
      </Modal>
    )
  ), [winner, totalBank]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4">
      <h2 className="text-3xl font-bold mb-4">Game Room {roomId}</h2>
      <PointsCounter />
      <div className="text-lg mb-4">Time left: {timer} seconds</div>
      <div className="flex flex-col items-center space-y-4 mb-4">
        <div className="flex flex-col items-center space-y-2">
          <label htmlFor="betSize" className="text-lg">Bet Size:</label>
          <input
            type="number"
            id="betSize"
            name="betSize"
            value={betSize}
            onChange={(e) => setBetSize(e.target.value)}
            className="p-2 border rounded text-black"
          />
        </div>
        <div className="flex space-x-4">
          <button
            onClick={makeBet}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Make Bet
          </button>
          <button
            onClick={leaveGameRoom}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Leave GameRoom
          </button>
        </div>
      </div>
      <div className="mb-4">
        <h3 className="text-2xl font-semibold mb-2">Players</h3>
        {memoizedPlayersList}
      </div>
      {memoizedModal}
    </div>
  );
};

Modal.setAppElement('#root'); // To avoid screen readers issues

export default GameRoomComponent;