// src/components/GameRoomCard.tsx
import { GameRoom } from '../../types/types';

interface GameRoomCardProps {
  room: GameRoom;
  onJoin: (roomId: string) => void;
}

const GameRoomCard = ({ room, onJoin }: GameRoomCardProps) => {
  return (
    <div
      onClick={() => onJoin(room.id)}
      className="border border-gray-400 p-4 mb-4 rounded cursor-pointer hover:bg-gray-100"
    >
      <h3 className="text-lg font-bold">{room.roomName}</h3>
      <p className="font-semibold">Min Bet: {room.minBet}</p>
      <p className="font-semibold">Max Bet: {room.maxBet}</p>
      <p>Players: {room.currentPlayers}/{room.maxPlayers}</p>
    </div>
  );
};

export default GameRoomCard;
