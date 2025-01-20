# Blackjack Oyunu 🎮

Modern web teknolojileri ile geliştirilmiş, tek ve çok oyunculu modları destekleyen bir Blackjack oyunu.

## Özellikler ✨

- Tek oyunculu ve çok oyunculu modlar
- Gerçek zamanlı oyun deneyimi
- Oda sistemi (maksimum 10 oda, her odada 1-4 oyuncu)
- JWT tabanlı kimlik doğrulama
- Skor tablosu ve istatistikler
- Modern ve responsive tasarım

## Teknolojiler 🛠

### Backend

- Node.js
- Express.js
- MongoDB (Mongoose)
- Socket.io
- JWT Authentication
- Cors

### Frontend

- React (Vite)
- React Router DOM
- Axios
- Socket.io Client
- Tailwind CSS
- React Hot Toast

## Kurulum 🚀

1. Depoyu klonlayın:

```bash
git clone https://github.com/kullaniciadi/blackjack.git
cd blackjack
```

2. Backend kurulumu:

```bash
cd backend
npm install
```

3. Frontend kurulumu:

```bash
cd frontend
npm install
```

4. `.env` dosyasını oluşturun:

```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5000
```

5. Uygulamayı başlatın:

Backend:

```bash
cd backend
npm start
```

Frontend:

```bash
cd frontend
npm run dev
```

## Oyun Modları 🎲

### Tek Oyunculu

- Hızlı oyun deneyimi
- Direkt oyun başlatma
- Basitleştirilmiş arayüz

### Çok Oyunculu

- Oda tabanlı sistem
- Gerçek zamanlı etkileşim
- Sıralı oyun sistemi
- Oda sahibi kontrolü

## API Endpoints 🌐

Detaylı API dokümantasyonu için [MULTIPLAYER.md](./MULTIPLAYER.md) dosyasına bakın.

## Katkıda Bulunma 🤝

1. Bu depoyu fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/amazing`)
3. Değişikliklerinizi commit edin (`git commit -m 'Harika özellik eklendi'`)
4. Branch'inizi push edin (`git push origin feature/amazing`)
5. Pull Request oluşturun

## Lisans 📝

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](./LICENSE) dosyasına bakın.

## İletişim 📧

- GitHub: [@kullaniciadi](https://github.com/kullaniciadi)
- Email: ornek@email.com
