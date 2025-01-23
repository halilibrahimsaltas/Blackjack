import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaLock, FaUnlock, FaUsers, FaPlay, FaPause } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

const RoomList = ({ onRoomJoin }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [password, setPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/room/list`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Odalar yüklendi:', response.data);
      setRooms(response.data);
      setError(null);
    } catch (error) {
      console.error('Odalar yüklenemedi:', error);
      setError('Odalar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    // Her 10 saniyede bir oda listesini güncelle
    const interval = setInterval(fetchRooms, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleJoinRoom = async (roomId) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        navigate('/login');
        return;
      }

      console.log('Odaya katılma isteği gönderiliyor:', roomId);
      
      const response = await axios.post(
        `${API_URL}/room/join/${roomId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Odaya katılma başarılı:', response.data);
      
      if (response.data && response.data._id) {
        if (onRoomJoin) {
          onRoomJoin(roomId);
        }
        navigate(`/room/${roomId}`);
      } else {
        throw new Error('Sunucudan geçersiz yanıt alındı');
      }
    } catch (error) {
      console.error('Odaya katılma hatası:', error.response || error);
      
      if (error.response?.status === 401) {
        setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        navigate('/login');
      } else {
        setError(error.response?.data?.message || 'Odaya katılırken bir hata oluştu');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-4">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-yellow-500 mb-2">Aktif Odalar</h2>
        <p className="text-gray-400">Mevcut odalar: {rooms.length}/10</p>
      </div>

      {/* Oda Listesi */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div 
            key={room._id}
            className="bg-[#1F2937] p-6 rounded-xl border border-yellow-500/20 hover:border-yellow-500/40 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-yellow-500 mb-2">
                  {room.name || `Oda #${room._id.slice(-4)}`}
                </h3>
                <p className="text-sm text-gray-400">
                  {room.currentPlayers?.length || 0} / {room.maxPlayers || 4} Oyuncu
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-yellow-500">
                  Min: {room.minBet}
                </span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {room.currentPlayers?.map((player, index) => (
                <div 
                  key={index}
                  className="px-3 py-1 rounded-full bg-yellow-500/10 text-sm text-yellow-500"
                >
                  {player.username}
                </div>
              ))}
            </div>

            <button
              onClick={() => handleJoinRoom(room._id)}
              disabled={room.currentPlayers?.length >= (room.maxPlayers || 4)}
              className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${
                room.currentPlayers?.length >= (room.maxPlayers || 4)
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-yellow-500 hover:bg-yellow-600'
              }`}
            >
              {room.currentPlayers?.length >= (room.maxPlayers || 4) ? 'Oda Dolu' : 'Katıl'}
            </button>
          </div>
        ))}
      </div>

      {/* Şifre Modalı */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-xl shadow-2xl border border-yellow-500/30 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-yellow-500 mb-4">
              Oda Şifresi
            </h3>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Şifreyi girin"
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <div className="flex gap-4">
              <button
                onClick={() => handleJoinRoom(selectedRoom)}
                className="flex-1 py-2 px-4 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white rounded-lg font-semibold"
              >
                Katıl
              </button>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPassword('');
                  setSelectedRoom(null);
                }}
                className="flex-1 py-2 px-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg font-semibold"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomList; 