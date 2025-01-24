import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import io from 'socket.io-client';
import ChipSelector from './ChipSelector';

const API_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

export default function MultiplayerBetForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId } = useParams();
  const [socket, setSocket] = useState(null);
  const [currentChips, setCurrentChips] = useState(0);
  const [minBet, setMinBet] = useState(10);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
      navigate('/login');
      return;
    }

    // Kullanıcı bilgilerini al
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${API_URL}/auth/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Kullanıcı verileri:', response.data);
        setCurrentChips(response.data.chips);
      } catch (error) {
        console.error('Kullanıcı bilgileri alınamadı:', error);
        toast.error('Kullanıcı bilgileri alınamadı');
        navigate('/rooms');
      }
    };

    // Oda bilgilerini al
    const fetchRoomData = async () => {
      try {
        const response = await axios.get(`${API_URL}/room/${roomId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Oda verileri:', response.data);
        setRoom(response.data);
        setMinBet(response.data.minBet || 10);
      } catch (error) {
        console.error('Oda bilgileri alınamadı:', error);
        toast.error('Oda bilgileri alınamadı');
        navigate('/rooms');
      }
    };

    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchUserData(), fetchRoomData()]);
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Socket bağlantısı
    const newSocket = io(SOCKET_URL, {
      auth: { token }
    });
    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, [roomId, navigate]);

  const handleBetSubmit = async (selectedBet) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        navigate('/login');
        return;
      }

      const betData = {
        roomId: room._id,
        betAmount: selectedBet,
        currentChips: currentChips,
        minBet: minBet
      };
      
      console.log('Bahis gönderiliyor: ', betData);
      
      const response = await axios.post(
        `${API_URL}/game/bet/multi`, 
        betData,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Bahis yanıtı: ', response.data);
      
      // Yeni oyun ID'sini al
      const gameId = response.data._id;
      
      // Çok oyunculu oyun sayfasına yönlendir
      navigate(`/multiplayer/game/${room._id}/${gameId}`);
      
    } catch (error) {
      console.error('Bahis hatası:', error);
      console.error('Hata detayları:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      const errorMessage = error.response?.data?.message || 'Bahis yapılırken bir hata oluştu';
      toast.error(errorMessage);
    }
  };

  if (loading || !room) {
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111827] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-gray-800 rounded-xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold mb-4 text-center text-yellow-500">
          {room.name} - Bahis
        </h2>
        
        <div className="text-center mb-8">
          <p className="text-xl text-yellow-400">
            Mevcut Bakiye: <span className="font-bold">{currentChips.toLocaleString()}</span> Chip
          </p>
          <p className="text-md text-yellow-300 mt-2">
            Minimum Bahis: {minBet} Chip
          </p>
        </div>

        <ChipSelector
          maxChips={currentChips}
          onBetConfirm={handleBetSubmit}
          defaultBet={Math.min(minBet, currentChips)}
          minBet={minBet}
        />

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate(`/room/${roomId}`)}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Odaya Geri Dön
          </button>
        </div>
      </div>
    </div>
  );
} 