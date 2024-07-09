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
  }
  
  export interface Game {
    gameId: string
    gameRoomId: string
    total_bank: number
    winner_id: string
    winnerBetSize: number
  }
  