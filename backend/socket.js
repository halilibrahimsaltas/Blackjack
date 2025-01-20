const jwt = require('jsonwebtoken');
const Room = require('./models/Room');
const Game = require('./models/Game');
const User = require('./models/User');

module.exports = (io) => {
    // Auth middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.userId;
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', async (socket) => {
        console.log('Kullanıcı bağlandı:', socket.userId);

        // Odaya katıl
        socket.on('joinRoom', async (roomId) => {
            try {
                const room = await Room.findById(roomId)
                    .populate('currentPlayers.userId', 'username chips')
                    .populate('creator', 'username');

                if (!room) {
                    socket.emit('error', 'Oda bulunamadı');
                    return;
                }

                // Önceki odalardan çık
                socket.rooms.forEach(room => {
                    if (room !== socket.id) {
                        socket.leave(room);
                    }
                });

                socket.join(roomId);
                socket.emit('roomUpdate', room);

                // Aktif oyunu kontrol et
                const game = await Game.findOne({ room: roomId, status: { $in: ['betting', 'playing'] } });
                if (game) {
                    socket.emit('gameUpdate', game);
                }
            } catch (error) {
                socket.emit('error', error.message);
            }
        });

        // Odadan ayrıl
        socket.on('leaveRoom', async (roomId) => {
            try {
                const room = await Room.findById(roomId);
                if (!room) {
                    socket.emit('error', 'Oda bulunamadı');
                    return;
                }

                // Oyuncuyu odadan çıkar
                room.currentPlayers = room.currentPlayers.filter(
                    p => p.userId.toString() !== socket.userId
                );

                // Oda boşsa sil
                if (room.currentPlayers.length === 0) {
                    await Room.findByIdAndDelete(roomId);
                    io.to(roomId).emit('roomDeleted');
                } else {
                    // Oda sahibi ayrıldıysa yeni sahip ata
                    if (room.creator.toString() === socket.userId) {
                        room.creator = room.currentPlayers[0].userId;
                        room.currentPlayers[0].isOwner = true;
                    }
                    await room.save();
                    io.to(roomId).emit('roomUpdate', room);
                }

                socket.leave(roomId);
            } catch (error) {
                socket.emit('error', error.message);
            }
        });

        // Hazır durumunu değiştir
        socket.on('toggleReady', async (roomId) => {
            try {
                const room = await Room.findById(roomId);
                if (!room) {
                    socket.emit('error', 'Oda bulunamadı');
                    return;
                }

                const player = room.currentPlayers.find(
                    p => p.userId.toString() === socket.userId
                );

                if (player) {
                    player.isReady = !player.isReady;
                    await room.save();
                    io.to(roomId).emit('roomUpdate', room);
                }
            } catch (error) {
                socket.emit('error', error.message);
            }
        });

        // Oyunu başlat
        socket.on('startGame', async (roomId) => {
            try {
                const room = await Room.findById(roomId);
                if (!room) {
                    socket.emit('error', 'Oda bulunamadı');
                    return;
                }

                // Owner kontrolü
                const isOwner = room.currentPlayers.find(
                    p => p.userId.toString() === socket.userId
                )?.isOwner;

                if (!isOwner) {
                    socket.emit('error', 'Bu işlem için yetkiniz yok');
                    return;
                }

                // Tüm oyuncular hazır mı kontrol et
                const allReady = room.currentPlayers.every(p => p.isReady);
                if (!allReady) {
                    socket.emit('error', 'Tüm oyuncular hazır değil');
                    return;
                }

                // Geri sayım başlat
                let countdown = 5;
                io.to(roomId).emit('gameStarting', countdown);

                const timer = setInterval(() => {
                    countdown--;
                    if (countdown > 0) {
                        io.to(roomId).emit('gameStarting', countdown);
                    } else {
                        clearInterval(timer);
                        io.to(roomId).emit('gameStarted');
                    }
                }, 1000);
            } catch (error) {
                socket.emit('error', error.message);
            }
        });

        // Oyuncuyu at
        socket.on('kickPlayer', async (roomId, targetUserId) => {
            try {
                const room = await Room.findById(roomId);
                if (!room) {
                    socket.emit('error', 'Oda bulunamadı');
                    return;
                }

                // Owner kontrolü
                const isOwner = room.currentPlayers.find(
                    p => p.userId.toString() === socket.userId
                )?.isOwner;

                if (!isOwner) {
                    socket.emit('error', 'Bu işlem için yetkiniz yok');
                    return;
                }

                // Oyuncuyu odadan çıkar
                room.currentPlayers = room.currentPlayers.filter(
                    p => p.userId.toString() !== targetUserId
                );
                await room.save();

                io.to(roomId).emit('roomUpdate', room);
                io.to(roomId).emit('playerKicked', targetUserId);
            } catch (error) {
                socket.emit('error', error.message);
            }
        });

        // Bahis koy
        socket.on('placeBet', async (roomId, amount) => {
            try {
                const game = await Game.findOne({ room: roomId, status: 'betting' });
                if (!game) {
                    socket.emit('error', 'Aktif oyun bulunamadı');
                    return;
                }

                const user = await User.findById(socket.userId);
                if (!user || user.chips < amount) {
                    socket.emit('error', 'Yetersiz bakiye');
                    return;
                }

                // Bahisi kaydet
                const playerIndex = game.players.findIndex(
                    p => p.playerId.toString() === socket.userId
                );

                if (playerIndex === -1) {
                    game.players.push({
                        playerId: socket.userId,
                        bet: amount,
                        hand: []
                    });
                } else {
                    game.players[playerIndex].bet = amount;
                }

                // Kullanıcının chip'lerini güncelle
                user.chips -= amount;
                await user.save();
                await game.save();

                io.to(roomId).emit('gameUpdate', game);
            } catch (error) {
                socket.emit('error', error.message);
            }
        });

        // Kart çek
        socket.on('hit', async (roomId) => {
            try {
                const game = await Game.findOne({ room: roomId, status: 'playing' });
                if (!game) {
                    socket.emit('error', 'Aktif oyun bulunamadı');
                    return;
                }

                // Sıra kontrolü
                const currentPlayer = game.players[game.currentPlayerIndex];
                if (currentPlayer.playerId.toString() !== socket.userId) {
                    socket.emit('error', 'Sıra sizde değil');
                    return;
                }

                // Kart çek
                const card = game.deck.pop();
                currentPlayer.hand.push(card);

                // El değerini kontrol et
                const handValue = game.calculateHandValue(currentPlayer.hand);
                if (handValue > 21) {
                    currentPlayer.status = 'bust';
                    await game.nextPlayer();
                }

                await game.save();
                io.to(roomId).emit('gameUpdate', game);

                // Sıradaki oyuncuya geç
                if (game.currentPlayerIndex < game.players.length) {
                    io.to(roomId).emit('turnChange', game.currentPlayerIndex + 1, 30);
                } else {
                    // Krupiye sırası
                    await game.dealerPlay();
                    io.to(roomId).emit('gameUpdate', game);
                    io.to(roomId).emit('gameEnd', game.winners);
                }
            } catch (error) {
                socket.emit('error', error.message);
            }
        });

        // Dur
        socket.on('stand', async (roomId) => {
            try {
                const game = await Game.findOne({ room: roomId, status: 'playing' });
                if (!game) {
                    socket.emit('error', 'Aktif oyun bulunamadı');
                    return;
                }

                // Sıra kontrolü
                const currentPlayer = game.players[game.currentPlayerIndex];
                if (currentPlayer.playerId.toString() !== socket.userId) {
                    socket.emit('error', 'Sıra sizde değil');
                    return;
                }

                currentPlayer.status = 'stand';
                await game.nextPlayer();
                await game.save();

                io.to(roomId).emit('gameUpdate', game);

                // Sıradaki oyuncuya geç
                if (game.currentPlayerIndex < game.players.length) {
                    io.to(roomId).emit('turnChange', game.currentPlayerIndex + 1, 30);
                } else {
                    // Krupiye sırası
                    await game.dealerPlay();
                    io.to(roomId).emit('gameUpdate', game);
                    io.to(roomId).emit('gameEnd', game.winners);
                }
            } catch (error) {
                socket.emit('error', error.message);
            }
        });

        socket.on('disconnect', () => {
            console.log('Kullanıcı ayrıldı:', socket.userId);
        });
    });
}; 