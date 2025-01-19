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
    splitCards: [{
        type: String,
        default: []
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
    splitBet: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'player_won', 'dealer_won', 'push', 'split_active'],
        default: 'active'
    },
    mainHandStatus: {
        type: String,
        enum: ['active', 'player_won', 'dealer_won', 'push', 'stand'],
        default: 'active'
    },
    splitHandStatus: {
        type: String,
        enum: ['active', 'player_won', 'dealer_won', 'push', 'stand'],
        default: 'active'
    },
    splitStatus: {
        type: String,
        enum: ['none', 'active', 'player_won', 'dealer_won', 'push'],
        default: 'none'
    },
    activeHand: {
        type: String,
        enum: ['main', 'split'],
        default: 'main'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Game', gameSchema); 