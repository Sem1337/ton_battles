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
  }, []);

  const memoizedHeader = useMemo(() => (
    <div className="header">
      <h1 className="title">Welcome to TON Battles</h1>
      <p className="subtitle">Join a game or create your own battle room and start playing!</p>
    </div>
  ), []);

  const memoizedLinks = useMemo(() => (
    <div className="links">
      <Link to="/game-rooms" className="link-button">
        View Available Games
      </Link>
      <Link to="/create-room" className="link-button">
        Create Game Room
      </Link>
      <Link to="/shop" className="link-button">
        Shop
      </Link>
      <Link to="/referral" className="link-button referral">
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
