import { useState, useEffect } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import axios from 'axios'
import GameTable from './components/GameTable'
import BetForm from './components/BetForm'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import ScoreBoard from './components/ScoreBoard'
import Rooms from './containers/Rooms'

const API_URL = 'http://localhost:5000/api'

function App() {
  const [game, setGame] = useState(null)
  const [user, setUser] = useState(null)
  const [showRegister, setShowRegister] = useState(false)
  const [showScores, setShowScores] = useState(false)
  const [gameMode, setGameMode] = useState(null) // 'single' veya 'multi'
  const [showModeSelection, setShowModeSelection] = useState(false)
  const [showBetForm, setShowBetForm] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [token, setToken] = useState(null)
  const [currentRoom, setCurrentRoom] = useState(null)

  // Token'ı axios'a ekle
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      // Kullanıcı bilgilerini getir
      fetchUserProfile()
      setToken(token)
    }
  }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/profile`)
      setUser(response.data)
    } catch (error) {
      console.error('Profil bilgileri alınamadı:', error)
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
    }
  }

  const handleLogin = async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials)
      const { token, user } = response.data
      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(user)
      setToken(token)
    } catch (error) {
      alert(error.response?.data?.message || 'Giriş yapılırken bir hata oluştu')
    }
  }

  const handleRegister = async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, credentials)
      const { token, user } = response.data
      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(user)
      setToken(token)
    } catch (error) {
      alert(error.response?.data?.message || 'Kayıt olurken bir hata oluştu')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
    setGame(null)
    setToken(null)
  }

  const startGame = async (bet) => {
    try {
      setLoading(true);
      let response;
      
      if (gameMode === 'single') {
        response = await axios.post(`${API_URL}/game/start`, { bet }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else if (currentRoom) {
        response = await axios.post(`${API_URL}/game/start/${currentRoom}`, { bet }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        throw new Error('Geçersiz oyun modu veya oda');
      }

      const gameData = response.data;
      setGame(gameData);
      setShowBetForm(false);
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Oyun başlatılırken bir hata oluştu');
      setLoading(false);
    }
  };

  const split = async () => {
    try {
      const response = await axios.post(`${API_URL}/game/split/${game._id}`)
      setGame(response.data.game)
      setUser(prev => ({ ...prev, chips: response.data.userChips }))
    } catch (error) {
      console.error('Split yapılamadı:', error)
      alert(error.response?.data?.message || 'Split yapılırken bir hata oluştu')
    }
  }

  const hit = async () => {
    try {
      const endpoint = gameMode === 'single' 
        ? `${API_URL}/game/hit/${game._id}`
        : `${API_URL}/game/hit/${currentRoom}`;

      const response = await axios.post(endpoint);
      setGame(response.data);
    } catch (error) {
      console.error('Kart çekilemedi:', error);
      setError(error.response?.data?.message || 'Kart çekilirken bir hata oluştu');
    }
  };

  const stand = async () => {
    try {
      const endpoint = gameMode === 'single'
        ? `${API_URL}/game/stand/${game._id}`
        : `${API_URL}/game/stand/${currentRoom}`;

      const response = await axios.post(endpoint);
      setGame(response.data);
    } catch (error) {
      console.error('İşlem yapılamadı:', error);
      setError(error.response?.data?.message || 'İşlem yapılırken bir hata oluştu');
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Başlık ve Kullanıcı Bilgisi */}
          <div className="text-center mb-12">
            <div className="grid grid-cols-3 items-center mb-6">
              <div className="justify-self-start">
                {user && (
                  <div className="flex gap-4">
                    <button
                      onClick={() => setShowModeSelection(!showModeSelection)}
                      className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      Oyun Modu
                    </button>
                    <button
                      onClick={() => setShowScores(!showScores)}
                      className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      {showScores ? 'Oyuna Dön' : 'Skor Tablosu'}
                    </button>
                    {showScores && (
                      <button
                        onClick={() => {
                          setShowScores(false);
                          setGame(null);
                        }}
                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                      >
                        Yeni Oyun
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-center">
                <h1 className="text-5xl font-bold text-yellow-500 font-serif tracking-wider">BLACKJACK</h1>
                <div className="w-32 h-1 bg-yellow-500 rounded-full mt-4"></div>
              </div>
              <div className="justify-self-end">
                {user && (
                  <button
                    onClick={handleLogout}
                    className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    Çıkış Yap
                  </button>
                )}
              </div>
            </div>
            {user && !showScores && (
              <div className="flex justify-center items-center gap-6">
                <p className="text-white">
                  <span className="text-yellow-500">Oyuncu:</span> {user.username}
                </p>
                <p className="text-white">
                  <span className="text-yellow-500">Chips:</span> {user.chips}
                </p>
              </div>
            )}
          </div>

          {/* Ana İçerik */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 mb-8">
            {!user ? (
              showRegister ? (
                <RegisterForm
                  onRegister={handleRegister}
                  onSwitchToLogin={() => setShowRegister(false)}
                />
              ) : (
                <LoginForm
                  onLogin={handleLogin}
                  onSwitchToRegister={() => setShowRegister(true)}
                />
              )
            ) : showScores ? (
              <ScoreBoard />
            ) : showModeSelection ? (
              <div className="flex flex-col items-center gap-6">
                <h2 className="text-2xl text-white mb-6">Oyun Modu Seçin</h2>
                <div className="flex gap-6">
                  <button
                    onClick={() => {
                      setGameMode('single')
                      setShowModeSelection(false)
                      setGame(null)
                    }}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    Tek Oyunculu
                  </button>
                  <button
                    onClick={() => {
                      setGameMode('multi')
                      setShowModeSelection(false)
                    }}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    Çok Oyunculu
                  </button>
                </div>
              </div>
            ) : gameMode === 'multi' ? (
              <Rooms user={user} />
            ) : !game ? (
              <BetForm 
                onStartGame={startGame} 
                currentChips={user.chips}
                lastBetAmount={user.lastBetAmount} 
              />
            ) : (
              <GameTable 
                game={game} 
                onHit={hit} 
                onStand={stand}
                onStartGame={startGame}
                onSplit={split}
                chips={user.chips}
                user={user}
              />
            )}
          </div>

          {/* Alt Bilgi */}
          <div className="text-center text-gray-400 text-sm">
            <p>🎮 Bu bir demo projedir</p>
          </div>
        </div>
      </div>
    </Router>
  )
}

export default App
