const Card = ({ card, isHidden = false }) => {
  const imagePath = isHidden 
    ? '/img/cards/back.png'
    : `/img/cards/${card}.png`;

  return (
    <div className="card bg-white">
      <img 
        src={imagePath} 
        alt={isHidden ? 'Hidden Card' : card} 
        className="w-full h-full object-contain rounded-lg p-1"
      />
    </div>
  );
};

export default Card; 