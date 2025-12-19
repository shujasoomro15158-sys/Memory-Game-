
import React from 'react';
import { CardType } from '../types';

interface CardProps {
  card: CardType;
  onClick: (id: number) => void;
}

const Card: React.FC<CardProps> = ({ card, onClick }) => {
  const isShown = card.isFlipped || card.isMatched;

  return (
    <div 
      className="relative w-full h-24 sm:h-32 cursor-pointer perspective-1000 group"
      onClick={() => !isShown && onClick(card.id)}
    >
      <div 
        className={`w-full h-full duration-500 transform-style-3d transition-all ${
          isShown ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front Face (Hidden initially) */}
        <div className="absolute inset-0 w-full h-full bg-indigo-600 rounded-xl shadow-lg border-4 border-indigo-400 flex items-center justify-center backface-hidden group-hover:bg-indigo-500 transition-colors">
            <span className="text-4xl text-white opacity-20">?</span>
        </div>

        {/* Back Face (The Content) */}
        <div className={`absolute inset-0 w-full h-full bg-white rounded-xl shadow-lg border-4 flex items-center justify-center backface-hidden rotate-y-180 ${
          card.isMatched ? 'border-green-400 bg-green-50' : 'border-indigo-200'
        }`}>
          <span className="text-4xl sm:text-5xl select-none">{card.content}</span>
        </div>
      </div>
    </div>
  );
};

export default Card;
