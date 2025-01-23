import React from 'react';

const UserStats = ({ user }) => {
  if (!user) return null;

  const winRate = user.totalGames > 0 
    ? ((user.gamesWon / user.totalGames) * 100).toFixed(1) 
    : 0;

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-yellow-500/20">
      <h2 className="text-2xl font-bold text-yellow-500 mb-6">Oyun İstatistikleri</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-gray-400 text-sm">Toplam Oyun</h3>
            <p className="text-white text-xl font-semibold">{user.totalGames}</p>
          </div>
          
          <div>
            <h3 className="text-gray-400 text-sm">Kazanılan Oyun</h3>
            <p className="text-white text-xl font-semibold">{user.gamesWon}</p>
          </div>
          
          <div>
            <h3 className="text-gray-400 text-sm">Kazanma Oranı</h3>
            <p className="text-white text-xl font-semibold">%{winRate}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-gray-400 text-sm">Mevcut Bakiye</h3>
            <p className="text-white text-xl font-semibold">{user.chips.toLocaleString()} Chip</p>
          </div>
          
          <div>
            <h3 className="text-gray-400 text-sm">Son Bahis</h3>
            <p className="text-white text-xl font-semibold">{user.lastBetAmount.toLocaleString()} Chip</p>
          </div>
          
          <div>
            <h3 className="text-gray-400 text-sm">Hesap Oluşturma</h3>
            <p className="text-white text-xl font-semibold">
              {new Date(user.createdAt).toLocaleDateString('tr-TR')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStats; 