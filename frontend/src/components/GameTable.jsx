import Card from './Card';
import { useState, useEffect } from 'react';

const calculateHandValue = (cards) => {
  let value = 0;
  let aces = 0;

  for (let card of cards) {
    const cardValue = card.split('_')[0];
    if (cardValue === 'ace') {
      aces += 1;
    } else if (['king', 'queen', 'jack'].includes(cardValue)) {
      value += 10;
    } else {
      value += parseInt(cardValue);
    }
  }

  // As kartlarını hesapla
  for (let i = 0; i < aces; i++) {
    if (value + 11 <= 21) {
      value += 11;
    } else {
      value += 1;
    }
  }

  return value;
};

const GameTable = ({ game, onHit, onStand, onStartGame }) => {
  if (!game) return null;
  const [newBet, setNewBet] = useState(10);
  const [showWinMessage, setShowWinMessage] = useState(false);

  const { playerCards, dealerCards, status, chips, currentBet } = game;
  
  // El değerlerini hesapla
  const playerValue = calculateHandValue(playerCards);
  const dealerValue = status === 'active' 
    ? calculateHandValue([dealerCards[0]]) 
    : calculateHandValue(dealerCards);

  const isBlackjack = playerValue === 21 && playerCards.length === 2;
  const is21 = playerValue === 21;

  useEffect(() => {
    if (status === 'active' && (isBlackjack || is21)) {
      setShowWinMessage(true);
      setTimeout(() => {
        if (onStand) onStand();
      }, 1000);
    }
  }, [status, isBlackjack, is21, onStand]);

  // Sonuç mesajını belirle
  const getResultMessage = () => {
    if (status === 'active' && (isBlackjack || is21)) {
      return <span className="text-green-400 animate-bounce">Kazandınız! 🎉</span>;
    }
    if (status === 'player_won') {
      return <span className="text-green-400">Kazandınız! 🎉</span>;
    }
    if (status === 'dealer_won') {
      return <span className="text-red-400">Kaybettiniz 😢</span>;
    }
    if (status === 'push') {
      return <span className="text-yellow-300">Berabere 🤝</span>;
    }
    return null;
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="p-8 rounded-xl bg-table-green mb-8">
        {/* Krupiye Kartları */}
        <div className="mb-16 text-center">
          <div className="flex flex-col items-center mb-6">
            <h2 className="text-2xl font-extrabold text-white mb-2 font-serif tracking-wide">KRUPİYE</h2>
            <div className="bg-gray-800/50 px-6 py-2 rounded-full border border-yellow-500/30">
              <span className="text-xl font-bold text-yellow-300">
                {status === 'active' ? `Görünen: ${dealerValue}` : `Toplam: ${dealerValue}`}
              </span>
            </div>
          </div>
          <div className="flex gap-4 justify-center">
            {dealerCards.map((card, index) => (
              <Card 
                key={index} 
                card={card} 
                isHidden={status === 'active' && index === 1}
              />
            ))}
          </div>
        </div>

        {/* Oyuncu Kartları */}
        <div className="mb-12 text-center">
          <div className="flex flex-col items-center mb-6">
            <h2 className="text-2xl font-extrabold text-white mb-2 font-serif tracking-wide">OYUNCU</h2>
            <div className="bg-gray-800/50 px-6 py-2 rounded-full border border-yellow-500/30">
              <span className="text-xl font-bold text-yellow-300">
                Toplam: {playerValue}
                {isBlackjack && status === 'active' && <span className="ml-2">🎯 Blackjack!</span>}
                {!isBlackjack && is21 && status === 'active' && <span className="ml-2">🎯 21!</span>}
              </span>
            </div>
          </div>
          <div className="flex gap-4 justify-center">
            {playerCards.map((card, index) => (
              <Card key={index} card={card} />
            ))}
          </div>
        </div>

        {/* Kontroller ve Bahis */}
        <div className="border-t border-white/20 pt-6">
          <div className="flex justify-between items-center mb-6">
            {/* Chips ve Bahis Bilgisi */}
            <div className="bg-gray-800/50 px-6 py-3 rounded-xl border border-yellow-500/30">
              <div className="flex gap-6">
                <p className="text-lg font-semibold">
                  <span className="text-yellow-500 font-bold">CHIPS</span>
                  <span className="text-white ml-2 font-mono">{chips}</span>
                </p>
                <p className="text-lg font-semibold">
                  <span className="text-yellow-500 font-bold">BAHİS</span>
                  <span className="text-white ml-2 font-mono">{currentBet}</span>
                </p>
              </div>
            </div>

            {/* Oyun Kontrolleri */}
            <div className="flex items-center gap-4">
              {status === 'active' && !isBlackjack && !is21 && (
                <>
                  <button 
                    onClick={onHit}
                    className="game-button bg-blue-600 hover:bg-blue-700 text-lg"
                  >
                    Kart Çek
                  </button>
                  <button 
                    onClick={onStand}
                    className="game-button bg-red-600 hover:bg-red-700 text-lg"
                  >
                    Dur
                  </button>
                </>
              )}

              {status !== 'active' && (
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min="10"
                    max={chips}
                    value={newBet}
                    onChange={(e) => setNewBet(Number(e.target.value))}
                    className="w-24 px-3 py-2 text-lg rounded-lg border-2 border-yellow-500 bg-gray-800/50 text-white"
                  />
                  <button
                    onClick={() => onStartGame(newBet)}
                    disabled={newBet > chips || newBet < 10}
                    className="game-button bg-green-600 hover:bg-green-700 text-lg disabled:bg-gray-600 disabled:cursor-not-allowed"
                  >
                    Yeni El
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Oyun Sonucu */}
          {(status !== 'active' || showWinMessage) && (
            <div className="flex justify-center items-center border-t border-white/10 pt-6">
              <div className="bg-gray-800/50 px-8 py-3 rounded-full border border-yellow-500/30">
                <h3 className="text-2xl font-bold">
                  {getResultMessage()}
                </h3>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameTable; 