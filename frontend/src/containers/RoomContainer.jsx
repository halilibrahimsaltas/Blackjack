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

    const fetchRoomData = async () => {
      try {
        console.log('Oda verileri alınıyor:', roomId);
        const response = await axios.get(
          `${API_URL}/room/${roomId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        console.log('Oda verileri alındı:', response.data);
        setRoom(response.data);
        setError(null);
      } catch (error) {
        console.error('Oda verileri alınamadı:', error);
        if (error.response?.status === 401) {
          setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
          navigate('/login');
        } else if (error.response?.status === 403) {
          setError('Bu odaya erişim izniniz yok');
          navigate('/rooms');
        } else {
          setError('Oda bilgileri alınamadı');
        }
      }
    };

    // İlk oda verilerini al
    fetchRoomData();

    // Socket bağlantısını kur
    const socket = io('http://localhost:5000', {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socket.on('connect', () => {
      console.log('Socket.io bağlantısı kuruldu');
      // Odaya katıl
      socket.emit('joinRoom', roomId);
    });

    socket.on('gameStarted', async ({ roomId, message }) => {
      console.log('Oyun başladı:', { roomId, message });
      try {
        const [gameResponse, roomResponse] = await Promise.all([
          axios.get(`${API_URL}/game/${roomId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/room/${roomId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);
        
        if (gameResponse.data && roomResponse.data) {
          console.log('Oyun ve oda verileri güncellendi:', {
            game: gameResponse.data,
            room: roomResponse.data
          });
          
          setRoom(roomResponse.data);
          navigate(`/game/${roomId}`);
        }
      } catch (error) {
        console.error('Oyun verileri alınırken hata:', error);
        setError('Oyun verileri alınamadı. Lütfen sayfayı yenileyin.');
      }
    });

    socket.on('roomUpdated', (updatedRoom) => {
      console.log('Oda güncellendi:', updatedRoom);
      if (updatedRoom._id === roomId) {
        setRoom(updatedRoom);
      }
    });

    socket.on('error', (error) => {
      console.error('Socket hatası:', error);
      setError('Bir bağlantı hatası oluştu');
    });

    socketRef.current = socket;

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

      // Oda sahibi kontrolünü düzelt
      const isOwner = room.currentPlayers.find(p => {
        const playerId = p.userId._id || p.userId;
        return playerId === user._id;
      })?.isOwner;

      console.log('Oyun Başlatma Kontrolü:', {
        currentPlayers: room.currentPlayers,
        userId: user._id,
        isOwner
      });

      if (!isOwner) {
        toast.error('Sadece oda sahibi oyunu başlatabilir!');
        return;
      }

      // En az bir oyuncu olmalı
      if (room.currentPlayers.length < 1) {
        toast.error('Oyunu başlatmak için en az bir oyuncu gerekli!');
        return;
      }

      // Bahis formuna yönlendir
      navigate(`/bet/${roomId}`, { 
        state: { 
          returnPath: `/room/${roomId}`,
          isMultiplayer: true,
          minBet: room.minBet
        } 
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
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#111827]">
      <RoomDetails
        room={room}
        user={user}
        onLeaveRoom={handleLeaveRoom}
        onToggleReady={toggleReady}
        onStartGame={handleStartGame}
        onKickPlayer={kickPlayer}
      />
    </div>
  );
};

export default RoomContainer; 