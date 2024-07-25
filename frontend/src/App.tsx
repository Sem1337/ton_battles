import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home/Home';
import GameRoomComponent from './components/GameRoom/GameRoom';
import CreateGame from './components/CreateRoom/CreateRoom';
import Header from './components/Header/Header';
import GameRoomList from './components/GameRoomList/GameRoomList';
import Shop from './components/Shop/Shop';
import TasksList from './components/TasksList/TasksList';
import ReferralPage from './components/ReferralPage/ReferralPage';
import { Toaster } from 'react-hot-toast';
import './App.css';

const App = () => {
  return (
    <div className="App">
      <Toaster
        position="top-center"
        reverseOrder={false}
      />
      <Header />
      <main className="main-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game-rooms" element={<GameRoomList />} />
          <Route path="/game-room/:roomId" element={<GameRoomComponent />} />
          <Route path="/create-room" element={<CreateGame />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/tasks" element={<TasksList />} />
          <Route path="/referral" element={<ReferralPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <footer className="footer">
        © 2024 TON Battles
      </footer>
    </div>
  );
};

export default App;
