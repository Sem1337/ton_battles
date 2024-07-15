import { Routes, Route } from 'react-router-dom';
import Home from './components/Home/Home';
import GameRoomComponent from './components/GameRoom/GameRoom';
import CreateGame from './components/CreateRoom/CreateRoom';
import Header from './components/Header/Header';

const App = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="ton_battles/" element={<Home />} />
          <Route path="/gameroom/:roomId" element={<GameRoomComponent />} />
          <Route path="/create-game" element={<CreateGame />} />
        </Routes>
      </main>
      <footer className="bg-gray-800 text-white text-center py-4">
        © 2024 TON Battles
      </footer>
    </div>
  );
};

export default App;
