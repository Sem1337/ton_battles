import React, { useEffect, useState } from 'react';
import { useSocket } from '../../contexts/SocketContext';

const PointsCounter: React.FC = () => {

  const [points, setPoints] = useState<number>(0);
  const [productionSpeed, setProductionSpeed] = useState<number>(0);

  const { sendMessage, on, off } = useSocket();
  useEffect(() => {
    console.log('balance info use effect')
    sendMessage('GET_BALANCE');

    const handlePointsUpdated = (data: { points: number, productionSpeed: number }) => {
      setPoints(Number(data.points));
      setProductionSpeed(Number(data.productionSpeed));
    };

    on('POINTS_UPDATED', handlePointsUpdated);

    const updatePoints = () => {
      sendMessage('UPDATE_POINTS');
    };

    console.log('initial Points: ', points)
    if (points === 0) {
      updatePoints();
    }

    const pointsIncrementInterval = setInterval(() => {
      setPoints(prevPoints => prevPoints + productionSpeed);
    }, 1000); // Increment points by productionSpeed every second

    return () => {
      clearInterval(pointsIncrementInterval);
      off('POINTS_UPDATED');
    };

  }, [productionSpeed]);

  return (
    <div className="flex items-center justify-center bg-gray-100 p-4 rounded shadow-md">
      <h2 className="text-xl font-bold">Points: {points}</h2>
    </div>
  );
};

export default PointsCounter;
