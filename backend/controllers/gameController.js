const Game = require('../models/Game');
const Room = require('../models/Room');
const User = require('../models/User');
const { createDeck, calculateHandValue, determineWinner } = require('../utils/gameLogic');

// Oyun sonuçlarını kaydet
const saveGameResults = async (game, userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;

        const playerResults = game.players.filter(p => p.playerId.toString() === userId);
        
        // Oyun sayısını artır
        user.totalGames += 1;
        
        // Kazanan oyunları kontrol et
        for (const player of playerResults) {
            if (player.status === 'won' || player.status === 'blackjack') {
                user.gamesWon += 1;
                break; // Bir oyuncu sadece bir kez kazanabilir
            }
        }
        
        await user.save();
    } catch (error) {
        console.error('İstatistik kaydetme hatası:', error);
    }
};

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
            const { gameId } = req.params;
            const { handIndex = 0 } = req.body;
            const userId = req.user.userId;

            const game = await Game.findById(gameId);
            if (!game) {
                return res.status(404).json({ message: 'Oyun bulunamadı' });
            }

            // Oyuncuyu kontrol et
            const player = game.players[handIndex];
            if (!player || player.playerId.toString() !== userId) {
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
            } else if (handValue === 21) {
                player.status = 'stand';
            }

            // Tüm eller bittiyse oyunu bitir
            const allHandsFinished = game.players.every(p => 
                p.status !== 'playing'
            );

            if (allHandsFinished) {
                // Krupiye oyunu
                while (calculateHandValue(game.dealerHand) < 17) {
                    game.dealerHand.push(game.deck.pop());
                }

                const dealerValue = calculateHandValue(game.dealerHand);

                // Her el için sonuçları hesapla
                game.players.forEach(p => {
                    if (p.status === 'bust') return;

                    const playerValue = calculateHandValue(p.hand);

                    if (dealerValue > 21) {
                        p.status = 'won';
                    } else if (dealerValue > playerValue) {
                        p.status = 'lost';
                    } else if (dealerValue < playerValue) {
                        p.status = 'won';
                    } else {
                        p.status = 'push';
                    }
                });

                game.status = 'finished';

                // Kazanan elleri hesapla ve kullanıcıya öde
                const user = await User.findById(userId);
                let totalWinnings = 0;

                game.players.forEach(p => {
                    if (p.status === 'won') {
                        if (p.hand.length === 2 && calculateHandValue(p.hand) === 21) {
                            // Blackjack için 3:2 ödeme
                            totalWinnings += Math.floor(p.bet * 2.5);
                        } else {
                            // Normal kazanç için 1:1 ödeme
                            totalWinnings += p.bet * 2;
                        }
                    } else if (p.status === 'push') {
                        // Beraberlikte bahis iadesi
                        totalWinnings += p.bet;
                    }
                });

                if (totalWinnings > 0) {
                    user.chips += totalWinnings;
                    await user.save();
                }

                // Oyun sonuçlarını kaydet
                await saveGameResults(game, userId);

                await game.save();

                // Güncellenmiş oyun ve kullanıcı bilgilerini döndür
                return res.json({
                    game: {
                        _id: game._id,
                        players: game.players,
                        dealerHand: game.dealerHand,
                        status: game.status,
                        deck: game.deck
                    },
                    user: {
                        chips: user.chips,
                        totalGames: user.totalGames,
                        gamesWon: user.gamesWon
                    }
                });
            }

            await game.save();

            // Oyun devam ediyorsa sadece oyun durumunu döndür
            res.json({
                game: {
                    _id: game._id,
                    players: game.players,
                    dealerHand: game.dealerHand,
                    status: game.status,
                    deck: game.deck
                },
                user: {
                    chips: req.user.chips
                }
            });
        } catch (error) {
            console.error('Kart çekme hatası:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Dur
    stand: async (req, res) => {
        try {
            const { gameId } = req.params;
            const { handIndex = 0 } = req.body;
            const userId = req.user.userId;

            const game = await Game.findById(gameId);
            if (!game) {
                return res.status(404).json({ message: 'Oyun bulunamadı' });
            }

            // Oyuncuyu kontrol et
            const player = game.players[handIndex];
            if (!player || player.playerId.toString() !== userId) {
                return res.status(403).json({ message: 'Bu oyuna erişim izniniz yok' });
            }

            // Oyuncunun durumunu kontrol et
            const handValue = calculateHandValue(player.hand);
            if (handValue === 21 && player.hand.length === 2) {
                player.status = 'blackjack';
            } else if (player.status !== 'playing') {
                return res.status(400).json({ message: 'Dur diyemezsiniz' });
            } else {
                player.status = 'stand';
            }

            // Tüm eller bittiyse krupiye oyunu
            const allHandsFinished = game.players.every(p => 
                p.status !== 'playing'
            );

            if (allHandsFinished) {
                // Krupiye oyunu
                while (calculateHandValue(game.dealerHand) < 17) {
                    game.dealerHand.push(game.deck.pop());
                }

                const dealerValue = calculateHandValue(game.dealerHand);

                // Her el için sonuçları hesapla
                game.players.forEach(p => {
                    if (p.status === 'bust') return;
                    if (p.status === 'blackjack') {
                        p.status = 'won';
                        return;
                    }

                    const playerValue = calculateHandValue(p.hand);

                    if (dealerValue > 21) {
                        p.status = 'won';
                    } else if (dealerValue > playerValue) {
                        p.status = 'lost';
                    } else if (dealerValue < playerValue) {
                        p.status = 'won';
                    } else {
                        p.status = 'push';
                    }
                });

                game.status = 'finished';

                // Kazanan elleri hesapla ve kullanıcıya öde
                const user = await User.findById(userId);
                let totalWinnings = 0;

                game.players.forEach(p => {
                    if (p.status === 'won') {
                        if (p.status === 'blackjack') {
                            // Blackjack için 3:2 ödeme
                            totalWinnings += Math.floor(p.bet * 2.5);
                        } else {
                            // Normal kazanç için 1:1 ödeme
                            totalWinnings += p.bet * 2;
                        }
                    } else if (p.status === 'push') {
                        // Beraberlikte bahis iadesi
                        totalWinnings += p.bet;
                    }
                });

                if (totalWinnings > 0) {
                    user.chips += totalWinnings;
                    await user.save();
                }

                // Oyun sonuçlarını kaydet
                await saveGameResults(game, userId);

                await game.save();

                // Güncellenmiş oyun ve kullanıcı bilgilerini döndür
                return res.json({
                    game: {
                        _id: game._id,
                        players: game.players,
                        dealerHand: game.dealerHand,
                        status: game.status,
                        deck: game.deck
                    },
                    user: {
                        chips: user.chips,
                        totalGames: user.totalGames,
                        gamesWon: user.gamesWon
                    }
                });
            }

            await game.save();

            // Oyun devam ediyorsa sadece oyun durumunu döndür
            res.json({
                game: {
                    _id: game._id,
                    players: game.players,
                    dealerHand: game.dealerHand,
                    status: game.status,
                    deck: game.deck
                },
                user: {
                    chips: req.user.chips
                }
            });
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
    },

    // Split (El bölme)
    split: async (req, res) => {
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

            // Oyun durumunu kontrol et
            if (game.status !== 'playing') {
                return res.status(400).json({ message: 'Şu anda split yapamazsınız' });
            }

            // Oyuncunun elini kontrol et
            if (player.hand.length !== 2) {
                return res.status(400).json({ message: 'Split sadece ilk iki kart ile yapılabilir' });
            }

            // Kartların değerlerini kontrol et
            const [card1, card2] = player.hand;
            const value1 = card1.split('_')[0];
            const value2 = card2.split('_')[0];

            if (value1 !== value2) {
                return res.status(400).json({ message: 'Sadece aynı değerdeki kartlar split edilebilir' });
            }

            // Kullanıcının yeterli chip'i var mı kontrol et
            const user = await User.findById(userId);
            if (!user || user.chips < player.bet) {
                return res.status(400).json({ message: 'Split için yeterli bakiyeniz yok' });
            }

            // İkinci eli oluştur
            const secondHand = [card2];
            player.hand = [card1];

            // Her iki ele birer kart dağıt
            player.hand.push(game.deck.pop());
            secondHand.push(game.deck.pop());

            // İkinci eli oyuncuya ekle
            game.players.push({
                playerId: userId,
                bet: player.bet,
                hand: secondHand,
                status: 'playing',
                isSplitHand: true
            });

            // Kullanıcının chip'lerini güncelle
            user.chips -= player.bet;
            await user.save();

            // Oyun durumunu güncelle
            game.status = 'playing';
            game.currentPlayerIndex = 0;
            game.hasSplit = true;

            await game.save();

            // Güncellenmiş oyun ve kullanıcı bilgilerini döndür
            res.json({
                game: {
                    _id: game._id,
                    players: game.players,
                    dealerHand: game.dealerHand,
                    status: game.status,
                    deck: game.deck
                },
                user: {
                    chips: user.chips
                }
            });
        } catch (error) {
            console.error('Split hatası:', error);
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = gameController; 