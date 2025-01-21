import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const GameModeSelect = () => {
  const navigate = useNavigate();
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [minBet, setMinBet] = useState(10);
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/room/create`, {
        name: roomName,
        minBet,
        isPrivate,
        password: isPrivate ? password : undefined
      });
      navigate(`/room/${response.data.room._id}`);
    } catch (error) {
      console.error('Oda oluşturma hatası:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#111827] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl font-bold text-center text-yellow-400 mb-12 font-serif tracking-wider drop-shadow-lg">
          OYUN MODU SEÇİN
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tek Oyunculu */}
          <button
            onClick={() => navigate('/game')}
            className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800
              p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300
              border border-blue-500/30 group"
          >
            <h2 className="text-2xl font-bold text-white mb-3">Tek Oyunculu</h2>
            <p className="text-blue-200 text-sm">
              Krupiyeye karşı klasik blackjack deneyimi
            </p>
          </button>

          {/* Oda Listesi */}
          <button
            onClick={() => navigate('/rooms')}
            className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800
              p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300
              border border-purple-500/30 group"
          >
            <h2 className="text-2xl font-bold text-white mb-3">Oda Listesi</h2>
            <p className="text-purple-200 text-sm">
              Mevcut çok oyunculu odalara katılın
            </p>
          </button>

          {/* Oda Kur */}
          <button
            onClick={() => setShowCreateRoom(true)}
            className="bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800
              p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300
              border border-green-500/30 group"
          >
            <h2 className="text-2xl font-bold text-white mb-3">Oda Kur</h2>
            <p className="text-green-200 text-sm">
              Kendi çok oyunculu odanızı oluşturun
            </p>
          </button>
        </div>

        {/* Oda Oluşturma Modal */}
        {showCreateRoom && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4">
            <div className="bg-[#111827] rounded-xl p-8 max-w-md w-full border-2 border-yellow-500/30">
              <h2 className="text-2xl font-bold text-yellow-400 mb-6">Yeni Oda Oluştur</h2>
              
              <form onSubmit={handleCreateRoom} className="space-y-4">
                <div>
                  <label className="block text-yellow-300 mb-2">Oda Adı</label>
                  <input
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="w-full bg-gray-900 text-white rounded-lg p-3 border border-yellow-500/30"
                    required
                  />
                </div>

                <div>
                  <label className="block text-yellow-300 mb-2">Minimum Bahis</label>
                  <input
                    type="number"
                    value={minBet}
                    onChange={(e) => setMinBet(Number(e.target.value))}
                    min="10"
                    className="w-full bg-gray-900 text-white rounded-lg p-3 border border-yellow-500/30"
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="rounded border-yellow-500/30"
                  />
                  <label className="text-yellow-300">Özel Oda</label>
                </div>

                {isPrivate && (
                  <div>
                    <label className="block text-yellow-300 mb-2">Şifre</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-gray-900 text-white rounded-lg p-3 border border-yellow-500/30"
                      required
                    />
                  </div>
                )}

                <div className="flex gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateRoom(false)}
                    className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    Oluştur
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameModeSelect; 