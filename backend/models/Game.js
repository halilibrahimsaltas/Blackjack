const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: false
    },
    players: [{
        playerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        hand: [{
            type: String,
            required: true
        }],
        bet: {
            type: Number,
            default: 0
        },
        status: {
            type: String,
            enum: ['waiting', 'playing', 'stand', 'bust', 'blackjack', 'won', 'lost', 'push'],
            default: 'waiting'
        },
        isSplitHand: {
            type: Boolean,
            default: false
        }
    }],
    dealerHand: [{
        type: String,
        required: true
    }],
    dealerStatus: {
        type: String,
        enum: ['waiting', 'playing', 'stand', 'bust', 'blackjack'],
        default: 'waiting'
    },
    currentPlayerIndex: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['betting', 'playing', 'finished'],
        default: 'betting'
    },
    gameType: {
        type: String,
        enum: ['single', 'multi'],
        default: 'multi'
    },
    winners: [{
        playerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        amount: Number
    }],
    deck: [{
        type: String
    }],
    hasSplit: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Oyun başlatma metodu
gameSchema.methods.startGame = function() {
    if (this.status !== 'betting' || this.players.some(p => p.bet === 0)) {
        throw new Error('Tüm oyuncular bahis koymadan oyun başlatılamaz');
    }

    this.status = 'playing';
    this.currentPlayerIndex = 0;
    this.dealerStatus = 'waiting';

    // Her oyuncuya ikişer kart dağıt
    this.players.forEach(player => {
        player.hand = [this.deck.pop(), this.deck.pop()];
        player.status = 'playing';
    });

    // Krupiyeye iki kart dağıt
    this.dealerHand = [this.deck.pop(), this.deck.pop()];

    return this.save();
};

// Sıradaki oyuncuya geç
gameSchema.methods.nextPlayer = function() {
    this.currentPlayerIndex++;
    if (this.currentPlayerIndex >= this.players.length) {
        this.dealerPlay();
    }
    return this.save();
};

// Krupiye oyunu
gameSchema.methods.dealerPlay = async function() {
    this.dealerStatus = 'playing';
    
    // Krupiye 17 veya üstüne ulaşana kadar kart çeker
    while (this.calculateHandValue(this.dealerHand) < 17) {
        this.dealerHand.push(this.deck.pop());
    }

    const dealerValue = this.calculateHandValue(this.dealerHand);
    this.dealerStatus = dealerValue > 21 ? 'bust' : 'stand';

    // Sonuçları hesapla
    this.calculateResults();
    this.status = 'finished';

    return this.save();
};

// El değerini hesapla
gameSchema.methods.calculateHandValue = function(cards) {
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

// Sonuçları hesapla
gameSchema.methods.calculateResults = function() {
    const dealerValue = this.calculateHandValue(this.dealerHand);
    const dealerBust = dealerValue > 21;

    this.players.forEach(player => {
        const playerValue = this.calculateHandValue(player.hand);
        
        if (playerValue > 21) {
            player.status = 'bust';
            return;
        }

        if (playerValue === 21 && player.hand.length === 2) {
            player.status = 'blackjack';
            this.winners.push({
                playerId: player.playerId,
                amount: player.bet * 2.5
            });
            return;
        }

        if (dealerBust) {
            player.status = 'won';
            this.winners.push({
                playerId: player.playerId,
                amount: player.bet * 2
            });
            return;
        }

        if (playerValue > dealerValue) {
            player.status = 'won';
            this.winners.push({
                playerId: player.playerId,
                amount: player.bet * 2
            });
        } else if (playerValue === dealerValue) {
            player.status = 'push';
            this.winners.push({
                playerId: player.playerId,
                amount: player.bet
            });
        } else {
            player.status = 'lost';
        }
    });
};

module.exports = mongoose.model('Game', gameSchema); 