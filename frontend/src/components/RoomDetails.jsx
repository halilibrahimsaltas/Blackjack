import { useState, useEffect } from 'react';
import { FaUsers, FaPlay, FaPause, FaCrown, FaCheck, FaTimes } from 'react-icons/fa';

const RoomDetails = ({ room, user, onLeaveRoom, onToggleReady, onStartGame, onKickPlayer }) => {
  const [countdown, setCountdown] = useState(null);
  
  // userId kontrolünü düzelt
  const isOwner = room?.currentPlayers.find(p => {
    const playerId = p.userId._id || p.userId;
    return playerId === user._id;
  })?.isOwner;

  const currentPlayer = room?.currentPlayers.find(p => {
    const playerId = p.userId._id || p.userId;
    return playerId === user._id;
  });

  console.log('Oda Detayları:', {
    currentPlayers: room?.currentPlayers,
    userId: user._id,
    isOwner,
    currentPlayer,
    status: room?.status
  });

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  return (
    <div className="container mx-auto p-4">
      {/* Oda Başlığı */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-lg border border-gray-700 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-yellow-500">{room.name}</h2>
            <p className="text-gray-400">
              Min. Bahis: {room.minBet} Chip | Otomatik Başlatma: {room.autoStart ? 'Açık' : 'Kapalı'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center text-gray-300">
              <FaUsers className="mr-2" />
              <span>{room.currentPlayers.length}/{room.maxPlayers}</span>
            </div>
            <div className="flex items-center text-gray-300">
              {room.status === 'waiting' ? (
                <FaPause className="mr-2 text-yellow-500" />
              ) : (
                <FaPlay className="mr-2 text-green-500" />
              )}
              <span>{room.status === 'waiting' ? 'Bekliyor' : 'Oyunda'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Oyuncu Listesi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {Array.from({ length: room.maxPlayers }).map((_, index) => {
          const player = room.currentPlayers.find(p => p.position === index + 1);
          
          return (
            <div key={index} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-lg border border-gray-700">
              {player ? (
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {player.isOwner && <FaCrown className="text-yellow-500" />}
                    <span className="text-xl font-semibold text-white">{player.username}</span>
                    {player.isReady && <FaCheck className="text-green-500" />}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-green-500 font-mono">{player.chips} Chip</span>
                    {isOwner && player.userId !== user._id && (
                      <button
                        onClick={() => onKickPlayer(player.userId)}
                        className="p-2 text-red-500 hover:text-red-400 transition-colors"
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4">Boş Pozisyon</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Kontrol Butonları */}
      <div className="flex justify-center gap-4">
        {currentPlayer && !currentPlayer.isReady && (
          <button
            onClick={onToggleReady}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold transition-all duration-300"
          >
            Hazır
          </button>
        )}
        {currentPlayer && currentPlayer.isReady && !currentPlayer.isOwner && (
          <button
            onClick={onToggleReady}
            className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white rounded-lg font-semibold transition-all duration-300"
          >
            Beklemeye Al
          </button>
        )}
        {isOwner && room.status === 'waiting' && (
          <button
            onClick={onStartGame}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition-all duration-300"
          >
            Oyunu Başlat ({room.currentPlayers.length} Oyuncu)
          </button>
        )}
        <button
          onClick={onLeaveRoom}
          className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-semibold transition-all duration-300"
        >
          Odadan Ayrıl
        </button>
      </div>

      {/* Geri Sayım */}
      {countdown > 0 && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-6xl font-bold text-yellow-500">{countdown}</div>
        </div>
      )}
    </div>
  );
};

export default RoomDetails; 