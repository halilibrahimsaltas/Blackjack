# Blackjack Çok Oyunculu Özellikler

## Genel Bakış

Bu belge, Blackjack oyununun çok oyunculu özelliklerini ve yapılan güncellemeleri açıklar.

## Özellikler

### Oda Sistemi

- Maksimum 10 oda
- Her odada 1-4 oyuncu
- Oda sahibi kontrolü (oyunu başlatma, oyuncu atma)
- Otomatik oda silme (boş odalar)
- Minimum bahis limiti
- Oda durumu takibi

### Oyun Modları

- Tek Oyunculu
  - Direkt oyun başlatma
  - Basitleştirilmiş arayüz
  - Hızlı oyun deneyimi
  - Otomatik bahis hatırlama
- Çok Oyunculu
  - Oda tabanlı sistem
  - Sıralı oyun
  - Oyuncu etkileşimleri
  - Gerçek zamanlı bahis sistemi
  - El bölme özelliği

### Bahis Sistemi

- Görsel chip seçici
- Minimum ve maksimum bahis limitleri
- Sürükle-bırak chip yerleştirme
- Hızlı bahis seçenekleri
- Son bahis hatırlama özelliği

### Socket.io Entegrasyonu

- Gerçek zamanlı oda güncellemeleri
- Oyuncu durum değişiklikleri
- Oyun olayları bildirimleri
- Bahis durumu güncellemeleri
- Sıra değişimi bildirimleri

### Güvenlik

- JWT tabanlı kimlik doğrulama
- Oda sahibi yetkilendirmesi
- Oyuncu doğrulama
- Bahis limiti kontrolleri
- Oyun durumu doğrulaması

## API Endpoints

### Oyun

- POST /api/game/start/single - Tek oyunculu oyun başlat
- POST /api/game/start/:roomId - Çok oyunculu oyun başlat
- POST /api/game/hit/single/:gameId - Tek oyunculu kart çek
- POST /api/game/hit/:roomId - Çok oyunculu kart çek
- POST /api/game/stand/single/:gameId - Tek oyunculu dur
- POST /api/game/stand/:roomId - Çok oyunculu dur
- POST /api/game/bet/:roomId - Bahis koy
- POST /api/game/split/:gameId - El böl

### Oda

- GET /api/room - Odaları listele
- POST /api/room - Oda oluştur
- DELETE /api/room/:id - Oda sil
- POST /api/room/join/:id - Odaya katıl
- POST /api/room/leave/:id - Odadan ayrıl
- GET /api/room/:id - Oda detaylarını getir

## Socket Events

- roomUpdate - Oda durumu güncellendi
- gameUpdate - Oyun durumu güncellendi
- playerJoined - Yeni oyuncu katıldı
- playerLeft - Oyuncu ayrıldı
- gameStarted - Oyun başladı
- turnChange - Sıra değişti
- gameEnd - Oyun bitti
- betPlaced - Bahis konuldu
- handSplit - El bölündü

## Yapılan Güncellemeler

1. Backend

   - Tek/Çok oyunculu route'lar ayrıldı
   - Socket.io middleware düzenlendi
   - Oyun kontrolcüsü güncellendi
   - Bahis sistemi iyileştirildi
   - El bölme özelliği eklendi
   - Oyun sonuç hesaplaması geliştirildi

2. Frontend
   - Oyun modu seçimi eklendi
   - API çağrıları güncellendi
   - Gerçek zamanlı güncellemeler eklendi
   - Görsel chip seçici eklendi
   - Oyun masası arayüzü yenilendi
   - Kart animasyonları eklendi
   - Bahis arayüzü geliştirildi

## Gelecek Güncellemeler

- [ ] Oyuncu sohbet sistemi
- [ ] Özel oda şifreleri
- [ ] Turnuva modu
- [ ] Başarım sistemi
- [ ] İstatistik takip sistemi
- [ ] Oyuncu profil sayfası
- [ ] Arkadaş sistemi
