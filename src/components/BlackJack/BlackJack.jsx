import { useState, useEffect } from 'react';
import redDeckBack from '../../assets/img/Red_Deck.png';

const cardImages = import.meta.glob('../../assets/img/Cards/images/*.png', { eager: true });

export default function BlackJack({ onGameStart, isGameActive }) {
    const [deck, setDeck] = useState([]);
    const [playerHand, setPlayerHand] = useState([]);
    const [dealerHand, setDealerHand] = useState([]);
    const [gameState, setGameState] = useState('initial');
    const [message, setMessage] = useState('');
    const [score, setScore] = useState({ player: 0, dealer: 0 });

    // Streak State
    const [currentStreak, setCurrentStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);

    // Load best streak from server
    useEffect(() => {
        fetch('http://localhost:3000/bestStreak/global')
            .then(res => res.json())
            .then(data => setBestStreak(data.value))
            .catch(() => console.log('Json Server non attivo'));
    }, []);

    const updateStreak = (outcome) => {
        let newStreak = currentStreak;
        if (outcome === 'win') {
            newStreak += 1;
            if (newStreak > bestStreak) {
                setBestStreak(newStreak);
                fetch('http://localhost:3000/bestStreak/global', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: 'global',
                        value: newStreak,
                        player: 'Player',
                        date: new Date().toISOString()
                    })
                }).catch(() => { });
            }
        } else if (outcome === 'loss') {
            newStreak = 0;
        }
        // tie does nothing to streak
        setCurrentStreak(newStreak);
    };

    const getCardImage = (rank, suit) => {
        const filename = `../../assets/img/Cards/images/${rank}Of${suit}.png`;
        const module = cardImages[filename];
        return module ? module.default : null;
    };

    const generateDeck = () => {
        const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
        const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace'];
        const newDeck = [];

        for (let suit of suits) {
            for (let rank of ranks) {
                let value = parseInt(rank);
                if (['Jack', 'Queen', 'King'].includes(rank)) value = 10;
                if (rank === 'Ace') value = 11;

                newDeck.push({
                    suit,
                    rank,
                    value,
                    image: getCardImage(rank, suit)
                });
            }
        }
        return shuffle(newDeck);
    };

    const shuffle = (array) => {
        let currentIndex = array.length, randomIndex;
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    };

    const calculateScore = (hand) => {
        let sum = hand.reduce((acc, card) => acc + card.value, 0);
        let aces = hand.filter(card => card.rank === 'Ace').length;

        while (sum > 21 && aces > 0) {
            sum -= 10;
            aces--;
        }
        return sum;
    };

    const startNewGame = () => {
        if (onGameStart) onGameStart();

        const newDeck = generateDeck();
        const pHand = [newDeck.pop(), newDeck.pop()];
        const dHand = [newDeck.pop(), newDeck.pop()];

        setDeck(newDeck);
        setPlayerHand(pHand);
        setDealerHand(dHand);
        setMessage('');

        const pScore = calculateScore(pHand);
        const dScore = calculateScore(dHand);

        setScore({
            player: pScore,
            dealer: dScore
        });

        if (pScore === 21) {
            if (dScore === 21) {
                setMessage('Pareggio! Entrambi Blackjack Naturale.');
                updateStreak('tie');
                setGameState('gameOver');
            } else {
                setMessage('BLACKJACK! Hai vinto!');
                updateStreak('win');
                setGameState('gameOver');
            }
        } else {
            setGameState('playerTurn');
        }
    };

    const hit = () => {
        if (gameState !== 'playerTurn') return;

        const newDeck = [...deck];
        const card = newDeck.pop();
        const newHand = [...playerHand, card];

        setDeck(newDeck);
        setPlayerHand(newHand);

        const newScore = calculateScore(newHand);
        setScore(prev => ({ ...prev, player: newScore }));

        if (newScore > 21) {
            setMessage('Hai sballato! Vince il banco.');
            updateStreak('loss');
            setGameState('gameOver');
        } else if (newScore === 21) {
            setGameState('dealerTurn');
        }
    };

    const stand = () => {
        if (gameState !== 'playerTurn') return;
        setGameState('dealerTurn');
    };

    useEffect(() => {
        if (gameState === 'dealerTurn') {
            const playDealer = async () => {
                let currentDeck = [...deck];
                let currentHand = [...dealerHand];
                let currentScore = calculateScore(currentHand);

                while (currentScore < 17) {
                    await new Promise(r => setTimeout(r, 500));
                    const card = currentDeck.pop();
                    currentHand.push(card);
                    currentScore = calculateScore(currentHand);
                    setDeck([...currentDeck]);
                    setDealerHand([...currentHand]);
                    setScore(prev => ({ ...prev, dealer: currentScore }));
                }

                setDeck(currentDeck);
                setDealerHand(currentHand);
                setScore(prev => ({ ...prev, dealer: currentScore }));

                const pScore = calculateScore(playerHand);
                let outcome = 'tie';

                if (currentScore > 21) {
                    setMessage('Il banco ha sballato! Hai vinto!');
                    outcome = 'win';
                } else if (currentScore > pScore) {
                    setMessage('Il banco vince.');
                    outcome = 'loss';
                } else if (currentScore < pScore) {
                    setMessage('Hai vinto!');
                    outcome = 'win';
                } else {
                    setMessage('Pareggio.');
                    outcome = 'tie';
                }
                updateStreak(outcome);
                setGameState('gameOver');
            };
            playDealer();
        }
    }, [gameState]);

    const styles = `
        @keyframes dealCard {
            from {
                transform: translateY(-200px) scale(0.5);
                opacity: 0;
            }
            to {
                transform: translateY(0) scale(1);
                opacity: 1;
            }
        }
        .card-enter {
            animation: dealCard 0.5s ease-out forwards;
        }
    `;

    const containerStyle = {
        position: 'absolute',
        top: isGameActive ? '15vh' : '33vh',
        left: 0,
        width: '100%',
        height: isGameActive ? '85vh' : '67vh',
        transition: 'all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 0,
        boxSizing: 'border-box',
        color: 'white',
        fontFamily: "'m6x11', 'Rubik', sans-serif",
        pointerEvents: 'auto',
        overflowY: 'auto',
        overflowX: 'hidden'
    };

    const handStyle = {
        display: 'flex',
        gap: '10px',
        justifyContent: 'center',
        marginBottom: '10px'
    };

    const cardStyle = {
        width: '100px',
        height: 'auto',
        borderRadius: '5px'
    };

    const buttonBaseStyle = {
        fontFamily: 'm6x11, rubik, sans-serif',
        fontSize: '28px',
        lineHeight: '1.25',
        fontWeight: 'normal',
        color: 'white',
        textShadow: '2px 2px black',
        borderRadius: '10px',
        border: 'none',
        padding: '12px 30px',
        margin: '0 10px',
        cursor: 'pointer',
        transition: 'transform 0.1s',
    };

    const redButtonStyle = {
        ...buttonBaseStyle,
        backgroundColor: '#e63946',
        filter: 'drop-shadow(0px 6px 0px #9d0208)'
    };

    const blueButtonStyle = {
        ...buttonBaseStyle,
        backgroundColor: '#457b9d',
        filter: 'drop-shadow(0px 6px 0px #1d3557)'
    };

    return (
        <div style={containerStyle}>
            <style>{styles}</style>

            <div style={{ position: 'absolute', top: 10, right: 30, textAlign: 'right', zIndex: 30 }}>
                <div style={{ fontSize: '1.5rem', color: '#ffd700', textShadow: '2px 2px black' }}>streak: {currentStreak} 🔥</div>
                <div style={{ fontSize: '1rem', color: '#ccc', textShadow: '1px 1px black' }}>best: {bestStreak} 🏆</div>
            </div>

            <div style={{ textAlign: 'center' }}>
                <h2>Banco ({gameState === 'gameOver' || gameState === 'dealerTurn' ? score.dealer : '?'})</h2>
                <div style={handStyle}>
                    {dealerHand.map((card, index) => {
                        if (index === 0 && gameState === 'playerTurn') {
                            return (
                                <img key={index} src={redDeckBack} alt="Card Back" className="card-enter" style={cardStyle} />
                            );
                        }
                        return <img key={index} src={card.image} alt={`${card.rank} of ${card.suit}`} className="card-enter" style={cardStyle} />;
                    })}
                </div>
            </div>

            <div style={{ textAlign: 'center', margin: '20px 0' }}>
                <h1 style={{ textShadow: '2px 2px 4px #000' }}>{message}</h1>

                {gameState === 'initial' || gameState === 'gameOver' ? (
                    <button onClick={startNewGame} style={redButtonStyle} onMouseDown={e => e.currentTarget.style.transform = 'translateY(4px)'} onMouseUp={e => e.currentTarget.style.transform = 'translateY(0)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                        {gameState === 'initial' ? 'Gioca a Black Jack' : 'Nuova Partita'}
                    </button>
                ) : (
                    <div>
                        <button onClick={hit} style={redButtonStyle} onMouseDown={e => e.currentTarget.style.transform = 'translateY(4px)'} onMouseUp={e => e.currentTarget.style.transform = 'translateY(0)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>Carta</button>
                        <button onClick={stand} style={blueButtonStyle} onMouseDown={e => e.currentTarget.style.transform = 'translateY(4px)'} onMouseUp={e => e.currentTarget.style.transform = 'translateY(0)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>Stai</button>
                    </div>
                )}
            </div>

            <div style={{ textAlign: 'center' }}>
                <div style={handStyle}>
                    {playerHand.map((card, index) => (
                        <img key={index} src={card.image} alt={`${card.rank} of ${card.suit}`} className="card-enter" style={cardStyle} />
                    ))}
                </div>
                <h2>Tu ({score.player})</h2>
            </div>
        </div>
    );
}
