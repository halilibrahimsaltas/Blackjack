const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    playerCards: [{
        type: String,
        required: true
    }],
    dealerCards: [{
        type: String,
        required: true
    }],
    currentBet: {
        type: Number,
        required: true,
        min: 10
    },
    status: {
        type: String,
        enum: ['active', 'player_won', 'dealer_won', 'push'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Game', gameSchema); 