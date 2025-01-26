# Blackjack Oyunu 🎮

Modern web teknolojileri ile geliştirilmiş, tek ve çok oyunculu modları destekleyen bir Blackjack oyunu.

## Özellikler ✨

- Tek oyunculu ve çok oyunculu modlar
- Gerçek zamanlı oyun deneyimi
- Oda sistemi (maksimum 10 oda, her odada 1-4 oyuncu)
- JWT tabanlı kimlik doğrulama
- Skor tablosu ve istatistikler
- Modern ve responsive tasarım
- Görsel chip seçici ve bahis sistemi
- El bölme özelliği
- Gerçek zamanlı oyuncu etkileşimleri
- Otomatik bahis hatırlama

## Teknolojiler 🛠

### Backend

- Node.js
- Express.js
- MongoDB (Mongoose)
- Socket.io
- JWT Authentication
- Cors
- Oyun mantığı modülleri

### Frontend

- React (Vite)
- React Router DOM
- Axios
- Socket.io Client
- Tailwind CSS
- React Hot Toast
- Animasyon kütüphaneleri

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
- Otomatik bahis hatırlama
- El bölme özelliği

### Çok Oyunculu

- Oda tabanlı sistem
- Gerçek zamanlı etkileşim
- Sıralı oyun sistemi
- Oda sahibi kontrolü
- Minimum bahis limitleri
- Görsel chip seçici

## Özellik Detayları

Detaylı özellik listesi ve API dokümantasyonu için [MULTIPLAYER.md](./MULTIPLAYER.md) dosyasına bakın.

## Oyun Görselleri
![Image](https://github.com/user-attachments/assets/ba21a9e4-08fb-46cf-912a-1496de172a6a)
![Image](https://github.com/user-attachments/assets/2d1e5a1a-285c-4308-8611-ceb44edb7d06)
![Image](https://github.com/user-attachments/assets/451e715c-d897-4e2a-b7ef-6446e8fe58aa)
![Image](https://github.com/user-attachments/assets/e772cb9c-8b26-46d2-9343-52859b752555)
![Image](https://github.com/user-attachments/assets/a944163c-25f5-4a35-8dae-76a02b1dab6e)
![Image](https://github.com/user-attachments/assets/64ec6796-0493-4cc9-9f00-2d286f57b9b2)
![Image](https://github.com/user-attachments/assets/397cc641-bbb1-4540-8807-1f3ca7829f96)
![Image](https://github.com/user-attachments/assets/f1a008f1-0c0b-4305-bd86-bed2a9bb3e84)
![Image](https://github.com/user-attachments/assets/df69c6ad-117a-4f5d-8028-7fc1d4989507)
![Image](https://github.com/user-attachments/assets/43946260-1cb6-4ec9-9b76-5b0a604e6aca)
![Image](https://github.com/user-attachments/assets/65b332cb-e65c-4dc8-831a-b157ccbe0477)


## Katkıda Bulunma 🤝

1. Bu depoyu fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/amazing`)
3. Değişikliklerinizi commit edin (`git commit -m 'Harika özellik eklendi'`)
4. Branch'inizi push edin (`git push origin feature/amazing`)
5. Pull Request oluşturun
