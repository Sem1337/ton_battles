export interface Player {
  id: string
  bet: number
  name: string
  gameRoomId: string
}

export interface GameRoom {
  id: string
  minBet: number
  maxBet: number
  maxPlayers: number
  total_bank: number
  status: 'active' | 'closed'
  currentGameId?: string
  players: Player[]
  roomName: string; // Add this line
  currentPlayers: number
}

export interface Game {
  gameId: string
  gameRoomId: string
  total_bank: number
  winner_id: string
  winnerBetSize: number
}

export interface User {
  userId: number,
  username: string,
  balance: string,
  points: number,
  gems: number,
  productionSpeed: number,
  shieldLVL: number,
}

export interface Task {
  id: string;
  taskName: string;
  taskDescription: string;
  reward: string;
  payload: string;
  completed: boolean;
  actionType: 'url' | 'transaction' | 'other'; // Add action types as needed
}
