import React, { useState } from 'react'
import { authFetch } from '../../utils/auth' // Adjust the import path if necessary

interface CreateRoomProps {
  onClose: () => void
}

export const CreateRoom: React.FC<CreateRoomProps> = ({ onClose }) => {
  const [minBet, setMinBet] = useState(0)
  const [maxBet, setMaxBet] = useState(0)
  const [maxPlayers, setMaxPlayers] = useState(0)

  const createRoom = async () => {
    const response = await authFetch(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/gamerooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ minBet, maxBet, maxPlayers })
    })
    if (response.ok) {
      const data = await response.json()
      console.log(`Created game room: ${data.id}`)
      onClose()
    } else {
      // Handle error response
      console.error('Failed to create game room')
    }
  }

  return (
    <div>
      <h2>Create Room</h2>
      <button onClick={onClose}>Close</button>
      <div>
        <label>
          Min Bet:
          <input type="number" value={minBet} onChange={e => setMinBet(Number(e.target.value))} />
        </label>
      </div>
      <div>
        <label>
          Max Bet:
          <input type="number" value={maxBet} onChange={e => setMaxBet(Number(e.target.value))} />
        </label>
      </div>
      <div>
        <label>
          Max Players:
          <input type="number" value={maxPlayers} onChange={e => setMaxPlayers(Number(e.target.value))} />
        </label>
      </div>
      <button onClick={createRoom}>Create</button>
    </div>
  )
}
