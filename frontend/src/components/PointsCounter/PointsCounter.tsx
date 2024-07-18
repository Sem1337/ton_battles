import React from 'react';

interface PointsCounterProps {
  points: number;
}

const PointsCounter: React.FC<PointsCounterProps> = ({ points }) => {
  return (
    <div className="flex items-center justify-center bg-gray-100 p-4 rounded shadow-md">
      <h2 className="text-xl font-bold">Points: {points}</h2>
    </div>
  );
};

export default PointsCounter;
