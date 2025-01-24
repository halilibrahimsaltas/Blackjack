const createDeck = () => {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
    const deck = [];
    
    for (let suit of suits) {
        for (let value of values) {
            deck.push(`${value}_of_${suit}`);
        }
    }

    // Desteyi karıştır
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
};

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

const determineWinner = (playerHand, dealerHand) => {
    const playerValue = calculateHandValue(playerHand);
    const dealerValue = calculateHandValue(dealerHand);

    if (playerValue > 21) return 'dealer';
    if (dealerValue > 21) return 'player';
    if (playerValue > dealerValue) return 'player';
    if (dealerValue > playerValue) return 'dealer';
    return 'push';
};

module.exports = {
    createDeck,
    calculateHandValue,
    determineWinner
}; 