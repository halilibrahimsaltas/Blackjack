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

  for (let i = 0; i < aces; i++) {
    if (value + 11 <= 21) {
      value += 11;
    } else {
      value += 1;
    }
  }

  return value;
};

const canSplit = (cards) => {
  if (cards.length !== 2) return false;
  const [card1, card2] = cards;
  const value1 = card1.split('_')[0];
  const value2 = card2.split('_')[0];
  return value1 === value2;
};

const GameTable = ({ game, onHit, onStand, onStartGame, onSplit, chips, user }) => {
  if (!game) return null;
  const [showWinMessage, setShowWinMessage] = useState(false);
  const [showBetModal, setShowBetModal] = useState(false);

  const { playerCards, dealerCards, splitCards, status, currentBet, activeHand, splitStatus } = game;
  
  // El değerlerini hesapla
  const playerValue = calculateHandValue(playerCards);
  const splitValue = splitCards ? calculateHandValue(splitCards) : 0;
  const dealerValue = status === 'active' || status === 'split_active'
    ? calculateHandValue([dealerCards[0]]) 
    : calculateHandValue(dealerCards);

  const isBlackjack = playerValue === 21 && playerCards.length === 2;
  const is21 = playerValue === 21;
  const isSplitBlackjack = splitValue === 21 && splitCards?.length === 2;
  const isSplit21 = splitValue === 21;

  useEffect(() => {
    if ((status === 'active' || status === 'split_active') && 
        ((activeHand === 'main' && (isBlackjack || is21)) || 
         (activeHand === 'split' && (isSplitBlackjack || isSplit21)))) {
      setShowWinMessage(true);
      setTimeout(() => {
        if (onStand) onStand();
      }, 1000);
    }
  }, [status, isBlackjack, is21, isSplitBlackjack, isSplit21, activeHand, onStand]);

  const handleBetConfirm = (bet) => {
    setShowBetModal(false);
    onStartGame(bet);
  };

  // Sonuç mesajını belirle
  const getResultMessage = (handStatus, isMain = true) => {
    if ((status === 'active' || status === 'split_active') && 
        ((isMain && (isBlackjack || is21)) || (!isMain && (isSplitBlackjack || isSplit21)))) {
      return <span className="text-green-400 animate-bounce">Kazandınız! 🎉</span>;
    }
    if (handStatus === 'player_won') {
      return <span className="text-green-400">Kazandınız! 🎉</span>;
    }
    if (handStatus === 'dealer_won') {
      return <span className="text-red-400">Kaybettiniz 😢</span>;
    }
    if (handStatus === 'push') {
      return <span className="text-yellow-300">Berabere 🤝</span>;
    }
    return null;
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto">
      {/* Ana Oyun Masası */}
      <div className="min-h-[600px] p-12 rounded-xl bg-table-green mb-8">
        {/* Krupiye Kartları */}
        <div className="mb-20 text-center">
          <div className="flex flex-col items-center mb-8">
            <h2 className="text-4xl font-bold text-yellow-500 font-serif tracking-wider mb-2">
              KRUPİYE <span className="text-3xl">({dealerValue})</span>
            </h2>
          </div>
          <div className="flex gap-4 justify-center">
            {dealerCards.map((card, index) => (
              <Card 
                key={index} 
                card={card} 
                isHidden={(status === 'active' || status === 'split_active') && index === 1}
              />
            ))}
          </div>
        </div>

        {/* Oyuncu Kartları */}
        <div className="mb-16 text-center">
          {/* Ana El */}
          <div className="flex flex-col items-center mb-8">
            <h2 className="text-4xl font-bold text-yellow-500 font-serif tracking-wider mb-2">
              {user?.username?.toUpperCase() || 'OYUNCU'} 
              <span className="text-3xl">({playerValue})</span>
              {isBlackjack && status === 'active' && <span className="ml-2">🎯 Blackjack!</span>}
              {!isBlackjack && is21 && status === 'active' && <span className="ml-2">🎯 21!</span>}
              {status === 'split_active' && activeHand === 'main' && <span className="ml-2">👉 Aktif El</span>}
            </h2>
            <div className="flex gap-4 justify-center">
              {playerCards.map((card, index) => (
                <Card key={index} card={card} />
              ))}
            </div>
            {getResultMessage(status) && (
              <div className="mt-4 bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-sm px-6 py-2 rounded-xl border border-yellow-500/30 shadow-lg">
                <h3 className="text-xl font-bold">{getResultMessage(status)}</h3>
              </div>
            )}
          </div>

          {/* Split El */}
          {splitCards && splitCards.length > 0 && (
            <div className="flex flex-col items-center mb-8">
              <h2 className="text-4xl font-bold text-yellow-500 font-serif tracking-wider mb-2">
                {user?.username?.toUpperCase() || 'OYUNCU'} - SPLIT 
                <span className="text-3xl">({splitValue})</span>
                {isSplitBlackjack && splitStatus === 'active' && <span className="ml-2">🎯 Blackjack!</span>}
                {!isSplitBlackjack && isSplit21 && splitStatus === 'active' && <span className="ml-2">🎯 21!</span>}
                {status === 'split_active' && activeHand === 'split' && <span className="ml-2">👉 Aktif El</span>}
              </h2>
              <div className="flex gap-4 justify-center">
                {splitCards.map((card, index) => (
                  <Card key={index} card={card} />
                ))}
              </div>
              {getResultMessage(splitStatus, false) && (
                <div className="mt-4 bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-sm px-6 py-2 rounded-xl border border-yellow-500/30 shadow-lg">
                  <h3 className="text-xl font-bold">{getResultMessage(splitStatus, false)}</h3>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Kontroller */}
        <div className="border-t border-white/20 pt-8">
          <div className="flex justify-center items-center gap-4">
            {((status === 'active' && !isBlackjack && !is21) || 
              (status === 'split_active' && activeHand === 'main' && !isBlackjack && !is21) ||
              (status === 'split_active' && activeHand === 'split' && !isSplitBlackjack && !isSplit21)) ? (
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
                {status === 'active' && canSplit(playerCards) && chips >= currentBet && (
                  <button 
                    onClick={onSplit}
                    className="game-button px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-500/30"
                  >
                    Split
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() => setShowBetModal(true)}
                className="game-button px-8 py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-yellow-500/30"
              >
                Yeni El Başlat
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bahis Modal */}
      {showBetModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-xl shadow-2xl border border-yellow-500/30 max-w-2xl w-full mx-4 animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-yellow-500 font-serif">
                Bahis Miktarını Seçin
              </h2>
              <button
                onClick={() => setShowBetModal(false)}
                className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              >
                Geri Dön
              </button>
            </div>
            <ChipSelector
              maxChips={chips}
              onBetConfirm={handleBetConfirm}
              defaultBet={user?.lastBetAmount || 10}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GameTable; 