import { useState, useEffect } from 'react';
import { FaLock, FaUnlock, FaUsers, FaPlay, FaPause } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const RoomList = ({ user, onJoinRoom }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [password, setPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Odaları getir
  const fetchRooms = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/room/list', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setRooms(response.data);
    } catch (error) {
      toast.error('Odalar yüklenirken bir hata oluştu');
      console.error('Odalar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    // Her 5 saniyede bir odaları güncelle
    const interval = setInterval(fetchRooms, 5000);
    return () => clearInterval(interval);
  }, []);

  // Odaya katıl
  const handleJoinRoom = async (room) => {
    if (room.password && !showPasswordModal) {
      setSelectedRoom(room);
      setShowPasswordModal(true);
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/room/join/${room._id}`,
        { password: room.password ? password : null },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      toast.success('Odaya başarıyla katıldınız');
      onJoinRoom(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Odaya katılırken bir hata oluştu');
    } finally {
      setShowPasswordModal(false);
      setPassword('');
      setSelectedRoom(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <div
            key={room._id}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-lg border border-gray-700 hover:border-yellow-500/50 transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-white">{room.name}</h3>
              {room.password ? (
                <FaLock className="text-yellow-500" />
              ) : (
                <FaUnlock className="text-green-500" />
              )}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-gray-300">
                <FaUsers className="mr-2" />
                <span>{room.currentPlayers.length}/{room.maxPlayers} Oyuncu</span>
              </div>
              <div className="flex items-center text-gray-300">
                {room.status === 'waiting' ? (
                  <FaPause className="mr-2 text-yellow-500" />
                ) : (
                  <FaPlay className="mr-2 text-green-500" />
                )}
                <span>
                  {room.status === 'waiting' ? 'Bekliyor' : 'Oyunda'}
                </span>
              </div>
              <div className="text-gray-300">
                <span className="font-semibold">Oda Sahibi: </span>
                {room.currentPlayers.find(p => p.isOwner)?.username}
              </div>
              <div className="text-gray-300">
                <span className="font-semibold">Min. Bahis: </span>
                {room.minBet} Chip
              </div>
            </div>

            <button
              onClick={() => handleJoinRoom(room)}
              disabled={room.status !== 'waiting' || room.currentPlayers.length >= room.maxPlayers}
              className="w-full py-2 px-4 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {room.status !== 'waiting'
                ? 'Oyun Devam Ediyor'
                : room.currentPlayers.length >= room.maxPlayers
                ? 'Oda Dolu'
                : 'Katıl'}
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