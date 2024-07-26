import { useState, useEffect } from 'react';
import GameRoomCard from './GameRoomCard';
import type { GameRoom } from '../../types/types'; // Import shared types
import { useNavigate } from 'react-router-dom';
import './GameRoomList.css';
import { useAuth } from '../../contexts/AuthContext';

const GameRoomList = () => {
  const [gameRooms, setGameRooms] = useState<GameRoom[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10); // Adjust limit as needed
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('roomName');
  const [selectedTab, setSelectedTab] = useState<'points' | 'gems' | 'TON'>('points');
  const navigate = useNavigate(); // Get navigate function from useNavigate hook
  const { authFetch } = useAuth();

  useEffect(() => {
    const fetchGameRooms = async () => {
      const response = await authFetch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/gamerooms?page=${page}&limit=${limit}&sort=${sort}&filter=${filter}&gameType=${selectedTab}`);
      if (response.ok) {
        const data = await response.json();
        setGameRooms(data.data);
        setTotal(data.total);
      } else {
        // Handle error response
        console.error('Failed to fetch game rooms');
      }
    };
    fetchGameRooms();
  }, [page, limit, sort, filter, selectedTab]);

  const joinGameRoom = async (roomId: string) => {
    const response = await authFetch(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/gamerooms/${roomId}/join`, {
      method: 'POST',
    });
    if (response.ok) {
      navigate(`/game-room/${roomId}`); // Call onJoinGameRoom when a game room is joined
    } else {
      // Handle error response
      console.error('Failed to join game room');
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
    setPage(1); // Reset to first page when filtering
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value);
  };

  return (
    <div className="game-room-list-container">
      <h2 className="title">Game Rooms</h2>
      <button
        onClick={() => navigate('/')} // Navigate to home on close
        className="close-button"
      >
        Close
      </button>
      <div className="filter-sort-container">
        <label htmlFor="filter" className="filter-label">
          Room name:
        </label>
        <input
          id="filter"
          type="text"
          placeholder="Filter by name"
          value={filter}
          onChange={handleFilterChange}
          className="filter-input"
        />
        <label htmlFor="sortBy" className="sort-label">
          Sort by:
        </label>
        <select id="sortBy" value={sort} onChange={handleSortChange} className="sort-select">
          <option value="roomName">Name</option>
          <option value="minBet">Min Bet</option>
          <option value="maxBet">Max Bet</option>
          <option value="maxPlayers">Max Players</option>
          <option value="currentPlayers">Current Players</option>
        </select>
      </div>
      <div className="tab-buttons">
        {['points', 'gems', 'TON'].map((type) => (
          <button
            key={type}
            onClick={() => setSelectedTab(type as 'points' | 'gems' | 'TON')}
            className={`tab-button ${selectedTab === type ? 'active' : ''}`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>
      <div className="game-room-cards">
        {gameRooms.map((room) => (
          <GameRoomCard key={room.id} room={room} onJoin={joinGameRoom} />
        ))}
      </div>
      <div className="pagination">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="pagination-button"
        >
          Previous
        </button>
        <span>Page {page}</span>
        <button
          onClick={() => setPage((prev) => (prev * limit < total ? prev + 1 : prev))}
          disabled={page * limit >= total}
          className="pagination-button"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default GameRoomList;
