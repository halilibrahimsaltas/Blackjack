import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import RoomList from '../components/RoomList';
import CreateRoom from '../components/CreateRoom';
import { toast } from 'react-hot-toast';

const Rooms = ({ user }) => {
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [activeRoom, setActiveRoom] = useState(null);

  // Socket.io bağlantısı
  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    // Socket event listeners
    newSocket.on('connect', () => {
      console.log('Socket.io bağlantısı kuruldu');
    });

    newSocket.on('roomUpdate', (updatedRoom) => {
      if (activeRoom?._id === updatedRoom._id) {
        setActiveRoom(updatedRoom);
      }
    });

    newSocket.on('roomDeleted', (roomId) => {
      if (activeRoom?._id === roomId) {
        toast.error('Oda kapatıldı');
        setActiveRoom(null);
        navigate('/rooms');
      }
    });

    newSocket.on('gameStarted', (roomId) => {
      if (activeRoom?._id === roomId) {
        navigate(`/game/${roomId}`);
      }
    });

    newSocket.on('playerKicked', (roomId, userId) => {
      if (activeRoom?._id === roomId && user._id === userId) {
        toast.error('Odadan atıldınız');
        setActiveRoom(null);
        navigate('/rooms');
      }
    });

    setSocket(newSocket);

    // Cleanup
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  // Oda oluşturulduğunda
  const handleRoomCreated = (room) => {
    setActiveRoom(room);
    socket?.emit('joinRoom', room._id);
    navigate(`/room/${room._id}`);
  };

  // Odaya katılındığında
  const handleJoinRoom = (room) => {
    setActiveRoom(room);
    socket?.emit('joinRoom', room._id);
    navigate(`/room/${room._id}`);
  };

  // Odadan çıkıldığında
  const handleLeaveRoom = async () => {
    if (activeRoom) {
      socket?.emit('leaveRoom', activeRoom._id);
      setActiveRoom(null);
      navigate('/rooms');
    }
  };

  // Oyuncu hazır durumu değiştiğinde
  const handleToggleReady = () => {
    if (activeRoom) {
      socket?.emit('toggleReady', activeRoom._id);
    }
  };

  // Oyun başlatıldığında
  const handleStartGame = () => {
    if (activeRoom) {
      socket?.emit('startGame', activeRoom._id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-yellow-500">
              Blackjack Odaları
            </h1>
            <p className="text-gray-400 mt-2">
              Mevcut bir odaya katılın veya yeni bir oda oluşturun
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">Hoş geldin,</p>
              <p className="text-lg font-semibold text-yellow-500">
                {user.username}
              </p>
            </div>
            <div className="bg-gray-800 px-4 py-2 rounded-lg">
              <p className="text-sm text-gray-400">Chips</p>
              <p className="text-lg font-semibold text-green-500">
                {user.chips}
              </p>
            </div>
          </div>
        </div>

        {/* Oda Listesi */}
        <RoomList user={user} onJoinRoom={handleJoinRoom} />

        {/* Oda Oluşturma */}
        <CreateRoom onRoomCreated={handleRoomCreated} />
      </div>
    </div>
  );
};

export default Rooms; 