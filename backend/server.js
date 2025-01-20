const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Room = require('./models/Room');
const User = require('./models/User');
const authRoutes = require('./routes/authRoutes');
const gameRoutes = require('./routes/gameRoutes');
const roomRoutes = require('./routes/roomRoutes');
const initializeSocket = require('./socket');

dotenv.config();
const app = express();
const httpServer = createServer(app);

// Socket.io kurulumu
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Socket.io'yu request objesine ekle
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/room', roomRoutes);

// Socket.io
initializeSocket(io);

// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB bağlantısı başarılı'))
  .catch(err => console.error('MongoDB bağlantı hatası:', err));

// Socket.io auth middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return next(new Error('User not found'));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Socket.io bağlantı yönetimi
io.on('connection', (socket) => {
  console.log('Yeni kullanıcı bağlandı:', socket.user.username);

  // Odaya katılma
  socket.on('joinRoom', async (roomId) => {
    try {
      const room = await Room.findById(roomId);
      if (!room) {
        socket.emit('error', 'Oda bulunamadı');
        return;
      }

      // Önceki odadan çık
      if (socket.roomId) {
        socket.leave(socket.roomId);
      }

      socket.join(roomId);
      socket.roomId = roomId;

      // Odadaki herkese güncellemeyi gönder
      io.to(roomId).emit('roomUpdate', room);
    } catch (error) {
      socket.emit('error', error.message);
    }
  });

  // Odadan ayrılma
  socket.on('leaveRoom', async (roomId) => {
    try {
      const room = await Room.findById(roomId);
      if (!room) return;

      // Oyuncuyu odadan çıkar
      const playerIndex = room.currentPlayers.findIndex(
        p => p.userId.toString() === socket.user._id.toString()
      );

      if (playerIndex !== -1) {
        room.currentPlayers.splice(playerIndex, 1);
        await room.save();

        socket.leave(roomId);
        delete socket.roomId;

        // Oda boşsa sil
        if (room.currentPlayers.length === 0) {
          await Room.findByIdAndDelete(roomId);
          io.emit('roomDeleted', roomId);
        } else {
          // Yeni owner ata
          if (playerIndex === 0) {
            room.currentPlayers[0].isOwner = true;
            await room.save();
          }
          io.to(roomId).emit('roomUpdate', room);
        }
      }
    } catch (error) {
      socket.emit('error', error.message);
    }
  });

  // Hazır durumu değiştirme
  socket.on('toggleReady', async (roomId) => {
    try {
      const room = await Room.findById(roomId);
      if (!room) return;

      const player = room.currentPlayers.find(
        p => p.userId.toString() === socket.user._id.toString()
      );

      if (player) {
        player.isReady = !player.isReady;
        await room.save();

        // Otomatik başlatma kontrolü
        if (room.autoStart && 
            room.currentPlayers.length >= 1 && 
            room.currentPlayers.every(p => p.isReady)) {
          room.status = 'playing';
          await room.save();
          io.to(roomId).emit('gameStarted', roomId);
        } else {
          io.to(roomId).emit('roomUpdate', room);
        }
      }
    } catch (error) {
      socket.emit('error', error.message);
    }
  });

  // Oyunu başlat
  socket.on('startGame', async (roomId) => {
    try {
      const room = await Room.findById(roomId);
      if (!room) return;

      // Owner kontrolü
      const isOwner = room.currentPlayers.find(
        p => p.userId.toString() === socket.user._id.toString()
      )?.isOwner;

      if (!isOwner) {
        socket.emit('error', 'Bu işlem için yetkiniz yok');
        return;
      }

      if (room.canStartGame()) {
        await room.startGame();
        io.to(roomId).emit('gameStarted', roomId);
      } else {
        socket.emit('error', 'Oyun başlatılamaz');
      }
    } catch (error) {
      socket.emit('error', error.message);
    }
  });

  // Oyuncuyu at
  socket.on('kickPlayer', async (roomId, targetUserId) => {
    try {
      const room = await Room.findById(roomId);
      if (!room) return;

      // Owner kontrolü
      const isOwner = room.currentPlayers.find(
        p => p.userId.toString() === socket.user._id.toString()
      )?.isOwner;

      if (!isOwner) {
        socket.emit('error', 'Bu işlem için yetkiniz yok');
        return;
      }

      const playerIndex = room.currentPlayers.findIndex(
        p => p.userId.toString() === targetUserId
      );

      if (playerIndex !== -1) {
        room.currentPlayers.splice(playerIndex, 1);
        await room.save();

        // Atılan oyuncuya bildirim gönder
        io.to(roomId).emit('playerKicked', roomId, targetUserId);
        io.to(roomId).emit('roomUpdate', room);
      }
    } catch (error) {
      socket.emit('error', error.message);
    }
  });

  // Bağlantı koptuğunda
  socket.on('disconnect', async () => {
    console.log('Kullanıcı ayrıldı:', socket.user.username);
    if (socket.roomId) {
      // Odadan otomatik çıkış
      socket.emit('leaveRoom', socket.roomId);
    }
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
}); 