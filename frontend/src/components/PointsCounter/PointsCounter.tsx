import React, { useEffect, useState } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { User } from '../../types/types';
import './PointsCounter.css';

const PointsCounter: React.FC = () => {

  const [points, setPoints] = useState<number>(0);
  const [productionSpeed, setProductionSpeed] = useState<number>(0);

  const { sendMessage, on, off } = useSocket();
  useEffect(() => {

    const handlePointsUpdated = (data: User) => {
      setPoints(Number(data.points));
      setProductionSpeed(Number(data.productionSpeed));
    };

    const pointsIncrementInterval = setInterval(() => {
      setPoints(prevPoints => prevPoints + productionSpeed);
    }, 1000); // Increment points by productionSpeed every second

    const pointsUpdateInterval = setInterval(() => {
      updatePoints();
    }, 10000);

    const updatePoints = () => {
      sendMessage('UPDATE_POINTS');
    };

    on('USER_INFO', handlePointsUpdated);
    console.log('balance info use effect');
    sendMessage('GET_BALANCE');

    console.log('initial Points: ', points)
    if (points === 0) {
      updatePoints();
    }



    return () => {
      clearInterval(pointsIncrementInterval);
      clearInterval(pointsUpdateInterval);
      off('USER_INFO');
    };

  }, [productionSpeed]);

  return (
    <div className="points-counter">
      <h2 className="points-counter-title">Points: {points}</h2>
    </div>
  );
};

export default PointsCounter;
