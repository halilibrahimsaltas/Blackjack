const Card = ({ card }) => {
  const imagePath = card === 'back'
    ? '/img/cards/back.png'
    : `/img/cards/${card}.png`;

  return (
    <div className="card bg-white">
      <img 
        src={imagePath} 
        alt={card === 'back' ? 'Hidden Card' : card} 
        className={`w-full h-full object-contain rounded-lg ${
          card === 'back' ? 'p-0' : 'p-1'
        }`}
      />
    </div>
  );
};

export default Card; 