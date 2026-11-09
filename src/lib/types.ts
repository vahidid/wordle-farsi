export type TileStatus = 'empty' | 'tbd' | 'correct' | 'present' | 'absent';

export type GameStatus = 'IN_PROGRESS' | 'WON' | 'LOST';

export interface RowEvaluation {
  letters: string[];
  statuses: TileStatus[];
}

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  lastPlayedDate?: string;
  guessDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
    6: number;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution?: Record<string, number>;
  createdAt?: string;
}

export interface LeaderboardEntry {
  id: string;
  userId?: string;
  playerName: string;
  emailMasked?: string;
  guessesCount: number;
  won: boolean;
  word: string;
  timeSpentSeconds: number;
  createdAt: string;
  rank?: number;
}
