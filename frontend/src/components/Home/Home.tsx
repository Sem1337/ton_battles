import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSocket } from '../../contexts/SocketContext';
import PointsCounter from '../PointsCounter/PointsCounter'

const Home: React.FC = () => {
  const [points, setPoints] = useState<number>(0);
  const { sendMessage, on, off } = useSocket();
  useEffect(() => {
    console.log('balance info use effect')
    sendMessage('GET_BALANCE');

    const handlePointsUpdated = (data: { points: number }) => {
      setPoints(data.points);
    };

    on('POINTS_UPDATED', handlePointsUpdated);

    const updatePoints = () => {
      sendMessage('UPDATE_POINTS');
    };

    console.log('initial Points: ', points)
    if (points === 0) {
      updatePoints();
    }

    const interval = setInterval(updatePoints, 10000); // Update every 10 seconds

    return () => {
      clearInterval(interval);
      off('POINTS_UPDATED');
    };

  }, []);

  const memoizedHeader = useMemo(() => (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold mb-4 text-blue-600">Welcome to TON Battles</h1>
      <p className="text-lg mb-4">Join a game or create your own battle room and start playing!</p>
    </div>
  ), []);

  const memoizedLinks = useMemo(() => (
    <div className="flex space-x-4">
      <Link
        to="/game-rooms"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        View Available Games
      </Link>
      <Link
        to="/create-room"
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        Create Game Room
      </Link>
    </div>
  ), []);

  console.log("Home component rendered");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {memoizedHeader}
      <PointsCounter points={points} />
      {memoizedLinks}
    </div>
  );
};

export default Home;
