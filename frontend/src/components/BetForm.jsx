import ChipSelector from './ChipSelector';

const BetForm = ({ onStartGame, currentChips = 1000, lastBetAmount = 10 }) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-8 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl shadow-2xl border border-gray-600">
      <h2 className="text-3xl font-bold mb-4 text-center text-yellow-500 font-serif">Yeni El</h2>
      
      <div className="text-center mb-8">
        <p className="text-xl text-yellow-400">
          
        </p>
      </div>
      
      <ChipSelector 
        onBetConfirm={onStartGame} 
        maxChips={currentChips} 
        defaultBet={Math.min(lastBetAmount, currentChips)}
      />
    </div>
  );
};

export default BetForm; 