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
            const response = await axios.get(`${API_URL}/game/scores`);
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
            <div className="flex justify-center items-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-8">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <p className="text-red-500">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-yellow-500 font-serif tracking-wider mb-8 text-center">
                En İyi Oyuncular
            </h2>
            <div className="bg-gray-800/50 rounded-xl p-6 shadow-lg border border-yellow-500/20">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b-2 border-yellow-500/20">
                                <th className="px-6 py-4 text-left text-yellow-500 font-serif tracking-wider">#</th>
                                <th className="px-6 py-4 text-left text-yellow-500 font-serif tracking-wider">Oyuncu</th>
                                <th className="px-6 py-4 text-right text-yellow-500 font-serif tracking-wider">Chips</th>
                                <th className="px-6 py-4 text-right text-yellow-500 font-serif tracking-wider">Kazanılan</th>
                                <th className="px-6 py-4 text-right text-yellow-500 font-serif tracking-wider">Toplam Oyun</th>
                                <th className="px-6 py-4 text-right text-yellow-500 font-serif tracking-wider">Kazanma %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scores.map((score, index) => {
                                const winRate = score.totalGames > 0 
                                    ? ((score.gamesWon / score.totalGames) * 100).toFixed(1)
                                    : '0.0';
                                    
                                return (
                                    <tr 
                                        key={score._id} 
                                        className={`
                                            border-b border-gray-700/50 
                                            ${index === 0 ? 'bg-yellow-500/10' : 'hover:bg-gray-700/30'} 
                                            transition-colors
                                        `}
                                    >
                                        <td className="px-6 py-4">
                                            <span className={`
                                                inline-flex items-center justify-center w-8 h-8 rounded-full 
                                                ${index === 0 ? 'bg-yellow-500 text-black' : 
                                                  index === 1 ? 'bg-gray-400 text-black' : 
                                                  index === 2 ? 'bg-yellow-700 text-white' : 
                                                  'bg-gray-700 text-gray-300'}
                                                font-bold
                                            `}>
                                                {index + 1}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-white">
                                                {score.username}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-green-400 font-mono">
                                                {score.chips.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-blue-400 font-mono">
                                                {score.gamesWon}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-gray-300 font-mono">
                                                {score.totalGames}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`
                                                font-mono
                                                ${parseFloat(winRate) >= 50 ? 'text-green-400' : 'text-red-400'}
                                            `}>
                                                {winRate}%
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ScoreBoard; 