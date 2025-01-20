import { useState, useEffect } from 'react';
import Card from './Card';
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

const MultiplayerGameTable = ({ 
  game, 
  room,
  user,
  onHit, 
  onStand, 
  onBet,
  currentTurn,
  timeLeft
}) => {
  const [showBetModal, setShowBetModal] = useState(false);

  const handleBetConfirm = (amount) => {
    setShowBetModal(false);
    onBet(amount);
  };

  const currentPlayer = room.currentPlayers.find(p => p.userId === user._id);
  const isCurrentTurn = currentPlayer?.position === currentTurn;

  return (
    <div className="w-full max-w-[1920px] mx-auto">
      {/* Ana Oyun Masası */}
      <div className="min-h-[800px] p-12 rounded-xl bg-table-green mb-8 relative">
        {/* Krupiye Kartları */}
        <div className="mb-20 text-center">
          <div className="flex flex-col items-center mb-8">
            <h2 className="text-4xl font-bold text-yellow-500 font-serif tracking-wider mb-2">
              KRUPİYE <span className="text-3xl">({game.dealerScore})</span>
            </h2>
          </div>
          <div className="flex gap-4 justify-center">
            {game.dealerCards.map((card, index) => (
              <Card 
                key={index} 
                card={card} 
                isHidden={game.status === 'playing' && index === 1}
              />
            ))}
          </div>
        </div>

        {/* Oyuncu Kartları */}
        <div className="grid grid-cols-2 gap-8">
          {room.currentPlayers.map((player) => {
            const playerGame = game.players.find(p => p.playerId === player.userId);
            if (!playerGame) return null;

            const handValue = calculateHandValue(playerGame.hand);
            const isPlayerTurn = player.position === currentTurn;

            return (
              <div 
                key={player.userId} 
                className={`text-center ${isPlayerTurn ? 'ring-4 ring-yellow-500 rounded-xl p-4' : 'p-4'}`}
              >
                <div className="flex flex-col items-center mb-4">
                  <h2 className="text-3xl font-bold text-yellow-500 font-serif tracking-wider mb-2">
                    {player.username} <span className="text-2xl">({handValue})</span>
                  </h2>
                  <div className="text-gray-300 text-sm">
                    Chips: {player.chips} | Bet: {playerGame.bet}
                  </div>
                  {isPlayerTurn && (
                    <div className="text-yellow-500 font-bold mt-2">
                      Süre: {timeLeft}s
                    </div>
                  )}
                </div>
                <div className="flex gap-4 justify-center">
                  {playerGame.hand.map((card, index) => (
                    <Card key={index} card={card} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Kontroller */}
        {isCurrentTurn && game.status === 'playing' && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="flex justify-center items-center gap-4">
              <button 
                onClick={onHit}
                className="game-button px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-lg"
              >
                Kart Çek
              </button>
              <button 
                onClick={onStand}
                className="game-button px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-lg"
              >
                Dur
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bahis Modal */}
      {showBetModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-xl shadow-2xl border border-yellow-500/30 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-yellow-500 font-serif">
                Bahis Miktarını Seçin
              </h2>
            </div>
            <ChipSelector
              maxChips={currentPlayer?.chips || 0}
              onBetConfirm={handleBetConfirm}
              defaultBet={room.minBet}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiplayerGameTable; 