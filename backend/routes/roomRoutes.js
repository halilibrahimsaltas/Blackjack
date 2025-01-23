const express = require('express');
const router = express.Router();
const { 
  createRoom, 
  getRooms, 
  joinRoom, 
  leaveRoom, 
  getRoom,
  toggleReady,
  kickPlayer,
  startGame,
  checkActiveRoom,
  forceStartGame
} = require('../controllers/roomController');
const auth = require('../middleware/auth');

// Oda oluştur
router.post('/create', auth, createRoom);

// Odaları listele
router.get('/list', auth, getRooms);

// Aktif oda kontrolü - Bu route'u öne aldık
router.get('/active', auth, checkActiveRoom);

// Tek bir odayı getir
router.get('/:roomId', auth, getRoom);

// Odaya katıl
router.post('/join/:roomId', auth, joinRoom);

// Odadan ayrıl
router.post('/leave/:roomId', auth, leaveRoom);

// Diğer rotalar
router.post('/:roomId/ready', auth, toggleReady);
router.post('/:roomId/kick/:targetUserId', auth, kickPlayer);
router.post('/:roomId/start', auth, startGame);
router.post('/:roomId/force-start', auth, forceStartGame);

module.exports = router; 