const express = require('express');
const router = express.Router();
const { startGame, hit, stand, split, getScores } = require('../controllers/gameController');

router.post('/start', startGame);
router.post('/hit/:gameId', hit);
router.post('/stand/:gameId', stand);
router.post('/split/:gameId', split);
router.get('/scores', getScores);

module.exports = router; 