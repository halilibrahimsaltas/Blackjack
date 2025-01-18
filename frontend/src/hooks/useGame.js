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
            setError(null);
            return response.data;
        } catch (error) {
            console.error('Oyun başlatılamadı:', error);
            setError('Oyun başlatılırken bir hata oluştu');
            throw error;
        }
    };

    const hit = async () => {
        try {
            const token = getToken();
            if (!token) {
                throw new Error('Oturum açmanız gerekiyor');
            }

            if (!game || !game._id) {
                throw new Error('Aktif oyun bulunamadı');
            }

            const response = await axios.post(`${API_URL}/game/hit/${game._id}`,
                {},
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            
            setGame(response.data);
            setError(null);
            return response.data;
        } catch (error) {
            console.error('Kart çekilemedi:', error);
            setError('Kart çekilirken bir hata oluştu');
            throw error;
        }
    };

    const stand = async () => {
        try {
            const token = getToken();
            if (!token) {
                throw new Error('Oturum açmanız gerekiyor');
            }

            if (!game || !game._id) {
                throw new Error('Aktif oyun bulunamadı');
            }

            const response = await axios.post(`${API_URL}/game/stand/${game._id}`,
                {},
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            
            setGame(response.data);
            setError(null);
            return response.data;
        } catch (error) {
            console.error('Stand işlemi başarısız:', error);
            setError('Stand işlemi sırasında bir hata oluştu');
            throw error;
        }
    };

    return {
        game,
        error,
        startGame,
        hit,
        stand
    };
};

export default useGame; 