import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const ScoreBoard = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/game/scores`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setScores(response.data);
        setError(null);
      } catch (error) {
        console.error("Skor tablosu yüklenirken hata:", error);
        setError("Skor tablosu yüklenemedi");
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-yellow-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-yellow-500 mb-2">
          SKOR TABLOSU
        </h2>
        <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
      </div>

      <div className="bg-gray-800/50 rounded-xl shadow-xl border border-yellow-500/20">
        <table className="w-full">
          <thead>
            <tr className="border-b border-yellow-500/20">
              <th className="px-6 py-4 text-center text-sm font-semibold text-yellow-500">
                #
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-yellow-500">
                Kullanıcı
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-yellow-500">
                Chips
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-yellow-500">
                Kazanılan
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-yellow-500">
                Toplam
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-yellow-500">
                Kazanma %
              </th>
            </tr>
          </thead>
          <tbody className="text-white">
            {scores.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                  Henüz hiç oyun oynanmamış
                </td>
              </tr>
            ) : (
              scores.map((score, index) => {
                const winRate =
                  score.totalGames > 0
                    ? ((score.gamesWon / score.totalGames) * 100).toFixed(1)
                    : "0.0";

                return (
                  <tr
                    key={score._id}
                    className="border-b border-gray-700/50 hover:bg-yellow-500/5"
                  >
                    <td className="px-6 py-4 text-center">
                      {index === 0 ? "👑 " : ""}
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-yellow-500">
                      {score.username}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {score.chips.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {score.gamesWon}
                    </td>
                    <td className="px-6 py-4 text-center text-green-500">
                      {score.totalGames}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          parseFloat(winRate) >= 50
                            ? "bg-green-500/20 text-green-500"
                            : "bg-red-500/20 text-red-500"
                        }`}
                      >
                        {winRate}%
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScoreBoard;
