import { useState } from 'react';
import { FaLock, FaUnlock, FaUsers, FaCog } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const CreateRoom = ({ onRoomCreated }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    maxPlayers: 4,
    password: '',
    minBet: 10,
    autoStart: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        'http://localhost:5000/api/room/create',
        formData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (response.data && response.data._id) {
        toast.success('Oda başarıyla oluşturuldu');
        setShowModal(false);
        setFormData({
          name: '',
          maxPlayers: 4,
          password: '',
          minBet: 10,
          autoStart: false
        });
        
        if (onRoomCreated) {
          onRoomCreated(response.data);
        }
      } else {
        toast.error('Oda oluşturulurken bir hata oluştu');
      }
    } catch (error) {
      console.error('Oda oluşturma hatası:', error);
      toast.error(error.response?.data?.message || 'Oda oluşturulurken bir hata oluştu');
    }
  };

  return (
    <>
      {/* Oda Oluştur Butonu */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <FaCog className="w-6 h-6" />
      </button>

      {/* Oda Oluşturma Modalı */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-xl shadow-2xl border border-yellow-500/30 max-w-md w-full mx-4 animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-yellow-500">
                Yeni Oda Oluştur
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Oda Adı */}
              <div>
                <label className="block text-gray-300 mb-2">Oda Adı</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  minLength={3}
                  maxLength={20}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Oda adını girin"
                />
              </div>

              {/* Maksimum Oyuncu */}
              <div>
                <label className="block text-gray-300 mb-2">
                  Maksimum Oyuncu
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    name="maxPlayers"
                    min="1"
                    max="4"
                    value={formData.maxPlayers}
                    onChange={handleChange}
                    className="flex-1"
                  />
                  <span className="text-white bg-gray-700 px-3 py-1 rounded-lg min-w-[40px] text-center">
                    {formData.maxPlayers}
                  </span>
                </div>
              </div>

              {/* Minimum Bahis */}
              <div>
                <label className="block text-gray-300 mb-2">
                  Minimum Bahis
                </label>
                <input
                  type="number"
                  name="minBet"
                  value={formData.minBet}
                  onChange={handleChange}
                  min="10"
                  max="1000"
                  step="10"
                  required
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              {/* Şifre */}
              <div>
                <label className="block text-gray-300 mb-2">
                  Şifre (Opsiyonel)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="Oda şifresi"
                  />
                  {formData.password ? (
                    <FaLock className="absolute right-3 top-3 text-yellow-500" />
                  ) : (
                    <FaUnlock className="absolute right-3 top-3 text-green-500" />
                  )}
                </div>
              </div>

              {/* Otomatik Başlatma */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="autoStart"
                  checked={formData.autoStart}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-yellow-500 focus:ring-yellow-500"
                />
                <label className="text-gray-300">
                  Tüm oyuncular hazır olduğunda otomatik başlat
                </label>
              </div>

              {/* Butonlar */}
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white rounded-lg font-semibold"
                >
                  Oda Oluştur
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg font-semibold"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateRoom; 