import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  console.log("Home component rendered");
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-blue-600">Welcome to TON Battles</h1>
        <p className="text-lg mb-4">Join a game or create your own battle room and start playing!</p>
      </div>
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
    </div>
  );
};

export default Home;
