import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-cover bg-center" style={{ backgroundImage: `url(/test.png)` }}>
      <div className="text-center">
        <div className="loader mx-auto mb-4"></div>
        <p className="text-white text-2xl font-bold">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
