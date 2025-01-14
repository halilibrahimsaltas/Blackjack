const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const gameRoutes = require('./routes/gameRoutes');
const authRoutes = require('./routes/authRoutes');
const auth = require('./middleware/auth');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB bağlantısı
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/game', auth, gameRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor`);
}); 