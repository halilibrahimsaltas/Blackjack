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
import MultiplayerGameTable from './components/MultiplayerGameTable'
import io from 'socket.io-client'
import MultiplayerBetForm from './components/MultiplayerBetForm'

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
  const [gameMode, setGameMode] = useState(null)
  const [showModeSelection, setShowModeSelection] = useState(false)
  const [showBetForm, setShowBetForm] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [token, setToken] = useState(null)
  const [currentRoom, setCurrentRoom] = useState(null)
  const [timeLeft, setTimeLeft] = useState(30)
  const navigate = useNavigate();

  // Token'ı axios'a ekle
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUserProfile()
      setToken(token)
    }
  }, [])

  // Çok oyunculu oyun için socket bağlantısı
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    let socket;
    try {
      socket = io('http://localhost:5000', {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000
      });

      socket.on('connect', () => {
        console.log('Socket.io bağlantısı kuruldu');
        setError(null);
      });

      socket.on('gameStarted', async ({ roomId, message }) => {
        console.log('Oyun başladı:', { roomId, message });
        try {
          const [gameResponse, roomResponse] = await Promise.all([
            axios.get(`${API_URL}/game/${roomId}`),
            axios.get(`${API_URL}/room/${roomId}`)
          ]);

          if (gameResponse.data && roomResponse.data) {
            console.log('Oyun ve oda verileri güncellendi:', {
              game: gameResponse.data,
              room: roomResponse.data
            });
            
            setGame(gameResponse.data);
            setCurrentRoom(roomResponse.data);
            setLoading(false);
          }
        } catch (error) {
          console.error('Oyun verileri alınırken hata:', error);
          setError('Oyun verileri alınamadı. Lütfen sayfayı yenileyin.');
          setLoading(false);
        }
      });

      socket.on('gameUpdate', (updatedGame) => {
        console.log('Oyun güncellendi:', updatedGame);
        setGame(updatedGame);
      });

      socket.on('roomUpdate', (updatedRoom) => {
        console.log('Oda güncellendi:', updatedRoom);
        setCurrentRoom(updatedRoom);
      });

      socket.on('turnChange', (newTurn, remainingTime) => {
        console.log('Sıra değişti:', { newTurn, remainingTime });
        setTimeLeft(remainingTime);
      });

      socket.on('gameEnd', (winners) => {
        console.log('Oyun bitti, kazananlar:', winners);
      });

      socket.on('error', (error) => {
        console.error('Socket.io hatası:', error);
        setError('Bir bağlantı hatası oluştu. Lütfen sayfayı yenileyin.');
      });

    } catch (error) {
      console.error('Socket.io başlatma hatası:', error);
      setError('Sunucu bağlantısı kurulamadı. Lütfen daha sonra tekrar deneyin.');
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  // Geri sayım sayacı
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

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
        if (!game?._id) {
            console.error('Oyun ID bulunamadı');
            setError('Aktif oyun bulunamadı');
            return;
        }

        console.log('Split isteği gönderiliyor:', {
            gameId: game._id,
            currentChips: user.chips
        });

        const response = await axios.post(
            `${API_URL}/game/split/${game._id}`,
            {},
            { 
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                } 
            }
        );

        console.log('Split yanıtı:', response.data);

        if (!response.data || !response.data.game) {
            throw new Error('Sunucudan geçersiz yanıt alındı');
        }

        const { game: gameData, user: userData } = response.data;
        
        if (!gameData._id) {
            throw new Error('Geçersiz oyun verisi');
        }

        console.log('Split işlemi başarılı:', {
            game: gameData,
            userChips: userData?.chips
        });
        
        setGame(gameData);
        if (userData?.chips !== undefined) {
            setUser(prev => ({ ...prev, chips: userData.chips }));
        }
    } catch (error) {
        console.error('Split hatası:', {
            error,
            response: error.response?.data,
            status: error.response?.status,
            message: error.message
        });
        
        let errorMessage = 'Split yapılırken bir hata oluştu';
        if (error.response?.status === 400) {
            errorMessage = error.response?.data?.message || 'Split yapılamıyor';
        } else if (error.response?.status === 404) {
            errorMessage = 'Oyun bulunamadı';
        }
        
        setError(errorMessage);
    }
};

  const hit = async (handIndex = 0) => {
    try {
        if (!game?._id) {
            console.error('Oyun ID bulunamadı');
            setError('Aktif oyun bulunamadı');
            return;
        }

        console.log('Kart çekme isteği gönderiliyor:', {
            gameId: game._id,
            gameStatus: game.status,
            playerStatus: game.players?.[handIndex]?.status,
            handIndex
        });

        const response = await axios.post(
            `${API_URL}/game/hit/single/${game._id}`,
            { handIndex },
            { 
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                } 
            }
        );
        
        console.log('Kart çekme yanıtı:', response.data);
        
        if (!response.data || !response.data.game) {
            throw new Error('Sunucudan geçersiz yanıt alındı');
        }

        const { game: gameData, user: userData } = response.data;
        
        if (!gameData._id) {
            throw new Error('Geçersiz oyun verisi');
        }

        console.log('Kart çekme işlemi başarılı:', gameData);
        
        setGame(gameData);
        if (userData?.chips !== undefined) {
            setUser(prev => ({ ...prev, chips: userData.chips }));
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

  const stand = async (handIndex = 0) => {
    try {
        if (!game?._id) {
            console.error('Oyun ID bulunamadı');
            setError('Aktif oyun bulunamadı');
            return;
        }

        const currentPlayer = game?.players?.[handIndex];
        if (!currentPlayer || game?.status !== 'playing' || currentPlayer?.status !== 'playing') {
            setError('Şu anda stand yapamazsınız');
            return;
        }

        console.log('Stand isteği gönderiliyor:', {
            gameId: game._id,
            gameStatus: game.status,
            playerStatus: currentPlayer.status,
            handIndex
        });

        const response = await axios.post(
            `${API_URL}/game/stand/single/${game._id}`,
            { handIndex },
            { 
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                } 
            }
        );
        
        console.log('Stand yanıtı:', response.data);
        
        if (!response.data || !response.data.game) {
            throw new Error('Sunucudan geçersiz yanıt alındı');
        }

        const { game: gameData, user: userData } = response.data;
        
        if (!gameData._id) {
            throw new Error('Geçersiz oyun verisi');
        }

        console.log('Stand işlemi başarılı:', gameData);
        
        setGame(gameData);
        if (userData?.chips !== undefined) {
            setUser(prev => ({ ...prev, chips: userData.chips }));
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
      if (game?.status === 'playing' && game?.players?.length > 0) {
        const player = game.players[0];
        if (player?.status === 'playing' && player?.hand?.length === 2) {
          const value = calculateHandValue(player.hand);
          if (value === 21) {
            console.log('Blackjack tespit edildi, otomatik stand yapılıyor');
            await stand();
          }
        }
      }
    };

    checkBlackjack();
  }, [game?.players?.[0]?.hand]);

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
            path="/scoreboard" 
            element={user ? (
              <>
                <div className="container mx-auto px-4 py-8">
                  <ScoreBoard />
                </div>
              </>
            ) : <Navigate to="/login" />} 
          />

          <Route 
            path="/game/:roomId" 
            element={user ? (
              <>
                <div className="container mx-auto px-4">
                  {loading ? (
                    <div className="flex justify-center items-center h-[600px]">
                      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400"></div>
                    </div>
                  ) : (
                    <MultiplayerGameTable
                      game={game}
                      room={currentRoom}
                      user={user}
                      onHit={hit}
                      onStand={stand}
                      onBet={handleBetConfirm}
                      currentTurn={game?.currentTurn}
                      timeLeft={timeLeft}
                    />
                  )}
                  {error && (
                    <div className="fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg">
                      {error}
                    </div>
                  )}
                </div>
              </>
            ) : <Navigate to="/login" />} 
          />

          <Route
            path="/bet/:roomId"
            element={
              user ? (
                <MultiplayerBetForm />
              ) : (
                <Navigate to="/login" replace />
              )
            }
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
