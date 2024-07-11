import React, { useState } from 'react'
import { authFetch } from '../../utils/auth' // Adjust the import path if necessary
import { useAuth } from '../../contexts/AuthContext'

interface CreateRoomProps {
  onClose: () => void
  onCreateGameRoom: (roomId: string) => void // Add onCreateGameRoom prop
}

export const CreateRoom: React.FC<CreateRoomProps> = ({ onClose, onCreateGameRoom }) => {
  const [minBet, setMinBet] = useState(0)
  const [maxBet, setMaxBet] = useState(0)
  const [maxPlayers, setMaxPlayers] = useState(0)
  const { token } = useAuth(); // Get the token from AuthContext

  const createRoom = async () => {
    const response = await authFetch(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/gamerooms`, token, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ minBet, maxBet, maxPlayers })
    })
    if (response.ok) {
      const data = await response.json()
      console.log(`Created game room: ${data.id}`)
      onCreateGameRoom(data.id)
    } else {
      // Handle error response
      console.error('Failed to create game room')
    }
  }

  return (
    <div>
      <h2>Create Room</h2>
      <div>
        <label htmlFor="minBet">Min Bet:</label>
        <input
          type="number"
          id="minBet"
          name="minBet"
          value={minBet}
          onChange={(e) => setMinBet(Number(e.target.value))}
        />
      </div>
      <div>
        <label htmlFor="maxBet">Max Bet:</label>
        <input
          type="number"
          id="maxBet"
          name="maxBet"
          value={maxBet}
          onChange={(e) => setMaxBet(Number(e.target.value))}
        />
      </div>
      <div>
        <label htmlFor="maxPlayers">Max Players:</label>
        <input
          type="number"
          id="maxPlayers"
          name="maxPlayers"
          value={maxPlayers}
          onChange={(e) => setMaxPlayers(Number(e.target.value))}
        />
      </div>
      <button onClick={createRoom}>Create Room</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  )
}
