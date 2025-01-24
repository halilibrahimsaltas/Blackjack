# Blackjack Projesi Detaylı Şema ve Bileşen Açıklamaları 📋

## Proje Yapısı 🏗

```
blackjack/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── containers/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── utils/
│   └── public/
└── backend/
    ├── controllers/
    ├── models/
    ├── routes/
    ├── middleware/
    ├── utils/
    └── config/
```

## Frontend Bileşenleri 🎨

### Components/

#### 1. Navbar.jsx

- Üst gezinme çubuğu
- Kullanıcı oturum durumu kontrolü
- Oyun modu seçimi
- Profil ve çıkış işlemleri

#### 2. GameModeSelect.jsx

- Tek oyunculu/Çok oyunculu mod seçimi
- Görsel mod kartları
- Mod açıklamaları ve özellikler

#### 3. MultiplayerGameTable.jsx

- Çok oyunculu oyun masası görünümü
- Kart dağıtım animasyonları
- Oyuncu pozisyonları
- Bahis alanları
- Krupiye alanı

#### 4. MultiplayerBetForm.jsx

- Bahis form kontrolü
- Chip seçimi ve yerleştirme
- Bahis limitleri kontrolü
- Bahis onaylama

#### 5. RoomList.jsx

- Mevcut odaların listesi
- Oda durumları ve detayları
- Katılım/Oluşturma butonları
- Anlık oda güncellemeleri

#### 6. RoomDetails.jsx

- Oda detay bilgileri
- Oyuncu listesi
- Oda ayarları
- Oyun başlatma kontrolü

#### 7. ChipSelector.jsx

- Görsel chip seçici
- Sürükle-bırak desteği
- Chip değerleri
- Animasyonlu etkileşimler

#### 8. BetForm.jsx

- Tek oyunculu bahis formu
- Hızlı bahis seçenekleri
- Bahis geçmişi
- Otomatik bahis hatırlama

### Containers/

#### 1. MultiplayerGame.jsx

- Çok oyunculu oyun mantığı
- Socket bağlantıları
- Oyun durumu yönetimi
- Oyuncu etkileşimleri

#### 2. RoomContainer.jsx

- Oda yönetimi
- Oyuncu katılım/ayrılma işlemleri
- Oda ayarları kontrolü
- Gerçek zamanlı güncellemeler

## Backend Yapısı 🔧

### Controllers/

#### 1. authController.js

- Kullanıcı kimlik doğrulama
- JWT token yönetimi
- Oturum kontrolü
- Güvenlik önlemleri

#### 2. gameController.js

- Oyun mantığı
- Kart dağıtımı
- Skor hesaplama
- Oyun durumu kontrolü

#### 3. roomController.js

- Oda oluşturma/silme
- Oyuncu yönetimi
- Oda ayarları
- Oda durumu kontrolü

### Models/

#### 1. Room.js

- Oda şeması
- Oyuncu listesi
- Oyun durumu
- Bahis bilgileri

### Socket.io İşlemleri 🔌

#### socket.js

- Gerçek zamanlı bağlantı yönetimi
- Oyun olayları
- Oda güncellemeleri
- Oyuncu etkileşimleri

## Veri Akışı 🔄

1. Kullanıcı Girişi

   - JWT token oluşturma
   - Oturum başlatma
   - Kullanıcı doğrulama

2. Oyun Başlatma

   - Mod seçimi
   - Oda oluşturma/katılma
   - İlk bahis turu

3. Oyun Akışı

   - Kart dağıtımı
   - Oyuncu aksiyonları
   - Skor hesaplama
   - Kazanan belirleme

4. Gerçek Zamanlı İletişim
   - Socket bağlantıları
   - Durum güncellemeleri
   - Oyuncu etkileşimleri
   - Bahis işlemleri

## Güvenlik Önlemleri 🔒

1. Kimlik Doğrulama

   - JWT tabanlı doğrulama
   - Token yenileme
   - Oturum kontrolü

2. Oyun Güvenliği

   - Bahis limiti kontrolleri
   - Oyun durumu doğrulama
   - Hile önleme sistemleri

3. Veri Güvenliği
   - Şifreli iletişim
   - Veri doğrulama
   - Hata yönetimi

## Performans Optimizasyonları ⚡

1. Frontend

   - Lazy loading
   - Memoization
   - Önbellek yönetimi
   - Animasyon optimizasyonları

2. Backend
   - Database indexing
   - Socket bağlantı optimizasyonu
   - Rate limiting
   - Bellek yönetimi

## Kullanılan Teknolojiler 🛠️

### Frontend Teknolojileri

#### 1. Temel Teknolojiler

- **React (Vite)**: Hızlı geliştirme ve optimum performans için
- **TypeScript**: Tip güvenliği ve kod kalitesi için
- **Tailwind CSS**: Modern ve responsive tasarım için
- **React Router DOM**: Sayfa yönlendirmeleri için

#### 2. State Yönetimi

- **React Context API**: Global durum yönetimi
- **React Hooks**: Bileşen yaşam döngüsü ve durum yönetimi

#### 3. API ve Gerçek Zamanlı İletişim

- **Axios**: HTTP istekleri için
- **Socket.io Client**: Gerçek zamanlı iletişim için

#### 4. UI Bileşenleri ve Animasyonlar

- **React Hot Toast**: Bildirimler için
- **Framer Motion**: Animasyonlar için
- **React Icons**: İkonlar için
- **React DnD**: Sürükle-bırak işlemleri için

### Backend Teknolojileri

#### 1. Sunucu ve API

- **Node.js**: Sunucu tarafı JavaScript runtime
- **Express.js**: Web uygulama çatısı
- **TypeScript**: Tip güvenliği için

#### 2. Veritabanı

- **MongoDB**: NoSQL veritabanı
- **Mongoose**: MongoDB ODM
- **Redis**: Önbellek ve oturum yönetimi

#### 3. Gerçek Zamanlı İletişim

- **Socket.io**: WebSocket tabanlı iletişim
- **Socket.io-redis**: Socket.io için Redis adaptörü

#### 4. Güvenlik

- **JWT**: Kimlik doğrulama
- **Bcrypt**: Şifre hashleme
- **Helmet**: Güvenlik başlıkları
- **CORS**: Cross-origin kaynak paylaşımı

#### 5. Geliştirme Araçları

- **Nodemon**: Otomatik sunucu yenileme
- **ESLint**: Kod kalitesi kontrolü
- **Prettier**: Kod formatlama
- **Jest**: Test framework'ü

### DevOps ve Deployment

#### 1. Versiyon Kontrolü

- **Git**: Kod versiyon kontrolü
- **GitHub**: Kod barındırma ve işbirliği

#### 2. Deployment

- **Docker**: Konteynerizasyon
- **Docker Compose**: Çoklu konteyner yönetimi
- **Nginx**: Reverse proxy ve statik dosya sunumu

#### 3. CI/CD

- **GitHub Actions**: Sürekli entegrasyon ve deployment
- **Jest**: Otomatik testler
- **ESLint**: Kod kalite kontrolleri

#### 4. İzleme ve Loglama

- **Winston**: Log yönetimi
- **Morgan**: HTTP request logging
- **PM2**: Process yönetimi ve izleme
