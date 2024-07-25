import { GameRoom } from '../../types/types';
import './GameRoomList.css';

interface GameRoomCardProps {
  room: GameRoom;
  onJoin: (roomId: string) => void;
}

const GameRoomCard = ({ room, onJoin }: GameRoomCardProps) => {
  return (
    <div onClick={() => onJoin(room.id)} className="game-room-card">
      <h3 className="room-name">{room.roomName}</h3>
      <p className="room-detail">Min Bet: {room.minBet}</p>
      <p className="room-detail">Max Bet: {room.maxBet}</p>
      <p className="room-players">
        Players: {room.currentPlayers}/{room.maxPlayers}
      </p>
    </div>
  );
};

export default GameRoomCard;
