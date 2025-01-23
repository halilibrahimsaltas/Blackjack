import { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const useGame = () => {
    const [game, setGame] = useState(null);
    const [error, setError] = useState(null);

    const getToken = () => {
        try {
            const auth = localStorage.getItem('blackjack_auth');
            if (auth) {
                const { token } = JSON.parse(auth);
                return token;
            }
            return null;
        } catch (error) {
            console.error('Token alınamadı:', error);
            return null;
        }
    };

    const updateUserChips = (chips) => {
        try {
            const auth = localStorage.getItem('blackjack_auth');
            if (auth) {
                const authData = JSON.parse(auth);
                authData.user.chips = chips;
                localStorage.setItem('blackjack_auth', JSON.stringify(authData));
            }

            const userStr = localStorage.getItem('user');
            if (userStr) {
                const userData = JSON.parse(userStr);
                userData.chips = chips;
                localStorage.setItem('user', JSON.stringify(userData));
            }
        } catch (error) {
            console.error('Chip güncelleme hatası:', error);
        }
    };

    const startGame = async (bet) => {
        try {
            const token = getToken();
            if (!token) {
                throw new Error('Oturum açmanız gerekiyor');
            }

            const response = await axios.post(`${API_URL}/game/start`, 
                { bet },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            
            setGame(response.data.game);
            if (response.data.user && response.data.user.chips !== undefined) {
                updateUserChips(response.data.user.chips);
            }
            setError(null);
            return response.data;
        } catch (error) {
            console.error('Oyun başlatılamadı:', error);
            setError('Oyun başlatılırken bir hata oluştu');
            throw error;
        }
    };

    const hit = async (handIndex = 0) => {
        try {
            const token = getToken();
            if (!token) {
                throw new Error('Oturum açmanız gerekiyor');
            }

            if (!game || !game._id) {
                throw new Error('Aktif oyun bulunamadı');
            }

            const response = await axios.post(`${API_URL}/game/hit/${game._id}`,
                { handIndex },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            
            setGame(response.data.game);
            if (response.data.user && response.data.user.chips !== undefined) {
                updateUserChips(response.data.user.chips);
            }
            setError(null);
            return response.data;
        } catch (error) {
            console.error('Kart çekilemedi:', error);
            setError('Kart çekilirken bir hata oluştu');
            throw error;
        }
    };

    const stand = async (handIndex = 0) => {
        try {
            const token = getToken();
            if (!token) {
                throw new Error('Oturum açmanız gerekiyor');
            }

            if (!game || !game._id) {
                throw new Error('Aktif oyun bulunamadı');
            }

            const response = await axios.post(`${API_URL}/game/stand/${game._id}`,
                { handIndex },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            
            setGame(response.data.game);
            if (response.data.user && response.data.user.chips !== undefined) {
                updateUserChips(response.data.user.chips);
            }
            setError(null);
            return response.data;
        } catch (error) {
            console.error('Stand işlemi başarısız:', error);
            setError('Stand işlemi sırasında bir hata oluştu');
            throw error;
        }
    };

    const split = async () => {
        try {
            const token = getToken();
            if (!token) {
                throw new Error('Oturum açmanız gerekiyor');
            }

            if (!game || !game._id) {
                throw new Error('Aktif oyun bulunamadı');
            }

            const response = await axios.post(`${API_URL}/game/split/${game._id}`,
                {},
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            
            setGame(response.data.game);
            if (response.data.user && response.data.user.chips !== undefined) {
                updateUserChips(response.data.user.chips);
            }
            setError(null);
            return response.data;
        } catch (error) {
            console.error('Split yapılamadı:', error);
            setError('Split işlemi sırasında bir hata oluştu');
            throw error;
        }
    };

    return {
        game,
        error,
        startGame,
        hit,
        stand,
        split
    };
};

export default useGame; 