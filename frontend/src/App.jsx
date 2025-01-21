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
import Navbar from './components/Navbar'

const API_URL = 'http://localhost:5000/api'

// El değerini hesaplama fonksiyonu
const calculateHandValue = (cards) => {
  if (!Array.isArray(cards)) return 0;
  
  let value = 0;
  let aces = 0;

  for (let card of cards) {
    const cardValue = card.split('_')[0];
    if (cardValue === 'ace') {
      aces += 1;
    } else if (['king', 'queen', 'jack'].includes(cardValue)) {
      value += 10;
    } else {
      value += parseInt(cardValue);
    }
  }

  for (let i = 0; i < aces; i++) {
    if (value + 11 <= 21) {
      value += 11;
    } else {
      value += 1;
    }
  }

  return value;
};

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
      
      if (!token) {
        setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        handleLogout();
        return;
      }

      console.log('Oyun başlatma isteği gönderiliyor:', {
        bet,
        token: token ? 'Mevcut' : 'Yok',
        userChips: user.chips
      });
      
      const response = await axios.post(
        `${API_URL}/game/start`, 
        { 
          bet: Number(bet),
          gameType: 'single'
        },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      console.log('Backend yanıtı:', response.data);
      
      if (!response.data) {
        throw new Error('Sunucudan yanıt alınamadı');
      }

      const gameData = response.data;
      
      if (!gameData || !gameData._id) {
        throw new Error('Geçersiz oyun verisi');
      }

      console.log('Oyun başarıyla başlatıldı:', gameData);
      
      setGame(gameData);
      setUser(prev => ({ 
        ...prev, 
        chips: prev.chips - bet,
        lastBetAmount: bet 
      }));
      
      setLoading(false);
      
    } catch (error) {
      console.error('Oyun başlatma hatası:', {
        error,
        response: error.response?.data,
        status: error.response?.status
      });
      
      setError(
        error.response?.data?.message || 
        error.message || 
        'Oyun başlatılırken bir hata oluştu'
      );
      setLoading(false);
    }
  };

  const handleBetConfirm = (bet) => {
    if (!token) {
      setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
      handleLogout();
      return;
    }
    
    if (bet <= 0 || bet > user.chips) {
      setError('Geçersiz bahis miktarı');
      return;
    }
    
    console.log('Bahis onaylandı:', bet);
    startGame(bet);
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
      if (!game?._id) {
        console.error('Oyun ID bulunamadı');
        setError('Aktif oyun bulunamadı');
        return;
      }

      console.log('Kart çekme isteği gönderiliyor:', {
        gameId: game._id,
        gameStatus: game.status,
        playerStatus: game.players[0]?.status
      });

      const response = await axios.post(
        `${API_URL}/game/hit/single/${game._id}`,
        {},
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      console.log('Kart çekme yanıtı:', response.data);
      
      if (response.data) {
        setGame(response.data);
        if (response.data.userChips !== undefined) {
          setUser(prev => ({ ...prev, chips: response.data.userChips }));
        }
      } else {
        throw new Error('Geçersiz sunucu yanıtı');
      }
    } catch (error) {
      console.error('Kart çekme hatası:', {
        error,
        response: error.response?.data,
        status: error.response?.status,
        message: error.message
      });
      
      let errorMessage = 'Kart çekilirken bir hata oluştu';
      if (error.response?.status === 404) {
        errorMessage = 'Oyun bulunamadı veya sıra sizde değil';
      }
      
      setError(
        error.response?.data?.message || 
        errorMessage
      );
    }
  };

  const stand = async () => {
    try {
      if (!game?._id) {
        console.error('Oyun ID bulunamadı');
        setError('Aktif oyun bulunamadı');
        return;
      }

      if (game.status !== 'playing' || game.players[0]?.status !== 'playing') {
        setError('Şu anda stand yapamazsınız');
        return;
      }

      console.log('Stand isteği gönderiliyor:', {
        gameId: game._id,
        gameStatus: game.status,
        playerStatus: game.players[0]?.status
      });

      const response = await axios.post(
        `${API_URL}/game/stand/single/${game._id}`,
        {},
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      console.log('Stand yanıtı:', response.data);
      
      if (!response.data) {
        throw new Error('Sunucudan yanıt alınamadı');
      }

      // Backend yanıtını kontrol et
      const gameData = response.data;
      
      if (!gameData || !gameData._id) {
        throw new Error('Geçersiz oyun verisi');
      }

      console.log('Stand işlemi başarılı:', gameData);
      
      setGame(gameData);
      if (gameData.userChips !== undefined) {
        setUser(prev => ({ ...prev, chips: gameData.userChips }));
      }
      
    } catch (error) {
      console.error('Stand hatası:', {
        error,
        response: error.response?.data,
        status: error.response?.status,
        message: error.message
      });
      
      let errorMessage = 'Stand işlemi yapılırken bir hata oluştu';
      if (error.response?.status === 400) {
        errorMessage = 'Geçersiz hamle: Stand yapılamıyor';
      } else if (error.response?.status === 404) {
        errorMessage = 'Oyun bulunamadı';
      }
      
      setError(
        error.response?.data?.message || 
        errorMessage
      );
    }
  };

  // Otomatik blackjack kontrolü
  useEffect(() => {
    const checkBlackjack = async () => {
      if (game && game.status === 'playing') {
        const player = game.players[0];
        if (player && player.status === 'playing') {
          const playerHand = player.hand || [];
          if (playerHand.length === 2) {
            const value = calculateHandValue(playerHand);
            if (value === 21) {
              console.log('Blackjack tespit edildi, otomatik stand yapılıyor');
              await stand();
            }
          }
        }
      }
    };

    checkBlackjack();
  }, [game?.players[0]?.hand]);

  // Login ve Register arasında geçiş fonksiyonları
  const handleSwitchToRegister = () => {
    navigate('/register');
  };

  const handleSwitchToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#111827]">
      <div className="w-full h-24 bg-gradient-to-b from-black/40 to-transparent pt-8 pb-4 flex items-center justify-center">
        <PageTitle />
      </div>
      
      {user && (
        <div>
          <Navbar 
            user={user} 
            onLogout={handleLogout}
            showGameModeButton={window.location.pathname !== '/select-mode'}
          />
        </div>
      )}
      
      <div className="pt-4">
        <Routes>
          <Route path="/login" element={!user ? (
            <>
              <div className="container mx-auto px-4 py-8">
                <LoginForm 
                  onLogin={handleLogin} 
                  onSwitchToRegister={handleSwitchToRegister}
                />
              </div>
            </>
          ) : <Navigate to="/select-mode" />} />
          
          <Route path="/register" element={!user ? (
            <>
              <div className="container mx-auto px-4 py-8">
                <RegisterForm 
                  onRegister={handleRegister}
                  onSwitchToLogin={handleSwitchToLogin}
                />
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
                      onStartGame={handleBetConfirm}
                      onSplit={split}
                      chips={user.chips}
                      user={user}
                    />
                  ) : (
                    <BetForm 
                      onStartGame={handleBetConfirm} 
                      currentChips={user.chips} 
                      lastBetAmount={user.lastBetAmount || 10}
                    />
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
