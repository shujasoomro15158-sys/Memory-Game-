
export interface CardType {
  id: number;
  content: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface GameState {
  cards: CardType[];
  moves: number;
  matches: number;
  isWon: boolean;
  isProcessing: boolean;
}
