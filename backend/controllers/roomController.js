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

// Tek bir odayı getir
exports.getRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.userId;

    console.log('Oda detayları isteniyor:', { roomId, userId });

    // Kullanıcının başka bir odada olup olmadığını kontrol et
    const userInAnotherRoom = await Room.findOne({
      _id: { $ne: roomId },
      'currentPlayers.userId': userId
    });

    if (userInAnotherRoom) {
      return res.status(400).json({ message: 'Başka bir odada bulunuyorsunuz' });
    }

    const room = await Room.findById(roomId)
      .select('-password')
      .populate('currentPlayers.userId', 'username chips');

    if (!room) {
      console.log('Oda bulunamadı:', roomId);
      return res.status(404).json({ message: 'Oda bulunamadı' });
    }

    // Kullanıcının odada olup olmadığını kontrol et
    const existingPlayer = room.currentPlayers.find(
      player => player.userId.toString() === userId.toString()
    );

    if (!existingPlayer) {
      // Kullanıcı odada değilse ve oda dolu değilse ekle
      if (room.currentPlayers.length >= room.maxPlayers) {
        return res.status(400).json({ message: 'Oda dolu' });
      }

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

      // Kullanıcıyı odaya ekle
      const playerExists = await Room.findOne({
        _id: roomId,
        'currentPlayers.userId': userId
      });

      if (!playerExists) {
        room.currentPlayers.push({
          userId,
          username: user.username,
          chips: user.chips,
          position: newPosition,
          isReady: false,
          isOwner: false
        });

        await room.save();

        // Socket.io ile diğer oyunculara bildir
        req.io?.emit('roomUpdated', room);
      }
    }

    // Odayı tekrar populate et
    const updatedRoom = await Room.findById(roomId)
      .select('-password')
      .populate('currentPlayers.userId', 'username chips');

    console.log('Oda detayları gönderiliyor:', updatedRoom);
    res.json(updatedRoom);
  } catch (error) {
    console.error('Oda detayları getirme hatası:', error);
    res.status(500).json({ message: error.message });
  }
};

// Yeni oda oluştur
exports.createRoom = async (req, res) => {
  try {
    // Token kontrolü
    if (!req.user || !req.user.userId) {
      console.log('Token hatası:', req.user);
      return res.status(401).json({ message: 'Yetkilendirme hatası. Lütfen tekrar giriş yapın.' });
    }

    const { name, maxPlayers, password, minBet, autoStart } = req.body;
    const userId = req.user.userId;

    // Kullanıcının başka bir odada olup olmadığını kontrol et
    const existingRoom = await Room.findOne({
      'currentPlayers.userId': userId
    });

    if (existingRoom) {
      return res.status(400).json({ message: 'Zaten bir odada bulunuyorsunuz' });
    }

    // Kullanıcı bilgilerini al
    const user = await User.findById(userId);
    if (!user) {
      console.log('Kullanıcı bulunamadı:', userId);
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Aktif oda sayısını kontrol et
    const roomCount = await Room.countDocuments();
    if (roomCount >= 10) {
      return res.status(400).json({ message: 'Maksimum oda sayısına ulaşıldı' });
    }

    const room = new Room({
      name: name || `Oda ${Math.floor(Math.random() * 1000)}`,
      maxPlayers: maxPlayers || 4,
      password,
      minBet: minBet || 10,
      autoStart: autoStart || false,
      status: 'waiting',
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
    
    // Populate işlemi ve response için hazırlık
    const populatedRoom = await Room.findById(room._id)
      .select('-password')
      .populate('currentPlayers.userId', 'username chips');
    
    if (!populatedRoom) {
      throw new Error('Oda oluşturuldu fakat yüklenemedi');
    }
    
    // Socket.io ile diğer oyunculara bildir
    req.io?.emit('roomCreated', {
      _id: populatedRoom._id,
      name: populatedRoom.name,
      maxPlayers: populatedRoom.maxPlayers,
      currentPlayers: populatedRoom.currentPlayers.length
    });
    
    const response = {
      _id: populatedRoom._id,
      name: populatedRoom.name,
      maxPlayers: populatedRoom.maxPlayers,
      minBet: populatedRoom.minBet,
      autoStart: populatedRoom.autoStart,
      status: populatedRoom.status,
      currentPlayers: populatedRoom.currentPlayers,
      hasPassword: !!populatedRoom.password
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Oda oluşturma hatası:', error);
    res.status(400).json({ 
      message: error.message || 'Oda oluşturulurken bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
};

// Odaya katıl
exports.joinRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { password } = req.body;
    const userId = req.user.userId;

    console.log('Odaya katılma isteği:', { roomId, userId });

    const room = await Room.findById(roomId);
    if (!room) {
      console.log('Oda bulunamadı:', roomId);
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
      console.log('Kullanıcı bulunamadı:', userId);
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
      position: newPosition,
      isReady: false
    });

    await room.save();

    // Populate işlemi ve response için hazırlık
    const populatedRoom = await Room.findById(room._id)
      .select('-password')
      .populate('currentPlayers.userId', 'username chips');

    console.log('Odaya katılma başarılı:', populatedRoom);
    res.json(populatedRoom);
  } catch (error) {
    console.error('Odaya katılma hatası:', error);
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

// Kullanıcının kurucusu olduğu odaları sil
exports.deleteUserRooms = async (userId) => {
  try {
    console.log('Kullanıcının odaları siliniyor:', userId);
    
    // Kullanıcının owner olduğu odaları bul
    const userRooms = await Room.find({
      'currentPlayers': {
        $elemMatch: {
          userId: userId,
          isOwner: true
        }
      }
    });

    // Her bir odayı sil
    for (const room of userRooms) {
      console.log('Oda siliniyor:', room._id);
      await Room.findByIdAndDelete(room._id);
    }

    console.log(`${userRooms.length} oda silindi`);
    return true;
  } catch (error) {
    console.error('Odaları silme hatası:', error);
    return false;
  }
}; 