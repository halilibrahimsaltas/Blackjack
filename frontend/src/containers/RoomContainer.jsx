import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import RoomDetails from '../components/RoomDetails';
import { toast } from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

const RoomContainer = ({ user }) => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [socket, setSocket] = useState(null);
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    // Socket.io bağlantısı
    const newSocket = io(SOCKET_URL, {
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

    newSocket.on('gameStarting', (countdown) => {
      setCountdown(countdown);
    });

    newSocket.on('gameStarted', (gameData) => {
      setRoom(prev => ({ ...prev, game: gameData }));
    });

    newSocket.on('playerDisconnected', (playerId) => {
      setRoom(prev => ({
        ...prev,
        players: prev.players.filter(p => p._id !== playerId)
      }));
    });

    newSocket.on('roomDeleted', () => {
      toast.error('Oda kapatıldı');
      navigate('/rooms');
    });

    newSocket.on('error', (error) => {
      setError(error.message);
    });

    setSocket(newSocket);

    // Oda bilgilerini getir
    fetchRoom();

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [roomId]);

  const fetchRoom = async () => {
    try {
      const response = await axios.get(`${API_URL}/room/${roomId}`);
      setRoom(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Oda bilgileri alınamadı');
      navigate('/rooms');
    }
  };

  const handleLeaveRoom = () => {
    if (socket) {
      socket.emit('leaveRoom', roomId);
    }
    navigate('/rooms');
  };

  const toggleReady = () => {
    if (socket) {
      socket.emit('toggleReady', roomId);
      setIsReady(!isReady);
    }
  };

  const startGame = () => {
    if (socket) {
      socket.emit('startGame', roomId);
    }
  };

  const kickPlayer = (playerId) => {
    if (socket) {
      socket.emit('kickPlayer', { roomId, playerId });
    }
  };

  if (!room) {
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111827] p-8">
      <div className="max-w-4xl mx-auto">
        {/* Oda Başlığı */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-yellow-400 font-serif tracking-wider">
            {room.name}
          </h1>
          <button
            onClick={handleLeaveRoom}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Odadan Ayrıl
          </button>
        </div>

        {/* Oyuncu Listesi */}
        <div className="bg-gray-900/50 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-yellow-400 mb-4">Oyuncular</h2>
          <div className="space-y-4">
            {room.players.map((player) => (
              <div
                key={player._id}
                className="flex items-center justify-between bg-gray-800/50 p-4 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <span className="text-white">{player.username}</span>
                  <span className="text-yellow-300">{player.chips} chips</span>
                  {player.isReady && (
                    <span className="text-green-400 text-sm">Hazır</span>
                  )}
                  {player._id === room.creator && (
                    <span className="text-purple-400 text-sm">Oda Sahibi</span>
                  )}
                </div>
                {room.creator === player._id && (
                  <button
                    onClick={() => kickPlayer(player._id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                  >
                    Oyuncuyu At
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Kontrol Butonları */}
        <div className="flex justify-center gap-4">
          <button
            onClick={toggleReady}
            className={`px-6 py-3 rounded-lg transition-colors ${
              isReady
                ? 'bg-yellow-600 hover:bg-yellow-700'
                : 'bg-green-600 hover:bg-green-700'
            } text-white`}
          >
            {isReady ? 'Hazır Değil' : 'Hazır'}
          </button>
          {room.creator === room.players[0]?._id && (
            <button
              onClick={startGame}
              disabled={!room.players.every(p => p.isReady)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              Oyunu Başlat
            </button>
          )}
        </div>

        {/* Geri Sayım */}
        {countdown && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center">
            <div className="text-6xl text-yellow-400 font-bold animate-pulse">
              {countdown}
            </div>
          </div>
        )}

        {/* Hata Mesajı */}
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomContainer; 