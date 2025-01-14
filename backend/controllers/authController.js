const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Kayıt ol
const register = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Kullanıcı adı kontrolü
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Bu kullanıcı adı zaten kullanılıyor' });
        }

        // Şifreyi hashleme
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Yeni kullanıcı oluşturma
        const user = await User.create({
            username,
            password: hashedPassword
        });

        // Token oluşturma
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                chips: user.chips
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Giriş yap
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Kullanıcıyı bul
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Kullanıcı adı veya şifre hatalı' });
        }

        // Şifreyi kontrol et
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Kullanıcı adı veya şifre hatalı' });
        }

        // Token oluştur
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                chips: user.chips
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Profil bilgilerini getir
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    register,
    login,
    getProfile
}; 