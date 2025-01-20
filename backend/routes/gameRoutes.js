const express = require('express');
const router = express.Router();
const { startGame, startSinglePlayerGame, hit, stand, getScores, placeBet } = require('../controllers/gameController');
const auth = require('../middleware/auth');

// Tek oyunculu oyun başlat
router.post('/start', auth, startSinglePlayerGame);

// Bahis koy
router.post('/bet/:roomId', auth, placeBet);

// Çok oyunculu oyun başlat
router.post('/start/:roomId', auth, startGame);

// Kart çek (tek oyunculu)
router.post('/hit/:gameId', auth, hit);

// Kart çek (çok oyunculu)
router.post('/hit/:roomId', auth, hit);

// Dur (tek oyunculu)
router.post('/stand/:gameId', auth, stand);

// Dur (çok oyunculu)
router.post('/stand/:roomId', auth, stand);

// Skor tablosu
router.get('/scores', getScores);

module.exports = router; 