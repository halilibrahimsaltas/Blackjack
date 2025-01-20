import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import RoomDetails from '../components/RoomDetails';
import { toast } from 'react-hot-toast';

const RoomContainer = ({ user }) => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [room, setRoom] = useState(null);
  const [countdown, setCountdown] = useState(null);

  // Socket.io bağlantısı
  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    newSocket.on('connect', () => {
      console.log('Socket.io bağlantısı kuruldu');
      newSocket.emit('joinRoom', roomId);
    });

    newSocket.on('roomUpdate', (updatedRoom) => {
      setRoom(updatedRoom);
    });

    newSocket.on('gameStarting', (seconds) => {
      setCountdown(seconds);
    });

    newSocket.on('gameStarted', () => {
      navigate(`/game/${roomId}`);
    });

    newSocket.on('playerKicked', (kickedUserId) => {
      if (kickedUserId === user._id) {
        toast.error('Odadan atıldınız');
        navigate('/rooms');
      }
    });

    newSocket.on('roomDeleted', () => {
      toast.error('Oda kapatıldı');
      navigate('/rooms');
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [roomId]);

  // Odadan ayrıl
  const handleLeaveRoom = () => {
    socket?.emit('leaveRoom', roomId);
    navigate('/rooms');
  };

  // Hazır durumunu değiştir
  const handleToggleReady = () => {
    socket?.emit('toggleReady', roomId);
  };

  // Oyunu başlat
  const handleStartGame = () => {
    socket?.emit('startGame', roomId);
  };

  // Oyuncu at
  const handleKickPlayer = (targetUserId) => {
    socket?.emit('kickPlayer', roomId, targetUserId);
  };

  if (!room) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <RoomDetails
        room={room}
        user={user}
        onLeaveRoom={handleLeaveRoom}
        onToggleReady={handleToggleReady}
        onStartGame={handleStartGame}
        onKickPlayer={handleKickPlayer}
        countdown={countdown}
      />
    </div>
  );
};

export default RoomContainer; 