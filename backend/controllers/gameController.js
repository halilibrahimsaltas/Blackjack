const Game = require('../models/Game');
const User = require('../models/User');
const { createDeck, calculateHandValue, determineWinner } = require('../utils/gameLogic');

// Yeni oyun başlat
const startGame = async (req, res) => {
    try {
        const { bet } = req.body;
        const userId = req.user.userId;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }

        if (!bet || bet < 10) {
            return res.status(400).json({ message: 'Minimum bahis 10 chip olmalıdır' });
        }

        if (bet > user.chips) {
            return res.status(400).json({ message: 'Yetersiz bakiye' });
        }

        const deck = createDeck();
        const playerCards = [deck.pop(), deck.pop()];
        const dealerCards = [deck.pop(), deck.pop()];

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

// Split yap
const split = async (req, res) => {
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

        // Split için kart kontrolü
        if (game.playerCards.length !== 2 || 
            game.playerCards[0].split('_')[0] !== game.playerCards[1].split('_')[0]) {
            return res.status(400).json({ message: 'Bu kartlar split edilemez' });
        }

        const user = await User.findById(userId);
        if (user.chips < game.currentBet) {
            return res.status(400).json({ message: 'Split için yeterli chip yok' });
        }

        // Split işlemi
        const deck = createDeck();
        const splitCard = game.playerCards.pop();
        game.splitCards = [splitCard];
        game.splitBet = game.currentBet;
        
        // Her ele birer kart ekle
        game.playerCards.push(deck.pop());
        game.splitCards.push(deck.pop());
        
        // Kullanıcının chip'lerini güncelle
        user.chips -= game.currentBet;
        await user.save();

        game.status = 'split_active';
        game.splitStatus = 'active';
        game.activeHand = 'main';
        await game.save();

        res.json({
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

        if (game.status !== 'active' && game.status !== 'split_active') {
            return res.status(400).json({ message: 'Bu oyun aktif değil' });
        }

        const deck = createDeck();
        const activeCards = game.activeHand === 'main' ? game.playerCards : game.splitCards;
        activeCards.push(deck.pop());

        // El değerini kontrol et
        const handValue = calculateHandValue(activeCards);
        if (handValue > 21) {
            if (game.status === 'split_active') {
                if (game.activeHand === 'main') {
                    game.activeHand = 'split';
                } else {
                    await handleSplitEnd(game, userId);
                }
            } else {
                game.status = 'dealer_won';
                const user = await User.findById(userId);
                user.totalGames += 1;
                await user.save();
            }
        }

        if (game.activeHand === 'main') {
            game.playerCards = activeCards;
        } else {
            game.splitCards = activeCards;
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

        if (game.status !== 'active' && game.status !== 'split_active') {
            return res.status(400).json({ message: 'Bu oyun aktif değil' });
        }

        // Split durumunda ve ilk el ise
        if (game.status === 'split_active' && game.activeHand === 'main') {
            game.activeHand = 'split';
            await game.save();
            return res.json({ game });
        }

        const deck = createDeck();
        
        // Krupiye için kart çek
        while (calculateHandValue(game.dealerCards) < 17) {
            game.dealerCards.push(deck.pop());
        }

        // Split durumunda
        if (game.status === 'split_active') {
            await handleSplitEnd(game, userId);
        } else {
            game.status = determineWinner(game.playerCards, game.dealerCards);
            await handleGameEnd(game, userId);
        }

        await game.save();
        const updatedUser = await User.findById(userId);
        
        res.json({
            game,
            userChips: updatedUser.chips
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Split oyun sonucunu hesapla
const handleSplitEnd = async (game, userId) => {
    const dealerValue = calculateHandValue(game.dealerCards);
    const mainHandValue = calculateHandValue(game.playerCards);
    const splitHandValue = calculateHandValue(game.splitCards);

    game.status = determineWinner(game.playerCards, game.dealerCards);
    game.splitStatus = determineWinner(game.splitCards, game.dealerCards);

    const user = await User.findById(userId);
    user.totalGames += 2; // Split olduğu için 2 el sayılır

    // Ana el için kazanç hesapla
    if (game.status === 'player_won') {
        user.chips += game.currentBet * 2;
        user.gamesWon += 1;
    } else if (game.status === 'push') {
        user.chips += game.currentBet;
    }

    // Split el için kazanç hesapla
    if (game.splitStatus === 'player_won') {
        user.chips += game.splitBet * 2;
        user.gamesWon += 1;
    } else if (game.splitStatus === 'push') {
        user.chips += game.splitBet;
    }

    await user.save();
};

// Normal oyun sonucunu hesapla
const handleGameEnd = async (game, userId) => {
    const user = await User.findById(userId);
    user.totalGames += 1;

    if (game.status === 'player_won') {
        user.chips += game.currentBet * 2;
        user.gamesWon += 1;
    } else if (game.status === 'push') {
        user.chips += game.currentBet;
    }

    await user.save();
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
    split,
    getScores
}; 