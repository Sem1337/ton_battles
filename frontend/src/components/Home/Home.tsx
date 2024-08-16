import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSocket } from '../../contexts/SocketContext';
import PointsCounter from '../PointsCounter/PointsCounter';
import './Home.css';

const Home: React.FC = () => {
  const { sendMessage } = useSocket();
  useEffect(() => {
    console.log('balance info use effect');
    sendMessage('GET_BALANCE');
  }, [sendMessage]);

  const memoizedHeader = useMemo(() => (
    <div className="home-header">
      <h1 className="home-title">Welcome to TON Battles</h1>
      <p className="home-subtitle">Join a game or create your own battle room and start playing!</p>
    </div>
  ), []);

  const memoizedLinks = useMemo(() => (
    <div className="home-links">
      <Link to="/game-rooms" className="home-button">
        View Available Games
      </Link>
      <Link to="/create-room" className="home-button">
        Create Game Room
      </Link>
      <Link to="/shop" className="home-button">
        Shop
      </Link>
      <Link to="/referral" className="home-button">
        Referral Page
      </Link>
    </div>
  ), []);

  return (
    <div className="home-container">
      {memoizedHeader}
      <PointsCounter />
      {memoizedLinks}
    </div>
  );
};

export default Home;
