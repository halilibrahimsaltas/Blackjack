# Blackjack Oyunu 🎮

## Proje Hakkında

Bu proje, MERN stack (MongoDB, Express.js, React, Node.js) kullanılarak geliştirilmiş tek oyunculu bir Blackjack oyunudur. Oyuncular, bilgisayara karşı klasik Blackjack kurallarıyla oynayabilir ve oyun istatistiklerini görebilirler.

## Özellikler 🌟

- Kullanıcı kaydı ve girişi
- JWT tabanlı kimlik doğrulama
- Otomatik 21 kazanma sistemi
- Gerçek zamanlı oyun mantığı
- Kişisel oyun istatistikleri
- Responsive tasarım
- Gelişmiş bahis sistemi
- Animasyonlu bildirimler

## Teknoloji Stack'i 🛠

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (JSON Web Tokens)
- Bcrypt.js

### Frontend

- React (Vite)
- Axios
- Tailwind CSS
- React Icons

### Development Tools

- ESLint
- Prettier
- Nodemon
- Concurrently

## Kurulum 📦

### Gereksinimler

- Node.js (v14 veya üzeri)
- MongoDB
- npm veya yarn

### Kurulum Adımları

1. Projeyi klonlayın

```bash
git clone https://github.com/halilibrahimsaltas/blackjack.git
cd blackjack
```

2. Backend bağımlılıklarını yükleyin

```bash
cd backend
npm install
```

3. Frontend bağımlılıklarını yükleyin

```bash
cd frontend
npm install
```

4. `.env` dosyasını oluşturun

```env
MONGODB_URI=your_mongodb_uri
PORT=5000
JWT_SECRET=your_jwt_secret_key
```

5. Uygulamayı başlatın

```bash
# Backend için
cd backend
npm run dev

# Frontend için (yeni terminal)
cd frontend
npm run dev
```

## Proje Yapısı 📁

```
blackjack/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
├── frontend/
│   ├── public/
│   │   └── img/
│   │       └── cards/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   └── App.jsx
│   └── index.html
└── README.md
```

## API Endpoints 🔌

### Kullanıcı İşlemleri

- POST /api/auth/register - Yeni kullanıcı kaydı
- POST /api/auth/login - Kullanıcı girişi
- GET /api/auth/profile - Kullanıcı profili

### Oyun İşlemleri

- POST /api/game/start - Yeni oyun başlatma
- POST /api/game/hit - Kart çekme
- POST /api/game/stand - Durma
- GET /api/game/scores - En yüksek skorlar

## Oyun Kuralları 📋

1. Oyun 21'e en yakın olmaya çalışmak üzerine kuruludur
2. As kartı 1 veya 11 olarak sayılabilir
3. J, Q, K kartları 10 değerindedir
4. Oyuncu 21'i geçerse kaybeder
5. Krupiye 17 veya üzerinde durmak zorundadır
6. Oyuna 1000 chip ile başlanır
7. Minimum bahis 10 chip'tir
8. 21'e ulaşıldığında otomatik kazanma
9. Her el sonunda yeni bahis imkanı

## Katkıda Bulunma 🤝

1. Bu repository'yi fork edin
2. Feature branch'i oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## Lisans 📝

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakınız.
