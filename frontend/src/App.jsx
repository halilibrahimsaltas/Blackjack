import { useState, useEffect } from 'react'
import axios from 'axios'
import GameTable from './components/GameTable'
import BetForm from './components/BetForm'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'

const API_URL = 'http://localhost:5000/api'

function App() {
  const [game, setGame] = useState(null)
  const [user, setUser] = useState(null)
  const [showRegister, setShowRegister] = useState(false)

  // Token'ı axios'a ekle
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      // Kullanıcı bilgilerini getir
      fetchUserProfile()
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
    } catch (error) {
      alert(error.response?.data?.message || 'Kayıt olurken bir hata oluştu')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
    setGame(null)
  }

  const startGame = async (bet) => {
    try {
      const response = await axios.post(`${API_URL}/game/start`, { bet })
      setGame(response.data.game)
      setUser(prev => ({ ...prev, chips: response.data.userChips }))
    } catch (error) {
      console.error('Oyun başlatılamadı:', error)
      alert(error.response?.data?.message || 'Oyun başlatılırken bir hata oluştu')
    }
  }

  const hit = async () => {
    try {
      const response = await axios.post(`${API_URL}/game/hit/${game._id}`)
      setGame(response.data.game)
      setUser(prev => ({ ...prev, chips: response.data.userChips }))
    } catch (error) {
      console.error('Kart çekilemedi:', error)
      alert('Kart çekilirken bir hata oluştu')
    }
  }

  const stand = async () => {
    try {
      const response = await axios.post(`${API_URL}/game/stand/${game._id}`)
      setGame(response.data.game)
      setUser(prev => ({ ...prev, chips: response.data.userChips }))
    } catch (error) {
      console.error('İşlem yapılamadı:', error)
      alert('İşlem yapılırken bir hata oluştu')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Başlık ve Kullanıcı Bilgisi */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-yellow-500 font-serif mb-2 tracking-wider">BLACKJACK</h1>
          <div className="w-32 h-1 bg-yellow-500 mx-auto rounded-full mb-4"></div>
          {user && (
            <div className="flex justify-center items-center gap-6">
              <p className="text-white">
                <span className="text-yellow-500">Oyuncu:</span> {user.username}
              </p>
              <p className="text-white">
                <span className="text-yellow-500">Chips:</span> {user.chips}
              </p>
              <button
                onClick={handleLogout}
                className="text-red-500 hover:text-red-400 font-semibold"
              >
                Çıkış Yap
              </button>
            </div>
          )}
        </div>

        {/* Ana İçerik */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 mb-8">
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
          ) : !game ? (
            <BetForm onStartGame={startGame} currentChips={user.chips} />
          ) : (
            <GameTable 
              game={game} 
              onHit={hit} 
              onStand={stand}
              onStartGame={startGame}
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
  )
}

export default App
