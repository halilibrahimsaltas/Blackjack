import { useState } from 'react';

const BetForm = ({ onStartGame, currentChips = 1000 }) => {
  const [bet, setBet] = useState(10);

  const handleSubmit = (e) => {
    e.preventDefault();
    onStartGame(bet);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto p-8 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl shadow-2xl border border-gray-600">
      <h2 className="text-3xl font-bold mb-8 text-center text-yellow-500 font-serif">Yeni El</h2>
      
      <div className="mb-6 text-center">
        <div className="inline-block bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-4">
          <p className="text-xl text-white font-bold">
            Mevcut Chips: <span className="text-2xl ml-2">{currentChips}</span>
          </p>
        </div>
      </div>

      <div className="mb-8">
        <label className="block text-yellow-500 text-lg font-bold mb-3">
          Bahis Miktarı
        </label>
        <div className="relative">
          <input
            type="number"
            min="10"
            max={currentChips}
            step="10"
            value={bet}
            onChange={(e) => setBet(Number(e.target.value))}
            className="w-full px-4 py-3 text-xl rounded-lg border-2 border-yellow-500 bg-gray-800 text-white focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400"
          />
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-yellow-500">
            💰
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={bet > currentChips || bet < 10}
        className="w-full py-4 text-xl font-bold text-white bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg shadow-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed"
      >
        Bahis Koy 🎲
      </button>

      {bet > currentChips && (
        <p className="mt-3 text-red-400 text-center">
          Yetersiz bakiye! Maximum {currentChips} chip bahis yapabilirsiniz.
        </p>
      )}
    </form>
  );
};

export default BetForm; 