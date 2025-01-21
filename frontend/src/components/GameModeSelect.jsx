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
  const [error, setError] = useState(null);

  const handleSinglePlayer = () => {
    navigate('/game');
  };

  const handleCreateRoom = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      console.log('Oda oluşturma isteği gönderiliyor...');
      
      const response = await axios.post(
        `${API_URL}/room/create`,
        {
          minBet: 10,
          maxBet: 1000,
          maxPlayers: 4,
          isPrivate: false
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Oda başarıyla oluşturuldu:', response.data);
      navigate(`/room/${response.data._id}`);
    } catch (error) {
      console.error('Oda oluşturma hatası:', error.response || error);
      setError(error.response?.data?.message || 'Oda oluşturulurken bir hata oluştu');
    }
  };

  const handleJoinRoom = () => {
    navigate('/rooms');
  };

  return (
    <div className="min-h-screen bg-[#111827] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl font-bold text-center text-yellow-400 mb-12 font-serif tracking-wider drop-shadow-lg">
          OYUN MODU SEÇİN
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tek Oyunculu */}
          <div className="bg-[#1F2937] p-6 rounded-xl border border-yellow-500/20 hover:border-yellow-500/40 transition-all">
            <h3 className="text-xl font-bold text-yellow-500 mb-4">Tek Oyunculu</h3>
            <p className="text-gray-400 mb-6">
              Krupiyeye karşı oyna ve yeteneklerini test et!
            </p>
            <button
              onClick={handleSinglePlayer}
              className="w-full py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-medium transition-all"
            >
              Oyna
            </button>
          </div>

          {/* Oda Oluştur */}
          <div className="bg-[#1F2937] p-6 rounded-xl border border-yellow-500/20 hover:border-yellow-500/40 transition-all">
            <h3 className="text-xl font-bold text-yellow-500 mb-4">Oda Oluştur</h3>
            <p className="text-gray-400 mb-6">
              Arkadaşlarınla oynamak için yeni bir oda oluştur!
            </p>
            <button
              onClick={handleCreateRoom}
              className="w-full py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-medium transition-all"
            >
              Oda Oluştur
            </button>
          </div>

          {/* Odaya Katıl */}
          <div className="bg-[#1F2937] p-6 rounded-xl border border-yellow-500/20 hover:border-yellow-500/40 transition-all">
            <h3 className="text-xl font-bold text-yellow-500 mb-4">Odaya Katıl</h3>
            <p className="text-gray-400 mb-6">
              Mevcut bir odaya katıl ve çoklu oyunculu modda oyna!
            </p>
            <button
              onClick={handleJoinRoom}
              className="w-full py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-medium transition-all"
            >
              Odaları Listele
            </button>
          </div>
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