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

        // Socket bağlantısını kur
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
            console.log('Oda güncellendi:', updatedRoom);
            if (updatedRoom._id === roomId) {
              setRoom(updatedRoom);
            }
          });

          socketRef.current.on('gameStarted', (data) => {
            console.log('Oyun başladı:', data);
            if (data.roomId === roomId) {
              toast.success(data.message);
              setRoom(prev => ({ ...prev, status: 'playing' }));
              navigate(`/game/${roomId}`);
            }
          });

          socketRef.current.on('error', (error) => {
            console.error('Socket hatası:', error);
            toast.error(error.message || 'Bir hata oluştu');
          });
        }
      } catch (error) {
        console.error('Oda detayları alınamadı:', error.response || error);
        
        if (error.response?.status === 401) {
          setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
          navigate('/login');
        } else if (error.response?.status === 403) {
          toast.error('Bu odaya erişim izniniz yok');
          navigate('/rooms');
        } else {
          setError(error.response?.data?.message || 'Oda bilgileri alınamadı');
          setTimeout(() => {
            navigate('/rooms');
          }, 2000);
        }
      }
    };

    initializeRoom();

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

  const handleStartGame = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        navigate('/login');
        return;
      }

      const response = await axios.post(
        `${API_URL}/room/${roomId}/start`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Oyun başlatma yanıtı:', response.data);
      setRoom(response.data);

      // Socket ile diğer oyunculara bildir
      socketRef.current?.emit('gameStarted', {
        roomId,
        message: 'Oyun başladı!'
      });
    } catch (error) {
      console.error('Oyun başlatma hatası:', error.response?.data);
      toast.error(error.response?.data?.message || 'Oyun başlatılırken bir hata oluştu');
    }
  };

  const handleForceStartGame = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        navigate('/login');
        return;
      }

      const response = await axios.post(
        `${API_URL}/room/${roomId}/force-start`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Zorla oyun başlatma yanıtı:', response.data);
      setRoom(response.data);

      // Socket ile diğer oyunculara bildir
      socketRef.current?.emit('gameStarted', {
        roomId,
        message: 'Oda sahibi oyunu başlattı!'
      });
    } catch (error) {
      console.error('Oyun başlatma hatası:', error.response?.data);
      toast.error(error.response?.data?.message || 'Oyun başlatılırken bir hata oluştu');
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

  const renderGameControls = () => {
    const currentPlayer = room.currentPlayers.find(
      p => p.userId._id === user._id
    );

    if (!currentPlayer) return null;

    return (
      <div className="flex flex-col gap-4 items-center mt-8">
        {!currentPlayer.isReady && (
          <button
            onClick={toggleReady}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Hazır
          </button>
        )}
        
        {currentPlayer.isReady && !currentPlayer.isOwner && (
          <button
            onClick={toggleReady}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Hazır Değil
          </button>
        )}

        {currentPlayer.isOwner && room.status === 'waiting' && (
          <div className="flex gap-4">
            <button
              onClick={handleStartGame}
              className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Oyunu Başlat
            </button>
            {currentPlayer.isReady && (
              <button
                onClick={handleForceStartGame}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <span>Tek Başına Başlat</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

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
        {renderGameControls()}
      </div>
    </div>
  );
};

export default RoomContainer; 