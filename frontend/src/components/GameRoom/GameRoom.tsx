import { useState, useEffect, useMemo, useCallback } from 'react'
import type { Player } from '../../types/types' // Import shared types
import Modal from 'react-modal'; // Import react-modal
import { useSocket } from '../../contexts/SocketContext'
import { useNavigate, useParams } from 'react-router-dom';
import PointsCounter from '../PointsCounter/PointsCounter';
import './GameRoom.css';

const GameRoomComponent = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [betSize, setBetSize] = useState('')
  const [roomName, setRoomName] = useState('')
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

    const handlePlayerJoined = (data: { players: Player[], remainingTime: number, roomName: string }) => {
      setPlayers(data.players);
      setTimer(data.remainingTime);
      setRoomName(data.roomName);
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
    <ul className="players-list">
      {players.map((player) => (
        <li key={player.id} className="player-item">
          {player.name}: {Number(player.bet).toString()}
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
        className="modal-content"
        overlayClassName="modal-overlay"
        contentLabel="Game Completed"
      >
        <h2 className="modal-title">Game Completed</h2>
        <p className="modal-winner">Winner: {winner.name} (Bet: {winner.bet})</p>
        <p className="modal-bank">Total Bank: {totalBank}</p>
        <button
          onClick={() => {
            setWinner(null);
            setTotalBank(null);
          }}
          className="modal-button"
        >
          Close
        </button>
      </Modal>
    )
  ), [winner, totalBank]);

  return (
    <div className="game-room-container">
      <h3 className="game-room-title">{roomName}</h3>
      <PointsCounter />
      <div className="timer">Time left: {timer} seconds</div>
      <div className="bet-section">
        <div className="bet-input-group">
          <label htmlFor="betSize" className="bet-label">
            Bet Size:
          </label>
          <input
            type="number"
            id="betSize"
            name="betSize"
            value={betSize}
            onChange={(e) => setBetSize(e.target.value)}
            className="bet-input"
          />
        </div>
        <div className="bet-buttons">
          <button onClick={makeBet} className="bet-button">
            Make Bet
          </button>
          <button onClick={leaveGameRoom} className="leave-button">
            Leave GameRoom
          </button>
        </div>
      </div>
      <div className="players-section">
        <h3 className="players-title">Players</h3>
        {memoizedPlayersList}
      </div>
      {memoizedModal}
    </div>
  );
};

Modal.setAppElement('#root'); // To avoid screen readers issues

export default GameRoomComponent;