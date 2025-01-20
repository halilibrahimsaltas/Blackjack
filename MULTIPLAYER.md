# Blackjack Multiplayer Planlaması 🎮

## 1. Giriş Ekranı Değişiklikleri 🚪

### Yeni Ana Menü

- [ ] Oyun modu seçim ekranı
  - Single Player butonu
  - Multiplayer butonu
- [ ] Multiplayer seçildiğinde oda listesi görünümü
- [ ] Single Player seçildiğinde mevcut oyun akışı

## 2. Oda Sistemi 🏠

### Oda Listesi Özellikleri

- [ ] Maksimum 10 oda sınırı
- [ ] Her odada 1-4 oyuncu kapasitesi
- [ ] Oda bilgileri:
  - Oda adı
  - Oyuncu sayısı (mevcut/maksimum)
  - Oda durumu (bekliyor/oyunda)
  - Şifreli/açık oda göstergesi
  - Oda sahibi bilgisi
  - Oda daki herhangi bir oyun oyundan çıkarsa odadan otomatik olarak çıkış yapılır.
    -Odadaki oyunculaın ready olup olmadığını gösteren bir buton

### Oda Oluşturma

- [ ] Oda ayarları:
  - Oda adı
  - Maksimum oyuncu sayısı (1-4)
  - Şifre (opsiyonel)
  - Minimum bahis miktarı
  - Otomatik başlatma seçeneği

### Oda İşlemleri

- [ ] Odaya katılma
  - Şifre kontrolü (gerekirse)
  - Kapasite kontrolü
- [ ] Odadan ayrılma
- [ ] Oda sahibi yetkileri:
  - Oyunu başlatma
  - Oyuncu atma
  - Odayı kapatma

## 3. Backend Değişiklikleri 🔧

### Yeni Modeller

- [ ] Room Model:
  ```javascript
  {
    name: String,
    password: String (optional),
    maxPlayers: Number (1-4),
    currentPlayers: [{
      userId: ObjectId,
      username: String,
      isReady: Boolean,
      isOwner: Boolean,
      chips: Number,
      currentBet: Number,
      position: Number // Masadaki pozisyonu (1-4)
    }],
    status: String (waiting/playing),
    minBet: Number,
    autoStart: Boolean,
    gameState: {
      deck: Array,
      dealerCards: Array,
      dealerScore: Number,
      currentTurn: Number, // Şu anki oyuncunun pozisyonu
      roundStatus: String (betting/playing/finished),
      lastAction: {
        player: String,
        action: String,
        timestamp: Date
      }
    },
    createdAt: Date
  }
  ```

### Yeni API Endpoint'leri

- [ ] Oda İşlemleri:
  - POST /api/room/create
  - GET /api/room/list
  - POST /api/room/join/:roomId
  - POST /api/room/leave/:roomId
  - DELETE /api/room/:roomId
  - POST /api/room/kick/:roomId/:userId
  - POST /api/room/start/:roomId

### Socket.io Entegrasyonu

- [ ] Real-time güncellemeler için:
  - Oda listesi güncellemeleri
  - Oyuncu durumu değişiklikleri
  - Oyun durumu güncellemeleri
  - Oda içi chat sistemi (daha sonra oyun masasına taşınabilir)

## 4. Frontend Değişiklikleri 🎨

### Yeni Bileşenler

- [ ] RoomList.jsx:
  - Oda listesi görünümü
  - Filtreleme ve arama özellikleri
- [ ] CreateRoom.jsx:
  - Oda oluşturma formu
- [ ] RoomDetails.jsx:
  - Oda içi görünüm
  - Oyuncu listesi
  - Hazır olma durumu
  - Chat bileşeni (sol tarafta, modüler yapıda)
- [ ] Chat.jsx:
  - Mesaj listesi
  - Mesaj gönderme formu
  - Emoji desteği
  - Modüler yapı (farklı sayfalarda kullanılabilir)

### Oyun Masası Güncellemeleri

- [ ] Çoklu oyuncu desteği:
  - Her oyuncunun eli için ayrı alan
  - Sıra göstergesi
  - Oyuncu durum bilgileri
- [ ] Chat sistemi entegrasyonu (daha sonra eklenecek)

## 5. Oyun Mantığı Güncellemeleri 🎲

### Multiplayer Oyun Akışı

- [ ] Sıralı oyun sistemi:
  - Her oyuncunun sırası geldiğinde aksiyonlar
  - Zaman sınırı kontrolü
- [ ] Krupiye mantığı:
  - Tüm oyuncular bittikten sonra krupiye aksiyonları
- [ ] Kazanan belirleme:
  - Her oyuncunun eli için ayrı değerlendirme
  - Kazanç/kayıp hesaplamaları

### Özel Durumlar

- [ ] Oyuncu ayrılma durumu
- [ ] Bağlantı kopması durumu
- [ ] Zaman aşımı durumu

### Oyun Akış Kontrolü

- [ ] Oyun Başlatma:

  - Tüm oyuncular ready olmalı
  - Minimum 2 oyuncu gerekli
  - Oda sahibi başlatabilir
  - Her oyuncunun yeterli chip'i olmalı

- [ ] Oyun Sırası:

  - Pozisyon numarasına göre sıralı ilerleme
  - Her oyuncuya 30 saniye süre
  - Süre bitiminde otomatik "stand"
  - Tüm oyuncular bitince dealer kartları açılır

- [ ] Oyuncu Ayrılma Durumu:
  - Oyun devam ediyorsa el otomatik "stand"
  - Oyuncu chip'leri korunur
  - Minimum oyuncu sayısının altına düşerse oyun iptal

### GameBoard Güncellemeleri

- [ ] Çoklu Oyuncu Görünümü:

  ```jsx
  <GameBoard>
    <DealerArea>
      <DealerCards />
      <DealerScore />
    </DealerArea>

    <PlayersArea>
      {/* Her oyuncu için ayrı bölüm */}
      <PlayerSection>
        <PlayerInfo>
          <Username />
          <Chips />
          <CurrentBet />
          <Timer /> {/* Sırası geldiğinde */}
        </PlayerInfo>
        <PlayerCards />
        <PlayerScore />
        <PlayerActions /> {/* Sırası geldiğinde */}
      </PlayerSection>
    </PlayersArea>

    <GameInfo>
      <CurrentTurn />
      <RoundStatus />
      <Timer />
    </GameInfo>
  </GameBoard>
  ```

### Socket Events

- [ ] Oyun Eventi:

  ```javascript
  // Oyun Başlatma
  socket.on("gameStart", (roomId) => {
    // Kartları dağıt
    // İlk oyuncuya sıra ver
  });

  // Oyuncu Aksiyonu
  socket.on("playerAction", (roomId, action) => {
    // Hit, Stand, Split işlemleri
    // Sıradaki oyuncuya geç
  });

  // Sıra Değişimi
  socket.on("turnChange", (roomId, nextPosition) => {
    // Timer'ı resetle
    // UI'ı güncelle
  });

  // Oyun Sonu
  socket.on("gameEnd", (roomId, results) => {
    // Kazananları belirle
    // Chip'leri dağıt
    // Yeni el için hazırla
  });
  ```

### Basit State Yönetimi

```javascript
const roomState = {
  gameStatus: 'waiting/playing/finished',
  currentTurn: playerPosition,
  players: Map<position, playerInfo>,
  dealer: {
    cards: [],
    score: 0,
    isRevealed: false
  },
  timer: number,
  lastAction: {
    player: string,
    action: string,
    timestamp: Date
  }
}
```

### Ücretsiz Domain Optimizasyonları

- [ ] Veri Transferi Optimizasyonu:

  - Minimum veri gönderimi
  - Batch updates
  - Gereksiz real-time güncellemeleri engelleme

- [ ] Resource Kullanımı:
  - Maximum 10 oda sınırı
  - Oda başına maximum 4 oyuncu
  - Inactive odaları otomatik kapatma (15 dakika)
  - Bağlantısı kopan oyuncuları otomatik çıkarma (30 saniye)

## 6. Temel Güvenlik ve Optimizasyon 🔒

### Temel Güvenlik Önlemleri

- [ ] Basit şifre kontrolü (opsiyonel odalar için)
- [ ] Temel kullanıcı yetkilendirmesi (oda sahibi/üye)

### Performans Optimizasyonları

- [ ] Socket bağlantı yönetimi
- [ ] State yönetimi
- [ ] Basit hata yakalama

## 7. Test Planı 🧪

### Test Senaryoları

- [ ] Oda oluşturma/katılma testleri
- [ ] Oyun akış testleri
- [ ] Çoklu oyuncu etkileşim testleri
- [ ] Hata durumu testleri
- [ ] Yük testleri

## 8. Deployment Gereksinimleri 🚀

### Server Gereksinimleri

- [ ] Socket.io desteği
- [ ] Temel RAM ve CPU gereksinimleri
- [ ] Local development ortamı

### Basit Monitoring

- [ ] Aktif oda sayısı
- [ ] Toplam oyuncu sayısı
- [ ] Temel hata loglama
