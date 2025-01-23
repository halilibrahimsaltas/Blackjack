const Game = require('../models/Game');
const Room = require('../models/Room');
const User = require('../models/User');
const { createDeck, calculateHandValue, determineWinner } = require('../utils/gameLogic');

const gameController = {
    // Bahis koy
    placeBet: async (req, res) => {
        try {
            const { roomId } = req.params;
            const { bet } = req.body;
            const userId = req.user.userId;

            const room = await Room.findById(roomId);
            if (!room) {
                return res.status(404).json({ message: 'Oda bulunamadı' });
            }

            // Oyuncuyu bul
            const player = room.currentPlayers.find(p => p.userId.toString() === userId);
            if (!player) {
                return res.status(400).json({ message: 'Bu odada değilsiniz' });
            }

            // Bahis kontrolü
            if (bet < room.minBet) {
                return res.status(400).json({ message: `Minimum bahis ${room.minBet} chip olmalıdır` });
            }

            const user = await User.findById(userId);
            if (!user || user.chips < bet) {
                return res.status(400).json({ message: 'Yetersiz bakiye' });
            }

            // Mevcut oyunu bul veya yeni oyun oluştur
            let game = await Game.findOne({ room: roomId, status: 'betting' });
            if (!game) {
                game = new Game({
                    room: roomId,
                    players: [],
                    dealerHand: [],
                    deck: createDeck()
                });
            }

            // Oyuncuyu oyuna ekle
            const playerIndex = game.players.findIndex(p => p.playerId.toString() === userId);
            if (playerIndex === -1) {
                game.players.push({
                    playerId: userId,
                    bet,
                    hand: []
                });
            } else {
                game.players[playerIndex].bet = bet;
            }

            // Kullanıcının chip'lerini güncelle
            user.chips -= bet;
            await user.save();

            await game.save();

            // Socket.io ile diğer oyunculara bildir
            req.io.to(roomId).emit('gameUpdate', game);

            res.json(game);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Kart çek
    hit: async (req, res) => {
        try {
            const { gameId, roomId } = req.params;
            const userId = req.user.userId;

            let game;
            if (gameId) {
                // Tek oyunculu mod
                game = await Game.findById(gameId);
                if (!game) {
                    return res.status(404).json({ message: 'Oyun bulunamadı' });
                }
                
                // Oyuncuyu kontrol et
                const player = game.players[0];
                if (player.playerId.toString() !== userId) {
                    return res.status(403).json({ message: 'Bu oyuna erişim izniniz yok' });
                }

                if (player.status !== 'playing') {
                    return res.status(400).json({ message: 'Kart çekemezsiniz' });
                }

                // Kart çek
                const card = game.deck.pop();
                player.hand.push(card);

                // El değerini kontrol et
                const handValue = calculateHandValue(player.hand);
                if (handValue > 21) {
                    player.status = 'bust';
                }
            } else if (roomId) {
                // Çok oyunculu mod
                game = await Game.findOne({ room: roomId, status: 'playing' });
                if (!game) {
                    return res.status(404).json({ message: 'Aktif oyun bulunamadı' });
                }

                // Sıra kontrolü
                const currentPlayer = game.players[game.currentPlayerIndex];
                if (!currentPlayer || currentPlayer.playerId.toString() !== userId) {
                    return res.status(400).json({ message: 'Sıra sizde değil' });
                }

                // Kart çek
                const card = game.deck.pop();
                currentPlayer.hand.push(card);

                // El değerini kontrol et
                const handValue = calculateHandValue(currentPlayer.hand);
                if (handValue > 21) {
                    currentPlayer.status = 'bust';
                    await game.nextPlayer();
                }
            } else {
                return res.status(400).json({ message: 'Geçersiz istek' });
            }

            await game.save();
            res.json(game);
        } catch (error) {
            console.error('Kart çekme hatası:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Dur
    stand: async (req, res) => {
        try {
            const { gameId } = req.params;
            const userId = req.user.userId;

            const game = await Game.findById(gameId);
            if (!game) {
                return res.status(404).json({ message: 'Oyun bulunamadı' });
            }

            // Oyuncuyu kontrol et
            const player = game.players[0];
            if (player.playerId.toString() !== userId) {
                return res.status(403).json({ message: 'Bu oyuna erişim izniniz yok' });
            }

            // Oyun zaten bitmişse işlemi reddet
            if (game.status === 'finished') {
                return res.status(400).json({ 
                    message: 'Oyun zaten bitmiş durumda',
                    game: game
                });
            }

            // Stand işlemine devam et...
            if (player.status !== 'playing') {
                return res.status(400).json({ message: 'Dur diyemezsiniz' });
            }

            // Oyuncunun durumunu güncelle
            player.status = 'stand';

            // Krupiye oyunu
            while (calculateHandValue(game.dealerHand) < 17) {
                game.dealerHand.push(game.deck.pop());
            }

            // Sonuçları hesapla
            const playerValue = calculateHandValue(player.hand);
            const dealerValue = calculateHandValue(game.dealerHand);

            if (dealerValue > 21) {
                player.status = 'won';
            } else if (dealerValue > playerValue) {
                player.status = 'lost';
            } else if (dealerValue < playerValue) {
                player.status = 'won';
            } else {
                player.status = 'push';
            }

            game.status = 'finished';
            await game.save();
            res.json(game);
        } catch (error) {
            console.error('Stand hatası:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Oyunu başlat
    startGame: async (req, res) => {
        try {
            const { roomId } = req.params;
            const userId = req.user.userId;

            const room = await Room.findById(roomId);
            if (!room) {
                return res.status(404).json({ message: 'Oda bulunamadı' });
            }

            // Owner kontrolü
            const isOwner = room.currentPlayers.find(
                p => p.userId.toString() === userId
            )?.isOwner;

            if (!isOwner) {
                return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
            }

            const game = await Game.findOne({ room: roomId, status: 'betting' });
            if (!game || game.players.length === 0) {
                return res.status(400).json({ message: 'Oyun başlatılamaz' });
            }

            // Tüm oyuncular bahis koymuş mu kontrol et
            if (game.players.some(p => p.bet === 0)) {
                return res.status(400).json({ message: 'Tüm oyuncular bahis koymadan oyun başlatılamaz' });
            }

            await game.startGame();

            // Socket.io ile diğer oyunculara bildir
            req.io.to(roomId).emit('gameUpdate', game);
            req.io.to(roomId).emit('turnChange', 1, 30); // İlk oyuncunun sırası, 30 saniye

            res.json(game);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Tek oyunculu oyun başlat
    startSinglePlayerGame: async (req, res) => {
        try {
            const { bet } = req.body;
            const userId = req.user.userId;

            // Kullanıcıyı kontrol et
            const user = await User.findById(userId);
            if (!user || user.chips < bet) {
                return res.status(400).json({ message: 'Yetersiz bakiye' });
            }

            // Yeni oyun oluştur
            const game = new Game({
                players: [{
                    playerId: userId,
                    bet,
                    hand: [],
                    status: 'playing'
                }],
                dealerHand: [],
                deck: createDeck(),
                status: 'playing'
            });

            // İlk kartları dağıt
            game.players[0].hand.push(game.deck.pop(), game.deck.pop());
            game.dealerHand.push(game.deck.pop(), game.deck.pop());

            // Kullanıcının chip'lerini güncelle
            user.chips -= bet;
            user.lastBetAmount = bet;
            
            await user.save();
            await game.save();

            res.json(game);
        } catch (error) {
            console.error('Oyun başlatma hatası:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Skor tablosu
    getScores: async (req, res) => {
        try {
            const users = await User.find()
                .sort({ chips: -1 })
                .limit(10)
                .select('username chips gamesWon totalGames');
            
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = gameController; 