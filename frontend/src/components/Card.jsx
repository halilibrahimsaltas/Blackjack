const Card = ({ card }) => {
  const imagePath = card === 'back'
    ? '/img/cards/back.png'
    : `/img/cards/${card}.png`;

  return (
    <div className={`card bg-white ${card === 'back' ? 'h-[145px] py-0 px-0' : ''}`}>
      <img 
        src={imagePath} 
        alt={card === 'back' ? 'Hidden Card' : card} 
        className={`w-full h-full object-contain rounded-lg ${
          card === 'back' ? 'object-fill' : 'p-1'
        }`}
      />
    </div>
  );
};

export default Card; 