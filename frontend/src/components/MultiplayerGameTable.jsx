import React from 'react';
import Card from './Card';
import { toast } from 'react-hot-toast';

export default function MultiplayerGameTable({ game, room, user, onHit, onStand, onBet, currentTurn, timeLeft }) {
  if (!game || !room) {
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

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

  const isCurrentPlayer = (player) => {
    return player.userId === user._id && game.currentPlayerIndex === game.players.indexOf(player);
  };

  const renderPlayerHand = (player, index) => {
    const isCurrentPlayerTurn = isCurrentPlayer(player);
    const handValue = calculateHandValue(player.hand);
    const playerName = player.userId.username || 'Oyuncu';

    return (
      <div key={index} className={`mb-8 p-4 rounded-lg ${isCurrentPlayerTurn ? 'bg-yellow-900/30 ring-2 ring-yellow-500' : 'bg-gray-800/50'}`}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-yellow-500 font-bold">{playerName}</span>
            <span className="text-gray-400 ml-2">({player.bet} Chip)</span>
          </div>
          <div className="text-yellow-400">
            El Değeri: {handValue}
          </div>
        </div>
        
        <div className="flex gap-4 min-h-[140px] items-center justify-center">
          {player.hand.map((card, cardIndex) => (
            <Card key={cardIndex} card={card} />
          ))}
        </div>

        {isCurrentPlayerTurn && game.status === 'playing' && (
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={() => onHit()}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Kart Çek
            </button>
            <button
              onClick={() => onStand()}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Dur
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#111827] py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Üst Bilgi Alanı */}
        <div className="bg-gray-800 rounded-lg p-4 mb-8 flex justify-between items-center">
          <div className="text-yellow-500">
            Oda: {room.name}
          </div>
          <div className="text-center">
            <div className="text-yellow-400 font-bold text-xl mb-1">
              {timeLeft}s
            </div>
            <div className="text-gray-400 text-sm">
              Kalan Süre
            </div>
          </div>
          <div className="text-yellow-500">
            Bahis: {game.players.find(p => p.userId === user._id)?.bet || 0} Chip
          </div>
        </div>

        {/* Krupiye Alanı */}
        <div className="bg-gray-800/50 rounded-lg p-6 mb-8">
          <h3 className="text-yellow-500 font-bold mb-4">Krupiye</h3>
          <div className="flex gap-4 min-h-[140px] items-center justify-center">
            {game.dealerHand.map((card, index) => (
              <Card 
                key={index} 
                card={index === 0 || game.status === 'finished' ? card : 'back'} 
              />
            ))}
          </div>
          {game.status === 'finished' && (
            <div className="text-center mt-4 text-yellow-400">
              El Değeri: {calculateHandValue(game.dealerHand)}
            </div>
          )}
        </div>

        {/* Oyuncular Alanı */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {game.players.map((player, index) => renderPlayerHand(player, index))}
        </div>

        {/* Oyun Durumu */}
        {game.status === 'finished' && (
          <div className="mt-8 text-center">
            <h3 className="text-2xl font-bold text-yellow-500 mb-4">
              Oyun Bitti!
            </h3>
            <button
              onClick={() => navigate(`/room/${room._id}`)}
              className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Odaya Dön
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 