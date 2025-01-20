const express = require('express');
const router = express.Router();
const { createRoom, getRooms, joinRoom, leaveRoom } = require('../controllers/roomController');
const auth = require('../middleware/auth');

// Oda oluştur
router.post('/create', auth, createRoom);

// Odaları listele
router.get('/', auth, getRooms);

// Odaya katıl
router.post('/join/:roomId', auth, joinRoom);

// Odadan ayrıl
router.post('/leave/:roomId', auth, leaveRoom);

module.exports = router; 