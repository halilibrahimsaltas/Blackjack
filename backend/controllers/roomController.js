const Room = require('../models/Room');
const User = require('../models/User');

// Oda listesini getir
exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find()
      .select('-password')
      .populate('currentPlayers.userId', 'username chips');
    
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Yeni oda oluştur
exports.createRoom = async (req, res) => {
  try {
    const { name, maxPlayers, password, minBet, autoStart } = req.body;
    const userId = req.user._id;

    // Kullanıcı bilgilerini al
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Aktif oda sayısını kontrol et
    const roomCount = await Room.countDocuments();
    if (roomCount >= 10) {
      return res.status(400).json({ message: 'Maksimum oda sayısına ulaşıldı' });
    }

    const room = new Room({
      name,
      maxPlayers,
      password,
      minBet,
      autoStart,
      currentPlayers: [{
        userId,
        username: user.username,
        chips: user.chips,
        position: 1,
        isOwner: true,
        isReady: true
      }]
    });

    await room.save();
    
    const populatedRoom = await Room.findById(room._id)
      .select('-password')
      .populate('currentPlayers.userId', 'username chips');
    
    res.status(201).json(populatedRoom);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Odaya katıl
exports.joinRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { password } = req.body;
    const userId = req.user._id;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Oda bulunamadı' });
    }

    // Şifre kontrolü
    if (room.password && room.password !== password) {
      return res.status(401).json({ message: 'Yanlış şifre' });
    }

    // Kapasite kontrolü
    if (room.currentPlayers.length >= room.maxPlayers) {
      return res.status(400).json({ message: 'Oda dolu' });
    }

    // Kullanıcı zaten odada mı?
    if (room.currentPlayers.some(player => player.userId.toString() === userId)) {
      return res.status(400).json({ message: 'Zaten odasınız' });
    }

    // Kullanıcı bilgilerini al
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Minimum bet kontrolü
    if (user.chips < room.minBet) {
      return res.status(400).json({ message: 'Yetersiz chips' });
    }

    // Pozisyon belirle
    const positions = room.currentPlayers.map(p => p.position);
    let newPosition = 1;
    while (positions.includes(newPosition)) newPosition++;

    room.currentPlayers.push({
      userId,
      username: user.username,
      chips: user.chips,
      position: newPosition
    });

    await room.save();
    res.json(room);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Odadan ayrıl
exports.leaveRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Oda bulunamadı' });
    }

    const playerIndex = room.currentPlayers.findIndex(
      player => player.userId.toString() === userId
    );

    if (playerIndex === -1) {
      return res.status(400).json({ message: 'Bu odada değilsiniz' });
    }

    // Oyun devam ediyorsa ve oyuncu oyundaysa
    if (room.status === 'playing') {
      // Oyunu iptal et veya oyuncuyu stand durumuna getir
      // TODO: Oyun mantığı eklenecek
    }

    room.currentPlayers.splice(playerIndex, 1);

    // Eğer oda boşsa odayı sil
    if (room.currentPlayers.length === 0) {
      await Room.findByIdAndDelete(roomId);
      return res.json({ message: 'Oda silindi' });
    }

    // Eğer owner ayrıldıysa yeni owner ata
    if (playerIndex === 0) {
      room.currentPlayers[0].isOwner = true;
    }

    await room.save();
    res.json(room);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Oyuncuyu hazır durumuna getir
exports.toggleReady = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Oda bulunamadı' });
    }

    const player = room.currentPlayers.find(
      player => player.userId.toString() === userId
    );

    if (!player) {
      return res.status(400).json({ message: 'Bu odada değilsiniz' });
    }

    player.isReady = !player.isReady;
    await room.save();

    // Eğer autoStart açıksa ve tüm oyuncular hazırsa oyunu başlat
    if (room.autoStart && room.currentPlayers.length >= 1 && 
        room.currentPlayers.every(p => p.isReady)) {
      // TODO: Oyunu başlat
    }

    res.json(room);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Oyuncuyu odadan at (sadece owner)
exports.kickPlayer = async (req, res) => {
  try {
    const { roomId, targetUserId } = req.params;
    const userId = req.user._id;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Oda bulunamadı' });
    }

    // Owner kontrolü
    const isOwner = room.currentPlayers.find(
      player => player.userId.toString() === userId
    )?.isOwner;

    if (!isOwner) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    const playerIndex = room.currentPlayers.findIndex(
      player => player.userId.toString() === targetUserId
    );

    if (playerIndex === -1) {
      return res.status(400).json({ message: 'Oyuncu bulunamadı' });
    }

    room.currentPlayers.splice(playerIndex, 1);
    await room.save();

    res.json(room);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Oyunu başlat
exports.startGame = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Oda bulunamadı' });
    }

    // Owner kontrolü
    const isOwner = room.currentPlayers.find(
      player => player.userId.toString() === userId
    )?.isOwner;

    if (!isOwner) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    // Oyun başlatılabilir mi kontrolü
    if (!room.canStartGame()) {
      return res.status(400).json({ 
        message: 'Oyun başlatılamaz. Tüm oyuncuların hazır olması ve yeterli chip\'e sahip olması gerekiyor.' 
      });
    }

    await room.startGame();
    res.json(room);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 