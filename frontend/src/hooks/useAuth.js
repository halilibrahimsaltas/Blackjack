import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
const STORAGE_KEY = 'blackjack_auth';
const USER_KEY = 'user';

const useAuth = () => {
    const getStoredAuth = () => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            const storedUser = localStorage.getItem(USER_KEY);

            if (stored && storedUser) {
                const data = JSON.parse(stored);
                const userData = JSON.parse(storedUser);

                if (Date.now() - data.timestamp > 24 * 60 * 60 * 1000) {
                    clearStorage();
                    return { token: null, user: null };
                }

                // User verilerini doğrula
                if (data.token && userData && userData.username && typeof userData.chips === 'number') {
                    return {
                        token: data.token,
                        user: {
                            id: userData._id,
                            username: userData.username,
                            chips: userData.chips,
                            gamesWon: userData.gamesWon || 0,
                            totalGames: userData.totalGames || 0,
                            createdAt: userData.createdAt
                        }
                    };
                }
            }
            clearStorage();
            return { token: null, user: null };
        } catch (error) {
            console.error('Storage okuma hatası:', error);
            clearStorage();
            return { token: null, user: null };
        }
    };

    const clearStorage = () => {
        try {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(USER_KEY);
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
        } catch (error) {
            console.error('Storage temizleme hatası:', error);
        }
    };

    const { token: initialToken, user: initialUser } = getStoredAuth();
    const [token, setToken] = useState(initialToken);
    const [user, setUser] = useState(initialUser);

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            if (!user || !user.username) {
                fetchUserProfile();
            }
        } else {
            clearStorage();
            setUser(null);
        }
    }, [token, user]);

    const fetchUserProfile = async () => {
        try {
            const response = await axios.get(`${API_URL}/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const userData = response.data;
            if (!userData || !userData.username) {
                throw new Error('Geçersiz kullanıcı verisi');
            }
            const formattedUser = {
                id: userData._id,
                username: userData.username,
                chips: userData.chips || 1000,
                gamesWon: userData.gamesWon || 0,
                totalGames: userData.totalGames || 0,
                createdAt: userData.createdAt
            };
            setUser(formattedUser);
            storeAuth(token, userData);
        } catch (error) {
            console.error('Profil bilgileri alınamadı:', error);
            clearStorage();
            setToken(null);
            setUser(null);
        }
    };

    const storeAuth = (newToken, userData) => {
        try {
            if (!userData || !userData.username) {
                throw new Error('Geçersiz kullanıcı verisi');
            }

            // Auth verilerini sakla
            const authData = {
                token: newToken,
                timestamp: Date.now()
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));

            // User verisini ayrı sakla
            localStorage.setItem(USER_KEY, JSON.stringify(userData));

            setToken(newToken);
            setUser({
                id: userData._id,
                username: userData.username,
                chips: userData.chips,
                gamesWon: userData.gamesWon || 0,
                totalGames: userData.totalGames || 0,
                createdAt: userData.createdAt
            });
        } catch (error) {
            console.error('Storage kayıt hatası:', error);
            clearStorage();
        }
    };

    const login = async (credentials) => {
        try {
            clearStorage();
            const response = await axios.post(`${API_URL}/auth/login`, credentials);
            const { token: newToken, user: userData } = response.data;
            
            if (!userData || !userData.username) {
                throw new Error('Geçersiz kullanıcı verisi');
            }
            
            storeAuth(newToken, userData);
            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            
            return userData;
        } catch (error) {
            clearStorage();
            throw error;
        }
    };

    const register = async (credentials) => {
        try {
            clearStorage();
            const response = await axios.post(`${API_URL}/auth/register`, credentials);
            const { token: newToken, user: userData } = response.data;
            
            if (!userData || !userData.username) {
                throw new Error('Geçersiz kullanıcı verisi');
            }
            
            storeAuth(newToken, userData);
            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            
            return userData;
        } catch (error) {
            clearStorage();
            throw error;
        }
    };

    const logout = () => {
        clearStorage();
        setToken(null);
        setUser(null);
    };

    const updateUserChips = (newChips) => {
        if (user && token && typeof newChips === 'number') {
            const updatedUser = {
                ...user,
                chips: newChips
            };
            const storedUser = JSON.parse(localStorage.getItem(USER_KEY));
            const updatedStoredUser = {
                ...storedUser,
                chips: newChips
            };
            localStorage.setItem(USER_KEY, JSON.stringify(updatedStoredUser));
            storeAuth(token, updatedStoredUser);
        }
    };

    return {
        token,
        user,
        login,
        register,
        logout,
        updateUserChips
    };
};

export default useAuth; 