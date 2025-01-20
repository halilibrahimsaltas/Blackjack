import Card from './Card';
import { useState, useEffect } from 'react';
import ChipSelector from './ChipSelector';

const calculateHandValue = (cards) => {
  if (!Array.isArray(cards)) return 0;
  
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
  if (!Array.isArray(cards) || cards.length !== 2) return false;
  const [card1, card2] = cards;
  const value1 = card1.split('_')[0];
  const value2 = card2.split('_')[0];
  return value1 === value2;
};

const GameTable = ({ game, onHit, onStand, onStartGame, onSplit, chips, user }) => {
  if (!game) return null;
  const [showWinMessage, setShowWinMessage] = useState(false);
  const [showBetModal, setShowBetModal] = useState(false);

  // Oyuncu bilgilerini al
  const player = game.players[0];
  const playerHand = player?.hand || [];
  const playerStatus = player?.status || 'waiting';
  const currentBet = player?.bet || 0;

  // El değerlerini hesapla
  const playerValue = calculateHandValue(playerHand);
  const dealerValue = game.status === 'playing'
    ? calculateHandValue([game.dealerHand[0]]) 
    : calculateHandValue(game.dealerHand);

  // Oyun durumunu kontrol et
  const isGameOver = game.status === 'finished';
  const canHit = playerStatus === 'playing';
  const canStand = playerStatus === 'playing';
  const canSplitHand = canSplit(playerHand) && chips >= currentBet;

  useEffect(() => {
    if (isGameOver) {
      setShowWinMessage(true);
      const timer = setTimeout(() => {
        setShowWinMessage(false);
        setShowBetModal(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isGameOver]);

  const handleBetConfirm = (bet) => {
    setShowBetModal(false);
    onStartGame(bet);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-8 bg-green-800 rounded-lg">
      {/* Krupiye Alanı */}
      <div className="flex flex-col items-center mb-8">
        <h3 className="text-white text-xl mb-4">Krupiye {isGameOver ? `(${dealerValue})` : ''}</h3>
        <div className="flex gap-4">
          {game.dealerHand.map((card, index) => (
            <Card 
              key={index} 
              card={game.status === 'playing' && index === 1 ? 'back' : card} 
            />
          ))}
        </div>
      </div>

      {/* Oyuncu Alanı */}
      <div className="flex flex-col items-center">
        <h3 className="text-white text-xl mb-4">
          {user.username} ({playerValue}) - Bahis: {currentBet}
        </h3>
        <div className="flex gap-4">
          {playerHand.map((card, index) => (
            <Card key={index} card={card} />
          ))}
        </div>
      </div>

      {/* Kontrol Butonları */}
      {game.status === 'playing' && (
        <div className="flex gap-4 mt-8">
          <button
            onClick={onHit}
            disabled={!canHit}
            className={`px-6 py-2 rounded-lg ${
              canHit
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-gray-500 cursor-not-allowed'
            } text-white font-bold`}
          >
            Kart Çek
          </button>
          <button
            onClick={onStand}
            disabled={!canStand}
            className={`px-6 py-2 rounded-lg ${
              canStand
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-gray-500 cursor-not-allowed'
            } text-white font-bold`}
          >
            Dur
          </button>
          {canSplitHand && (
            <button
              onClick={onSplit}
              className="px-6 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-bold"
            >
              Böl
            </button>
          )}
        </div>
      )}

      {/* Kazanma/Kaybetme Mesajı */}
      {showWinMessage && playerStatus !== 'waiting' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg text-2xl font-bold">
            {playerStatus === 'won' && 'Kazandınız! 🎉'}
            {playerStatus === 'lost' && 'Kaybettiniz 😢'}
            {playerStatus === 'push' && 'Berabere 🤝'}
            {playerStatus === 'blackjack' && 'Blackjack! 🎯'}
          </div>
        </div>
      )}

      {/* Bahis Modal */}
      {showBetModal && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg">
            <ChipSelector
              maxChips={chips}
              onBetConfirm={handleBetConfirm}
              defaultBet={user.lastBetAmount}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GameTable; 