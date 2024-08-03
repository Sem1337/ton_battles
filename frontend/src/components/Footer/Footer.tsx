import React from 'react';
import { useSocket } from '../../contexts/SocketContext';

const Footer: React.FC = () => {
  const { onlineUsers } = useSocket();

  return (
    <footer className="footer">
      <div className="online-users">Online Users: {onlineUsers}</div>
      <div>© 2024 TON Battles</div>
    </footer>
  );
};

export default Footer;
