const Game = require('../models/Game');
const User = require('../models/User');
const { createDeck, calculateHandValue, determineWinner } = require('../utils/gameLogic');

// Yeni oyun başlat
const startGame = async (req, res) => {
    try {
        const { bet } = req.body;
        const userId = req.user.userId;
        
        // Kullanıcıyı bul
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }

        // Bahis kontrolü
        if (!bet || bet < 10) {
            return res.status(400).json({ message: 'Minimum bahis 10 chip olmalıdır' });
        }

        if (bet > user.chips) {
            return res.status(400).json({ message: 'Yetersiz bakiye' });
        }

        const deck = createDeck();
        const playerCards = [deck.pop(), deck.pop()];
        const dealerCards = [deck.pop(), deck.pop()];

        // Kullanıcının chip'lerini güncelle
        user.chips -= bet;
        await user.save();

        const game = await Game.create({
            userId,
            playerCards,
            dealerCards,
            currentBet: bet
        });

        res.status(201).json({
            game,
            userChips: user.chips
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Kart çek
const hit = async (req, res) => {
    try {
        const { gameId } = req.params;
        const userId = req.user.userId;

        const game = await Game.findOne({ _id: gameId, userId });
        if (!game) {
            return res.status(404).json({ message: 'Oyun bulunamadı' });
        }

        if (game.status !== 'active') {
            return res.status(400).json({ message: 'Bu oyun aktif değil' });
        }

        const deck = createDeck();
        game.playerCards.push(deck.pop());

        const playerValue = calculateHandValue(game.playerCards);
        if (playerValue > 21) {
            game.status = 'dealer_won';
            
            // Oyun istatistiklerini güncelle
            const user = await User.findById(userId);
            user.totalGames += 1;
            await user.save();
        }

        await game.save();
        res.json({
            game,
            userChips: (await User.findById(userId)).chips
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Dur
const stand = async (req, res) => {
    try {
        const { gameId } = req.params;
        const userId = req.user.userId;

        const game = await Game.findOne({ _id: gameId, userId });
        if (!game) {
            return res.status(404).json({ message: 'Oyun bulunamadı' });
        }

        if (game.status !== 'active') {
            return res.status(400).json({ message: 'Bu oyun aktif değil' });
        }

        const deck = createDeck();
        
        // Krupiye için kart çek
        while (calculateHandValue(game.dealerCards) < 17) {
            game.dealerCards.push(deck.pop());
        }

        game.status = determineWinner(game.playerCards, game.dealerCards);

        // Kullanıcı ve istatistikleri güncelle
        const user = await User.findById(userId);
        user.totalGames += 1;

        // Kazanç/kayıp hesapla
        if (game.status === 'player_won') {
            user.chips += game.currentBet * 2;
            user.gamesWon += 1;
        } else if (game.status === 'push') {
            user.chips += game.currentBet;
        }

        await user.save();
        await game.save();

        res.json({
            game,
            userChips: user.chips
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Skor tablosu
const getScores = async (req, res) => {
    try {
        const users = await User.find()
            .sort({ chips: -1 })
            .limit(10)
            .select('username chips gamesWon totalGames');
        
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    startGame,
    hit,
    stand,
    getScores
}; 