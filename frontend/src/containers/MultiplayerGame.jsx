import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import MultiplayerGameTable from '../components/MultiplayerGameTable';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const TURN_TIME_LIMIT = 30; // saniye

const MultiplayerGame = ({ user }) => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [room, setRoom] = useState(null);
  const [game, setGame] = useState(null);
  const [currentTurn, setCurrentTurn] = useState(null);
  const [timeLeft, setTimeLeft] = useState(TURN_TIME_LIMIT);

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

    newSocket.on('gameUpdate', (updatedGame) => {
      setGame(updatedGame);
    });

    newSocket.on('turnChange', (position, time) => {
      setCurrentTurn(position);
      setTimeLeft(time);
    });

    newSocket.on('gameError', (error) => {
      toast.error(error);
    });

    newSocket.on('gameEnd', (results) => {
      // Sonuçları göster
      results.forEach(result => {
        if (result.playerId === user._id) {
          if (result.amount > 0) {
            toast.success(`Kazandınız! +${result.amount} chip`);
          } else {
            toast.error('Kaybettiniz!');
          }
        }
      });
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [roomId]);

  // Süre sayacı
  useEffect(() => {
    if (timeLeft > 0 && currentTurn) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft, currentTurn]);

  // Oyun aksiyonları
  const handleBet = (amount) => {
    socket?.emit('placeBet', roomId, amount);
  };

  const handleHit = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/game/hit/multi/${roomId}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setGame(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Kart çekilirken bir hata oluştu');
    }
  };

  const handleStand = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/game/stand/multi/${roomId}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setGame(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'İşlem yapılırken bir hata oluştu');
    }
  };

  if (!room || !game) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <MultiplayerGameTable
        game={game}
        room={room}
        user={user}
        onHit={handleHit}
        onStand={handleStand}
        onBet={handleBet}
        currentTurn={currentTurn}
        timeLeft={timeLeft}
      />
    </div>
  );
};

export default MultiplayerGame; 