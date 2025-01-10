const Game = require('../models/Game');
const { createDeck, calculateHandValue, determineWinner } = require('../utils/gameLogic');

// Yeni oyun başlat
const startGame = async (req, res) => {
    try {
        const { bet } = req.body;
        
        if (!bet || bet < 10) {
            return res.status(400).json({ message: 'Minimum bahis 10 chip olmalıdır' });
        }

        const deck = createDeck();
        const playerCards = [deck.pop(), deck.pop()];
        const dealerCards = [deck.pop(), deck.pop()];

        const game = await Game.create({
            playerCards,
            dealerCards,
            currentBet: bet,
            chips: 1000 - bet
        });

        res.status(201).json(game);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Kart çek
const hit = async (req, res) => {
    try {
        const { gameId } = req.params;
        const game = await Game.findById(gameId);

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
        }

        await game.save();
        res.json(game);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Dur
const stand = async (req, res) => {
    try {
        const { gameId } = req.params;
        const game = await Game.findById(gameId);

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

        // Kazanç/kayıp hesapla
        if (game.status === 'player_won') {
            game.chips += game.currentBet * 2;
        } else if (game.status === 'push') {
            game.chips += game.currentBet;
        }

        await game.save();
        res.json(game);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Skor tablosu
const getScores = async (req, res) => {
    try {
        const games = await Game.find()
            .sort({ chips: -1 })
            .limit(10)
            .select('chips createdAt');
        
        res.json(games);
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