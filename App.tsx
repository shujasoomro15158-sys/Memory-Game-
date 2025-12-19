
import React, { useState, useEffect, useCallback } from 'react';
import { CardType, GameState } from './types';
import { EMOJIS, SHUFFLE_ALGORITHM } from './constants';
import Card from './components/Card';
import { getVictoryMessage } from './services/geminiService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    cards: [],
    moves: 0,
    matches: 0,
    isWon: false,
    isProcessing: false,
  });
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [victoryQuote, setVictoryQuote] = useState<string>('');
  const [loadingQuote, setLoadingQuote] = useState(false);

  // Initialize or Restart Game
  const initGame = useCallback(() => {
    const duplicatedEmojis = [...EMOJIS, ...EMOJIS];
    const shuffled = SHUFFLE_ALGORITHM(duplicatedEmojis);
    
    const newCards: CardType[] = shuffled.map((emoji, index) => ({
      id: index,
      content: emoji,
      isFlipped: false,
      isMatched: false,
    }));

    setGameState({
      cards: newCards,
      moves: 0,
      matches: 0,
      isWon: false,
      isProcessing: false,
    });
    setFlippedIds([]);
    setVictoryQuote('');
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Handle Card Click
  const handleCardClick = (id: number) => {
    if (gameState.isProcessing || flippedIds.length >= 2) return;

    const clickedCard = gameState.cards.find(c => c.id === id);
    if (!clickedCard || clickedCard.isMatched || clickedCard.isFlipped) return;

    const updatedCards = gameState.cards.map(card => 
      card.id === id ? { ...card, isFlipped: true } : card
    );

    setGameState(prev => ({ ...prev, cards: updatedCards }));
    setFlippedIds(prev => [...prev, id]);
  };

  // Check for Matches
  useEffect(() => {
    if (flippedIds.length === 2) {
      const [id1, id2] = flippedIds;
      const card1 = gameState.cards.find(c => c.id === id1)!;
      const card2 = gameState.cards.find(c => c.id === id2)!;

      setGameState(prev => ({ ...prev, isProcessing: true }));

      setTimeout(() => {
        if (card1.content === card2.content) {
          // It's a match!
          setGameState(prev => {
            const nextMatches = prev.matches + 1;
            const isWon = nextMatches === EMOJIS.length;
            
            return {
              ...prev,
              cards: prev.cards.map(card => 
                card.id === id1 || card.id === id2 
                  ? { ...card, isMatched: true, isFlipped: false } 
                  : card
              ),
              matches: nextMatches,
              moves: prev.moves + 1,
              isWon,
              isProcessing: false,
            };
          });
        } else {
          // No match
          setGameState(prev => ({
            ...prev,
            cards: prev.cards.map(card => 
              card.id === id1 || card.id === id2 
                ? { ...card, isFlipped: false } 
                : card
            ),
            moves: prev.moves + 1,
            isProcessing: false,
          }));
        }
        setFlippedIds([]);
      }, 800);
    }
  }, [flippedIds, gameState.cards]);

  // Generate victory message when game is won
  useEffect(() => {
    if (gameState.isWon) {
      setLoadingQuote(true);
      getVictoryMessage(gameState.moves).then(quote => {
        setVictoryQuote(quote);
        setLoadingQuote(false);
      });
    }
  }, [gameState.isWon, gameState.moves]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      {/* Header & Stats */}
      <div className="max-w-md w-full mb-8 text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center justify-center gap-2">
          <span className="text-indigo-600">Mind</span>Flip
        </h1>
        <p className="text-slate-500 mb-6">Test your memory and match the pairs!</p>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Moves</p>
            <p className="text-2xl font-bold text-slate-800">{gameState.moves}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Pairs Found</p>
            <p className="text-2xl font-bold text-slate-800">{gameState.matches} / {EMOJIS.length}</p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 gap-3 sm:gap-4 w-full max-w-md">
        {gameState.cards.map(card => (
          <Card key={card.id} card={card} onClick={handleCardClick} />
        ))}
      </div>

      {/* Controls */}
      <div className="mt-8 flex gap-4">
        <button 
          onClick={initGame}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 active:scale-95"
        >
          <i className="fa-solid fa-rotate"></i>
          Restart Game
        </button>
      </div>

      {/* Victory Modal Overlay */}
      {gameState.isWon && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center transform scale-110 animate-in zoom-in-95 duration-300">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">You Did It!</h2>
            
            <div className="my-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              {loadingQuote ? (
                <div className="flex items-center justify-center gap-2 text-indigo-400 animate-pulse">
                  <i className="fa-solid fa-brain"></i>
                  <span>AI Thinking...</span>
                </div>
              ) : (
                <p className="text-indigo-900 italic font-medium">"{victoryQuote}"</p>
              )}
            </div>

            <div className="flex flex-col gap-2 mb-6">
                <div className="flex justify-between text-sm text-slate-600 px-4">
                    <span>Total Moves</span>
                    <span className="font-bold text-slate-900">{gameState.moves}</span>
                </div>
                <div className="w-full bg-slate-100 h-px"></div>
                <div className="flex justify-between text-sm text-slate-600 px-4">
                    <span>Accuracy</span>
                    <span className="font-bold text-slate-900">
                        {Math.round((EMOJIS.length / gameState.moves) * 100)}%
                    </span>
                </div>
            </div>

            <button 
              onClick={initGame}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-12 text-slate-400 text-sm flex items-center gap-2">
        <i className="fa-solid fa-bolt-lightning text-indigo-400"></i>
        <span>Powered by Gemini AI for smart cheers</span>
      </div>
    </div>
  );
};

export default App;
