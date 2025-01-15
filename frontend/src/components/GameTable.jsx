import Card from './Card';
import { useState, useEffect } from 'react';
import ChipSelector from './ChipSelector';

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

const GameTable = ({ game, onHit, onStand, onStartGame, chips, user }) => {
  if (!game) return null;
  const [showWinMessage, setShowWinMessage] = useState(false);

  const { playerCards, dealerCards, status, currentBet } = game;
  
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
    <div className="w-full max-w-[1920px] mx-auto flex gap-8">
      {/* Ana Oyun Masası */}
      <div className="flex-1 min-h-[600px] p-12 rounded-xl bg-table-green mb-8">
        {/* Krupiye Kartları */}
        <div className="mb-20 text-center">
          <div className="flex flex-col items-center mb-8">
            <h2 className="text-4xl font-bold text-yellow-500 font-serif tracking-wider mb-2">
              KRUPİYE <span className="text-3xl">({status === 'active' ? dealerValue : dealerValue})</span>
            </h2>
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
        <div className="mb-16 text-center">
          <div className="flex flex-col items-center mb-8">
            <h2 className="text-4xl font-bold text-yellow-500 font-serif tracking-wider mb-2">
              {user?.username?.toUpperCase() || 'OYUNCU'} <span className="text-3xl">({playerValue})</span>
              {isBlackjack && status === 'active' && <span className="ml-2">🎯 Blackjack!</span>}
              {!isBlackjack && is21 && status === 'active' && <span className="ml-2">🎯 21!</span>}
            </h2>
          </div>
          <div className="flex gap-4 justify-center">
            {playerCards.map((card, index) => (
              <Card key={index} card={card} />
            ))}
          </div>
        </div>

        {/* Kontroller */}
        <div className="border-t border-white/20 pt-8">
          <div className="flex justify-center items-center gap-4">
            {status === 'active' && !isBlackjack && !is21 && (
              <>
                <button 
                  onClick={onHit}
                  className="game-button px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-500/30"
                >
                  Kart Çek
                </button>
                <button 
                  onClick={onStand}
                  className="game-button px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-red-500/30"
                >
                  Dur
                </button>
              </>
            )}
          </div>

          {/* Oyun Sonucu */}
          {(status !== 'active' || showWinMessage) && (
            <div className="flex justify-center items-center border-t border-white/10 pt-6 mt-6">
              <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-sm px-8 py-3 rounded-xl border border-yellow-500/30 shadow-lg">
                <h3 className="text-2xl font-bold">
                  {getResultMessage()}
                </h3>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sağ Taraf - Bahis Bölümü */}
      {status !== 'active' && (
        <div className="w-96 bg-gray-800/50 rounded-xl p-6 h-fit sticky top-8">
          <h3 className="text-2xl font-bold text-yellow-500 font-serif tracking-wider mb-6 text-center">
            Yeni El
          </h3>
          <ChipSelector
            maxChips={chips}
            onBetConfirm={onStartGame}
          />
        </div>
      )}
    </div>
  );
};

export default GameTable; 