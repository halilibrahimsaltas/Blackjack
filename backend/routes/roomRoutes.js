const express = require('express');
const router = express.Router();
const { createRoom, getRooms, joinRoom, leaveRoom, getRoom } = require('../controllers/roomController');
const auth = require('../middleware/auth');

// Oda oluştur
router.post('/create', auth, createRoom);

// Odaları listele
router.get('/list', auth, getRooms);

// Tek bir odayı getir
router.get('/:roomId', auth, getRoom);

// Odaya katıl
router.post('/join/:roomId', auth, joinRoom);

// Odadan ayrıl
router.post('/leave/:roomId', auth, leaveRoom);

module.exports = router; 