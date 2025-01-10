const express = require('express');
const router = express.Router();
const { startGame, hit, stand, getScores } = require('../controllers/gameController');

router.post('/start', startGame);
router.post('/hit/:gameId', hit);
router.post('/stand/:gameId', stand);
router.get('/scores', getScores);

module.exports = router; 