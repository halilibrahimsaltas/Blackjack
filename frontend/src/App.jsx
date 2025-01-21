import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import axios from 'axios'
import GameTable from './components/GameTable'
import BetForm from './components/BetForm'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import ScoreBoard from './components/ScoreBoard'
import Rooms from './containers/Rooms'
import GameModeSelect from './components/GameModeSelect'
import RoomContainer from './containers/RoomContainer'
import PageTitle from './components/PageTitle'

const API_URL = 'http://localhost:5000/api'

function AppContent() {
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
  const navigate = useNavigate();

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
      setError(null);
      
      const response = await axios.post(`${API_URL}/game/start`, { bet });
      const gameData = response.data;
      
      setGame(gameData);
      setShowBetForm(false);
      setLoading(false);
    } catch (error) {
      console.error('Oyun başlatma hatası:', error);
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
      const response = await axios.post(
        `${API_URL}/game/hit/single/${game._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGame(response.data);
    } catch (error) {
      console.error('Kart çekilemedi:', error);
      setError(error.response?.data?.message || 'Kart çekilirken bir hata oluştu');
    }
  };

  const stand = async () => {
    try {
      if (!game?._id) {
        console.error('Oyun ID bulunamadı');
        setError('Aktif oyun bulunamadı');
        return;
      }

      console.log('Stand isteği gönderiliyor - GameID:', game._id);
      const response = await axios.post(
        `${API_URL}/game/stand/single/${game._id}`,
        {},
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      console.log('Stand yanıtı:', response.data);
      setGame(response.data);
    } catch (error) {
      console.error('Stand hatası:', error);
      setError(error.response?.data?.message || 'İşlem yapılırken bir hata oluştu');
    }
  };

  return (
    <div className="min-h-screen bg-[#111827]">
      <div className="w-full bg-gradient-to-b from-black/40 to-transparent pt-6 pb-4 mb-4">
        <PageTitle />
      </div>
      
      <div className="pt-8">
        <Routes>
          <Route path="/login" element={!user ? (
            <>
              <div className="container mx-auto px-4 py-8">
                <LoginForm onLogin={handleLogin} />
              </div>
            </>
          ) : <Navigate to="/select-mode" />} />
          
          <Route path="/register" element={!user ? (
            <>
              <div className="container mx-auto px-4 py-8">
                <RegisterForm onRegister={handleRegister} />
              </div>
            </>
          ) : <Navigate to="/select-mode" />} />
          
          <Route 
            path="/select-mode" 
            element={user ? (
              <>
                <div className="container mx-auto px-4 py-8">
                  <GameModeSelect />
                </div>
              </>
            ) : <Navigate to="/login" />} 
          />
          
          <Route 
            path="/game" 
            element={user ? (
              <>
                <div className="mb-2">
                  <nav className="bg-gradient-to-b from-black/60 to-transparent">
                    <div className="container mx-auto px-6">
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-4 w-1/3">
                          <button
                            onClick={() => navigate('/select-mode')}
                            className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 transition-all"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500 group-hover:text-yellow-400 transition-colors" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm text-yellow-500 group-hover:text-yellow-400 font-medium transition-colors">Oyun Modu</span>
                          </button>
                          <button
                            onClick={() => setShowScores(true)}
                            className="px-3 py-1.5 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-sm text-yellow-500 hover:text-yellow-400 font-medium transition-all"
                          >
                            Skor Tablosu
                          </button>
                        </div>

                        <div className="flex items-center justify-center w-1/3">
                          <div className="flex items-center gap-4 bg-yellow-500/5 px-4 py-1.5 rounded-xl border border-yellow-500/10">
                            <div className="text-sm text-yellow-500 font-medium">
                              {user.username}
                            </div>
                            <div className="w-[1px] h-4 bg-yellow-500/20"></div>
                            <div className="flex items-center gap-1">
                              <span className="text-sm text-yellow-500 font-bold">{user.chips}</span>
                              <span className="text-xs text-yellow-500/70">chip</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end w-1/3">
                          <button
                            onClick={handleLogout}
                            className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-all"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 group-hover:text-red-400 transition-colors" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm text-red-500 group-hover:text-red-400 font-medium transition-colors">Çıkış Yap</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </nav>
                </div>

                <div className="container mx-auto px-4">
                  {loading ? (
                    <div className="flex justify-center items-center h-[600px]">
                      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400"></div>
                    </div>
                  ) : game ? (
                    <GameTable
                      game={game}
                      onHit={hit}
                      onStand={stand}
                      onStartGame={startGame}
                      onSplit={split}
                      chips={user.chips}
                      user={user}
                    />
                  ) : (
                    <BetForm onStartGame={startGame} currentChips={user.chips} lastBetAmount={user.lastBetAmount} />
                  )}
                  {error && (
                    <div className="fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg">
                      {error}
                    </div>
                  )}
                </div>

                {showScores && (
                  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-[#111827] p-8 rounded-xl shadow-2xl border border-yellow-500/30 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-yellow-500">Skor Tablosu</h2>
                        <button
                          onClick={() => setShowScores(false)}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                      <ScoreBoard />
                    </div>
                  </div>
                )}
              </>
            ) : <Navigate to="/login" />}
          />

          <Route 
            path="/rooms" 
            element={user ? (
              <>
                <div className="container mx-auto px-4 py-8">
                  <Rooms user={user} />
                </div>
              </>
            ) : <Navigate to="/login" />} 
          />
          
          <Route 
            path="/room/:roomId" 
            element={user ? (
              <>
                <div className="container mx-auto px-4 py-8">
                  <RoomContainer user={user} />
                </div>
              </>
            ) : <Navigate to="/login" />} 
          />

          <Route 
            path="/" 
            element={user ? <Navigate to="/select-mode" /> : <Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
