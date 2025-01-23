import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import RoomDetails from '../components/RoomDetails';
import { toast } from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

const RoomContainer = ({ user }) => {
  const [room, setRoom] = useState(null);
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const { roomId } = useParams();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const isInitialMount = useRef(true);

  // Socket bağlantısı ve oda verilerini getir
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
      navigate('/login');
      return;
    }

    const initializeRoom = async () => {
      try {
        // Önce oda verilerini al
        const response = await axios.get(
          `${API_URL}/room/${roomId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('Oda detayları alındı:', response.data);
        setRoom(response.data);
        setError(null);

        // Sonra socket bağlantısını kur
        if (!socketRef.current) {
          socketRef.current = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket'],
            upgrade: false
          });

          socketRef.current.on('connect', () => {
            console.log('Socket.io bağlantısı kuruldu');
            socketRef.current.emit('joinRoom', roomId);
          });

          socketRef.current.on('roomUpdated', (updatedRoom) => {
            if (updatedRoom._id === roomId) {
              console.log('Oda güncellendi:', updatedRoom);
              setRoom(prev => {
                // Eğer mevcut oyuncu sayısı güncellenenden fazlaysa güncelleme
                if (prev?.currentPlayers?.length >= updatedRoom.currentPlayers.length) {
                  return prev;
                }
                return updatedRoom;
              });
            }
          });
        }
      } catch (error) {
        console.error('Oda detayları alınamadı:', error.response || error);
        
        if (error.response?.status === 401) {
          setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
          navigate('/login');
        } else if (error.response?.status === 400) {
          setError(error.response.data.message);
          setTimeout(() => {
            navigate('/rooms');
          }, 2000);
        } else {
          setError(error.response?.data?.message || 'Oda bilgileri alınamadı');
          setTimeout(() => {
            navigate('/rooms');
          }, 2000);
        }
      }
    };

    if (isInitialMount.current) {
      isInitialMount.current = false;
      initializeRoom();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [roomId, navigate]);

  const handleLeaveRoom = () => {
    if (socketRef.current) {
      socketRef.current.emit('leaveRoom', roomId);
    }
    navigate('/rooms');
  };

  const toggleReady = () => {
    if (socketRef.current) {
      socketRef.current.emit('toggleReady', roomId);
      setIsReady(!isReady);
    }
  };

  const startGame = () => {
    if (socketRef.current) {
      socketRef.current.emit('startGame', roomId);
    }
  };

  const kickPlayer = (playerId) => {
    if (socketRef.current) {
      socketRef.current.emit('kickPlayer', { roomId, playerId });
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center">
        <div className="text-red-500 text-xl font-semibold">{error}</div>
      </div>
    );
  }

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
          <h2 className="text-2xl font-bold text-white">
            {room.name} <span className="text-sm text-gray-400">({room.currentPlayers?.length || 0}/{room.maxPlayers})</span>
          </h2>
          <button
            onClick={handleLeaveRoom}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Odadan Ayrıl
          </button>
        </div>

        {/* Oyuncular Listesi */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Oyuncular</h3>
          <div className="space-y-4">
            {room.currentPlayers?.map((player, index) => {
              const playerId = player.userId?._id || player.userId;
              return (
                <div key={`${playerId}-${index}`} className="flex items-center justify-between bg-gray-700 p-4 rounded">
                  <div className="flex items-center">
                    <span className="text-white">{player.username}</span>
                    {player.isOwner && (
                      <span className="ml-2 px-2 py-1 bg-yellow-500 text-xs text-black rounded">Kurucu</span>
                    )}
                    {player.isReady && (
                      <span className="ml-2 px-2 py-1 bg-green-500 text-xs text-black rounded">Hazır</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-yellow-400">{player.chips} Chip</span>
                    {room.currentPlayers[0]?.userId === user?.id && playerId !== user?.id && (
                      <button
                        onClick={() => kickPlayer(playerId)}
                        className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                      >
                        At
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Kontrol Butonları */}
        <div className="flex justify-center space-x-4">
          {room.currentPlayers[0]?.userId === user?.id ? (
            <button
              onClick={startGame}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              disabled={!room.currentPlayers?.every(p => p.isReady)}
            >
              Oyunu Başlat
            </button>
          ) : (
            <button
              onClick={toggleReady}
              className={`px-6 py-3 ${
                isReady ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'
              } text-white rounded-lg`}
            >
              {isReady ? 'Hazır Değil' : 'Hazır'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomContainer; 