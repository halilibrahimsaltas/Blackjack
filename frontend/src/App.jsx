import { useState } from 'react'
import axios from 'axios'
import GameTable from './components/GameTable'
import BetForm from './components/BetForm'

const API_URL = 'http://localhost:5000/api/game'

function App() {
  const [game, setGame] = useState(null)

  const startGame = async (bet) => {
    try {
      const response = await axios.post(`${API_URL}/start`, { bet })
      setGame(response.data)
    } catch (error) {
      console.error('Oyun başlatılamadı:', error)
      alert('Oyun başlatılırken bir hata oluştu')
    }
  }

  const hit = async () => {
    try {
      const response = await axios.post(`${API_URL}/hit/${game._id}`)
      setGame(response.data)
    } catch (error) {
      console.error('Kart çekilemedi:', error)
      alert('Kart çekilirken bir hata oluştu')
    }
  }

  const stand = async () => {
    try {
      const response = await axios.post(`${API_URL}/stand/${game._id}`)
      setGame(response.data)
    } catch (error) {
      console.error('İşlem yapılamadı:', error)
      alert('İşlem yapılırken bir hata oluştu')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Casino Logo ve Başlık */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-yellow-500 font-serif mb-2 tracking-wider">BLACKJACK</h1>
          <div className="w-32 h-1 bg-yellow-500 mx-auto rounded-full"></div>
        </div>

        {/* Oyun Alanı */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 mb-8">
          {!game ? (
            <BetForm onStartGame={startGame} />
          ) : (
            <GameTable 
              game={game} 
              onHit={hit} 
              onStand={stand}
              onStartGame={startGame}
            />
          )}
        </div>

        {/* Alt Bilgi */}
        <div className="text-center text-gray-400 text-sm">
          <p>🎰 Şansınız bol olsun! 🎲</p>
        </div>
      </div>
    </div>
  )
}

export default App
