const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    default: null
  },
  maxPlayers: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  currentPlayers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true
    },
    isReady: {
      type: Boolean,
      default: false
    },
    isOwner: {
      type: Boolean,
      default: false
    },
    chips: {
      type: Number,
      required: true
    },
    currentBet: {
      type: Number,
      default: 0
    },
    position: {
      type: Number,
      required: true,
      min: 1,
      max: 4
    }
  }],
  status: {
    type: String,
    enum: ['waiting', 'playing', 'finished'],
    default: 'waiting'
  },
  minBet: {
    type: Number,
    required: true,
    default: 10
  },
  autoStart: {
    type: Boolean,
    default: false
  },
  gameState: {
    deck: [{
      type: String
    }],
    dealerCards: [{
      type: String
    }],
    dealerScore: {
      type: Number,
      default: 0
    },
    currentTurn: {
      type: Number,
      default: null
    },
    roundStatus: {
      type: String,
      enum: ['betting', 'playing', 'finished'],
      default: 'betting'
    },
    lastAction: {
      player: String,
      action: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  }
}, {
  timestamps: true
});

// Oda oluşturulduğunda ilk oyuncu owner olarak atanır
roomSchema.pre('save', function(next) {
  if (this.isNew && this.currentPlayers.length > 0) {
    this.currentPlayers[0].isOwner = true;
    this.currentPlayers[0].position = 1;
  }
  next();
});

// Oyuncu sayısı kontrolü
roomSchema.pre('save', function(next) {
  if (this.currentPlayers.length > this.maxPlayers) {
    next(new Error('Oda maksimum oyuncu sayısına ulaştı'));
  }
  next();
});

// Oyun başlatılabilir mi kontrolü
roomSchema.methods.canStartGame = function() {
  return (
    this.status === 'waiting' &&
    this.currentPlayers.length >= 1 &&
    this.currentPlayers.every(player => player.isReady) &&
    this.currentPlayers.every(player => player.chips >= this.minBet)
  );
};

// Oyunu başlat
roomSchema.methods.startGame = function() {
  if (!this.canStartGame()) {
    throw new Error('Oyun başlatılamaz');
  }

  this.status = 'playing';
  this.gameState.roundStatus = 'betting';
  this.gameState.currentTurn = 1; // İlk pozisyondaki oyuncudan başla
  this.gameState.deck = [];
  this.gameState.dealerCards = [];
  this.gameState.dealerScore = 0;

  return this.save();
};

const Room = mongoose.model('Room', roomSchema);

module.exports = Room; 