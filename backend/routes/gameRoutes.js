const express = require('express');
const router = express.Router();
const { startGame, startSinglePlayerGame, hit, stand, getScores, placeBet, split, getGame, placeBetMulti, startMultiplayerGame } = require('../controllers/gameController');
const auth = require('../middleware/auth');

// Tek oyunculu oyun başlat
router.post('/start', auth, startSinglePlayerGame);

// Bahis koy
router.post('/bet/:roomId', auth, placeBet);

// Çok oyunculu oyun başlat
router.post('/start/:roomId', auth, startGame);

// Kart çek (tek oyunculu)
router.post('/hit/single/:gameId', auth, hit);

// Kart çek (çok oyunculu)
router.post('/hit/multi/:roomId', auth, hit);

// Dur (tek oyunculu)
router.post('/stand/single/:gameId', auth, stand);

// Dur (çok oyunculu)
router.post('/stand/multi/:roomId', auth, stand);

// Split (el bölme)
router.post('/split/:gameId', auth, split);

// Skor tablosu
router.get('/scores', auth, getScores);

// Oyun detaylarını getirme
router.get('/:roomId', auth, getGame);

// Yeni çok oyunculu oyun route'ları
router.post('/bet/multi', auth, placeBetMulti);
router.post('/start/multi/:roomId/:gameId', auth, startMultiplayerGame);

module.exports = router; 