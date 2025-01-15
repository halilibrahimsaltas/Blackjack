import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const ScoreBoard = () => {
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchScores();
    }, []);

    const fetchScores = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/game/scores`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setScores(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Skorlar alınamadı:', error);
            setError('Skorlar yüklenirken bir hata oluştu');
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center p-4">
                <p className="text-white">Yükleniyor...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-4">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">Skor Tablosu</h2>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-700">
                            <th className="px-4 py-2 text-left text-gray-400">Sıra</th>
                            <th className="px-4 py-2 text-left text-gray-400">Oyuncu</th>
                            <th className="px-4 py-2 text-right text-gray-400">Chips</th>
                            <th className="px-4 py-2 text-right text-gray-400">Kazanılan</th>
                            <th className="px-4 py-2 text-right text-gray-400">Toplam Oyun</th>
                        </tr>
                    </thead>
                    <tbody>
                        {scores.map((score, index) => (
                            <tr 
                                key={score._id} 
                                className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors"
                            >
                                <td className="px-4 py-2 text-gray-300">{index + 1}</td>
                                <td className="px-4 py-2 text-yellow-500 font-medium">{score.username}</td>
                                <td className="px-4 py-2 text-right text-green-400">{score.chips}</td>
                                <td className="px-4 py-2 text-right text-blue-400">{score.gamesWon}</td>
                                <td className="px-4 py-2 text-right text-gray-300">{score.totalGames}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ScoreBoard; 