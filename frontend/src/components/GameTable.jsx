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
  const [autoWinMessage, setAutoWinMessage] = useState(false);

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
  const isGameOver = game.status === 'finished' || playerStatus === 'bust' || playerStatus === 'lost' || playerStatus === 'won' || playerStatus === 'push' || playerStatus === 'blackjack';
  const canHit = playerStatus === 'playing';
  const canStand = playerStatus === 'playing';
  const canSplitHand = canSplit(playerHand) && chips >= currentBet;

  useEffect(() => {
    // Oyuncu eli 21 olduğunda
    if (playerValue === 21 && game.status === 'playing') {
      setTimeout(() => {
        setAutoWinMessage(true);
        setTimeout(() => {
          setAutoWinMessage(false);
          if (onStand) onStand();
        }, 1000);
      }, 300);
    }
  }, [playerValue, game.status, onStand]);

  useEffect(() => {
    // Oyun bittiğinde veya oyuncu durumu değiştiğinde
    if (isGameOver && !showWinMessage) {
      console.log('Oyun durumu:', game.status, 'Oyuncu durumu:', playerStatus);
      setTimeout(() => {
        setShowWinMessage(true);
        setTimeout(() => {
          setShowWinMessage(false);
        }, 1500);
      }, 300);
    }
  }, [isGameOver, playerStatus]);

  const handleBetConfirm = (bet) => {
    setShowBetModal(false);
    onStartGame(bet);
  };

  // Oyun durumunu konsola yazdır
  console.log('Game Status:', game.status, 'Player Status:', playerStatus, 'IsGameOver:', isGameOver);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-8 bg-green-800 rounded-lg">
   
      {/* Krupiye Alanı */}
      <div className="flex flex-col items-center mb-8 mt-12">
        <h3 className="text-3xl font-bold font-serif tracking-widest text-yellow-400 mb-4 drop-shadow-lg">
          KRUPİYE {game.status === 'playing' && `(${calculateHandValue([game.dealerHand[0]])})`}
          {game.status !== 'playing' && `(${dealerValue})`}
        </h3>
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
        <h3 className="text-3xl font-bold font-serif tracking-widest text-yellow-400 mb-4 drop-shadow-lg">
          {user.username.charAt(0).toUpperCase() + user.username.slice(1)} ({playerValue}) 
          <span className="text-xl font-sans ml-3 text-yellow-300">- Bahis: {currentBet}</span>
        </h3>
        <div className="flex gap-4">
          {playerHand.map((card, index) => (
            <Card key={index} card={card} />
          ))}
        </div>
      </div>

      {/* Kontrol Butonları */}
      {!isGameOver ? (
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
      ) : (
        <div className="flex gap-4 mt-8">
          <button
            onClick={() => setShowBetModal(true)}
            className="px-6 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-bold"
          >
            Yeni El
          </button>
        </div>
      )}

      {/* Otomatik Kazanma Mesajı */}
      {autoWinMessage && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 animate-fadeIn transition-all duration-300">
          <div className="bg-[#111827]/80 backdrop-blur-sm p-8 rounded-lg text-2xl font-bold border-2 border-yellow-500/30 shadow-xl">
            <div className="text-center">
              <p className="text-yellow-400">21! Kazandınız! 🎯</p>
            </div>
          </div>
        </div>
      )}

      {/* Kazanma/Kaybetme Mesajı */}
      {showWinMessage && playerStatus !== 'waiting' && playerStatus !== 'playing' && !autoWinMessage && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 animate-fadeIn transition-all duration-300">
          <div className="bg-[#111827]/80 backdrop-blur-sm p-8 rounded-lg text-2xl font-bold border-2 border-yellow-500/30 shadow-xl">
            <div className="text-center">
              {playerStatus === 'won' && <p className="text-green-400">Kazandınız! 🎉</p>}
              {playerStatus === 'lost' && <p className="text-red-400">Kaybettiniz 😢</p>}
              {playerStatus === 'push' && <p className="text-yellow-400">Berabere 🤝</p>}
              {playerStatus === 'blackjack' && <p className="text-yellow-400">Blackjack! 🎰</p>}
              {playerStatus === 'bust' && <p className="text-red-400">Battınız! 💥</p>}
            </div>
          </div>
        </div>
      )}

      {/* Bahis Modal */}
      {showBetModal && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 animate-fadeIn">
          <div className="bg-[#111827] p-8 rounded-xl shadow-2xl border-2 border-yellow-500/30">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-yellow-500">Bahis Yap</h2>
              <button
                onClick={() => setShowBetModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
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