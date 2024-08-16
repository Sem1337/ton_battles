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
  const [totalBank, setTotalBank] = useState<number>(0);
  const [prevTotalBank, setPrevTotalBank] = useState<number>(0);
  const { sendMessage, on, off, joinRoom, leaveRoom } = useSocket();
  const navigate = useNavigate();

  const fetchGameRoomDetails = async () => {
    sendMessage('JOIN_GAME', { roomId });
  }

  useEffect(() => {
    console.log('GameRoom rendered');
    joinRoom(roomId!);
    const interval = setInterval(() => {
      setTimer(prevTimer => {
        if (prevTimer > 0) {
          return prevTimer - 1;
        } else {
          return 0;
        }
      });
    }, 1000);

    const handleBetMade = (data: {players: Player[], totalbank: number}) => {
      console.log(data.players);
      setPlayers(data.players);
      setTotalBank(data.totalbank);  // Set the total bank
    };

    const handleGameStarted = () => {
      sendMessage('JOIN_GAME', { roomId });
      sendMessage('UPDATE_POINTS');
    };

    const handlePlayerJoined = (data: { players: Player[], remainingTime: number, roomName: string, totalbank: number }) => {
      setPlayers(data.players);
      setTimer(data.remainingTime);
      setRoomName(data.roomName);
      setTotalBank(data.totalbank);
    };


    const handleGameCompleted = (data: { winner: { id: string, name: string, bet: number }, totalBank: number }) => {
      console.log('winner: ', winner);
      console.log('received game result: ', data.winner?.name, data.winner?.bet, data.totalBank);
      setTotalBank(data.totalBank);
      setPrevTotalBank(data.totalBank);
      setWinner(data.winner);
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
  }, []);

  const makeBet = useCallback(() => {
    sendMessage('MAKE_BET', { roomId, betSize });
  }, [roomId, betSize, sendMessage]);

  const leaveGameRoom = useCallback(async () => {
    navigate('/'); // Navigates to the previous page
  }, [navigate]);

  const memoizedPlayersList = useMemo(() => (
    <table className="players-list-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Bet</th>
          <th>Win Chance</th>
        </tr>
      </thead>
      <tbody>
        {players.map((player) => {
          const winChance = totalBank > 0 ? (Number(player.bet) / totalBank) * 100 : 0;
          return (
            <tr key={player.id} className="player-item">
              <td>{player.name}</td>
              <td>{Number(player.bet).toFixed(2)}</td>
              <td>{winChance.toFixed(2)}%</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  ), [players, totalBank]);

  const memoizedModal = useMemo(() => (
    winner && (
      <Modal
        isOpen={true}
        onRequestClose={() => {
          setWinner(null);
          setPrevTotalBank(0);
        }}
        className="modal-content"
        overlayClassName="modal-overlay"
        contentLabel="Game Completed"
      >
        <h2 className="modal-title">Game Completed</h2>
        <p className="modal-winner">Winner: {winner.name} (Bet: {Number(winner.bet).toString()})</p>
        <p className="modal-bank">Total Bank: {Number(prevTotalBank).toString()}</p>
        <button
          onClick={() => {
            setWinner(null);
            setPrevTotalBank(0);
          }}
          className="modal-button"
        >
          Close
        </button>
      </Modal>
    )
  ), [winner]);

  return (
    <div className="game-room-container">
      <h3 className="game-room-title">{roomName}</h3>
      <p className="total-bank">Total Bank: {Number(totalBank).toString()}</p>
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