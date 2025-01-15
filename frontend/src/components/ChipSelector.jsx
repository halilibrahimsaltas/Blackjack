import { useState } from 'react';

const ChipSelector = ({ maxChips, onBetConfirm }) => {
  const [selectedChips, setSelectedChips] = useState([]);

  const chipValues = [
    { value: 500, image: '/img/chips/chip-500.png' },
    { value: 100, image: '/img/chips/chip-100.png' },
    { value: 50, image: '/img/chips/chip-50.png' },
    { value: 25, image: '/img/chips/chip-25.png' },
    { value: 10, image: '/img/chips/chip-10.png' },
    { value: 5, image: '/img/chips/chip-5.png' }
  ];

  const totalBet = selectedChips.reduce((sum, chip) => sum + chip.value, 0);

  const handleChipClick = (chip) => {
    if (totalBet + chip.value <= maxChips) {
      setSelectedChips([...selectedChips, chip]);
    }
  };

  const handleChipRightClick = (e, chipValue) => {
    e.preventDefault(); // Sağ tık menüsünü engelle
    const index = selectedChips.map(chip => chip.value).lastIndexOf(chipValue);
    if (index !== -1) {
      const newChips = [...selectedChips];
      newChips.splice(index, 1);
      setSelectedChips(newChips);
    }
  };

  const handleConfirm = () => {
    if (totalBet >= 5) {
      onBetConfirm(totalBet);
      setSelectedChips([]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Mevcut Bakiye */}
      <div className="mb-6 text-center">
        <p className="text-lg text-gray-400 font-mono">
          Bakiye: <span className="text-yellow-500 font-bold">{maxChips}</span>
        </p>
      </div>

      {/* Chip Seçenekleri */}
      <div className="flex justify-center gap-6 mb-8 flex-wrap">
        {chipValues.map((chip) => (
          <div
            key={chip.value}
            onClick={() => handleChipClick(chip)}
            onContextMenu={(e) => handleChipRightClick(e, chip.value)}
            className="relative w-16 h-16 md:w-20 md:h-20 cursor-pointer hover:scale-110 transition-transform select-none"
          >
            <img
              src={chip.image}
              alt={`${chip.value} Chip`}
              className="w-full h-full object-contain drop-shadow-lg"
            />
          </div>
        ))}
      </div>

      {/* Bahis Alanı */}
      <div className="w-72 h-40 mx-auto rounded-xl 
        bg-gradient-to-br from-gray-800 to-gray-900
        border-2 border-yellow-500/30 flex flex-col items-center justify-center
        transition-all duration-300 relative overflow-hidden
        shadow-lg hover:shadow-xl mb-8">
        {/* Seçili Chipler */}
        <div className="absolute inset-0 flex flex-wrap justify-center items-center gap-2 p-2">
          {selectedChips.map((chip, index) => {
            // Aynı değerdeki chip'leri grupla
            const sameValueChips = selectedChips.filter(c => c.value === chip.value);
            const chipIndex = sameValueChips.findIndex((_, i) => 
              selectedChips.indexOf(sameValueChips[i]) === index
            );
            
            // Eğer bu chip daha önce render edilmiş aynı değerdeki bir chip ise atla
            if (selectedChips.findIndex(c => c.value === chip.value) !== index) {
              return null;
            }

            return (
              <div
                key={index}
                className="relative"
                style={{
                  width: '45px',
                  height: '45px',
                  cursor: 'pointer',
                  zIndex: chipIndex + 1
                }}
              >
                {/* Chip yığını */}
                {sameValueChips.map((_, stackIndex) => (
                  <div
                    key={stackIndex}
                    onClick={() => handleChipRightClick(new Event('click'), chip.value)}
                    className="absolute left-0 w-full h-full transition-transform hover:scale-110"
                    style={{
                      top: `${stackIndex * -4}px`,
                      zIndex: stackIndex
                    }}
                  >
                    <img
                      src={chip.image}
                      alt={`${chip.value} Chip`}
                      className="w-full h-full object-contain drop-shadow-lg"
                    />
                  </div>
                ))}
                
                {/* Chip sayısı */}
                {sameValueChips.length > 1 && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md border border-black/20"
                       style={{ zIndex: sameValueChips.length + 10 }}>
                    {sameValueChips.length}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Kontrol Butonları */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setSelectedChips([])}
          className="px-5 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-md hover:shadow-lg text-sm"
        >
          Temizle
        </button>
        <button
          onClick={handleConfirm}
          disabled={totalBet < 5}
          className="px-5 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg text-sm disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span>Bahis Yap</span>
          {totalBet > 0 && (
            <span className="bg-black/30 px-2 py-0.5 rounded-md">
              ({totalBet})
            </span>
          )}
        </button>
      </div>

      {/* Bilgi Mesajı */}
      <div className="mt-4 text-center text-gray-500 text-sm">
        {totalBet < 5 ? (
          <p>Minimum bahis: 5</p>
        ) : totalBet > maxChips ? (
          <p>Maksimum bahis: {maxChips}</p>
        ) : (
          <p>Chip'leri eklemek için tıklayın, kaldırmak için sağ tıklayın</p>
        )}
      </div>
    </div>
  );
};

export default ChipSelector; 