import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ScoreBoard from './ScoreBoard';

const Navbar = ({ user, onLogout, showGameModeButton = true }) => {
  const navigate = useNavigate();
  const [showScores, setShowScores] = useState(false);

  // Eğer user undefined ise, varsayılan değerler kullan
  const username = user?.username || 'Misafir';
  const chips = user?.chips || 0;

  return (
    <>
      <nav className="bg-gradient-to-b from-black/20 to-transparent">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-4 w-1/3">
              {showGameModeButton && (
                <button
                  onClick={() => navigate('/select-mode')}
                  className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500 group-hover:text-yellow-400 transition-colors" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-yellow-500 group-hover:text-yellow-400 font-medium transition-colors">Oyun Modu</span>
                </button>
              )}
              <button
                onClick={() => setShowScores(true)}
                className="px-3 py-1.5 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-sm text-yellow-500 hover:text-yellow-400 font-medium transition-all"
              >
                Skor Tablosu
              </button>
            </div>

            <div className="flex items-center justify-center w-1/3">
              <div className="flex items-center gap-4 bg-yellow-500/5 px-4 py-1.5 rounded-xl border border-yellow-500/10">
                <div className="text-sm text-yellow-500 font-medium">
                  {username}
                </div>
                <div className="w-[1px] h-4 bg-yellow-500/20"></div>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-yellow-500 font-bold">{chips.toLocaleString()}</span>
                  <span className="text-xs text-yellow-500/70">chip</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end w-1/3">
              <button
                onClick={onLogout}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 group-hover:text-red-400 transition-colors" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-red-500 group-hover:text-red-400 font-medium transition-colors">Çıkış Yap</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {showScores && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#111827] p-8 rounded-xl relative max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <button 
              onClick={() => setShowScores(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              ✕
            </button>
            
            <ScoreBoard />
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar; 