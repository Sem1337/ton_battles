import { Routes, Route } from 'react-router-dom';
import Home from './components/Home/Home';
import GameRoomComponent from './components/GameRoom/GameRoom';
import CreateGame from './components/CreateRoom/CreateRoom';
import Header from './components/Header/Header';

const App = () => {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="ton_battles/" element={<Home />} />
        <Route path="/gameroom/:roomId" element={<GameRoomComponent />} />
        <Route path="/create-game" element={<CreateGame />} />
      </Routes>
    </div>
  );
};

export default App;
