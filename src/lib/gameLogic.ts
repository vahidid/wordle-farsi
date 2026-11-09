import { TileStatus, GameStats } from './types';

export function evaluateGuess(guess: string, target: string): TileStatus[] {
  const result: TileStatus[] = Array(5).fill('absent');
  const targetChars = [...target];
  const guessChars = [...guess];

  // Frequency map for target characters not yet matched
  const remainingCounts: Record<string, number> = {};

  // Step 1: Exact matches (Green / correct)
  for (let i = 0; i < 5; i++) {
    if (guessChars[i] === targetChars[i]) {
      result[i] = 'correct';
    } else {
      const char = targetChars[i];
      remainingCounts[char] = (remainingCounts[char] || 0) + 1;
    }
  }

  // Step 2: Present elsewhere (Yellow / present)
  for (let i = 0; i < 5; i++) {
    if (result[i] === 'correct') continue;
    const char = guessChars[i];
    if (remainingCounts[char] && remainingCounts[char] > 0) {
      result[i] = 'present';
      remainingCounts[char]--;
    } else {
      result[i] = 'absent';
    }
  }

  return result;
}

export function calculateKeyStatuses(
  guesses: string[],
  target: string
): Record<string, TileStatus> {
  const keyStatuses: Record<string, TileStatus> = {};

  for (const guess of guesses) {
    const statuses = evaluateGuess(guess, target);
    const chars = [...guess];

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      const status = statuses[i];
      const current = keyStatuses[char];

      // Priority: correct (green) > present (yellow) > absent (gray)
      if (status === 'correct') {
        keyStatuses[char] = 'correct';
      } else if (status === 'present' && current !== 'correct') {
        keyStatuses[char] = 'present';
      } else if (status === 'absent' && !current) {
        keyStatuses[char] = 'absent';
      }
    }
  }

  return keyStatuses;
}

export const INITIAL_STATS: GameStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessDistribution: {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  },
};

const STATS_STORAGE_KEY = 'wordle_farsi_stats';

export function loadLocalStats(): GameStats {
  if (typeof window === 'undefined') return INITIAL_STATS;
  try {
    const saved = localStorage.getItem(STATS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...INITIAL_STATS,
        ...parsed,
        guessDistribution: {
          ...INITIAL_STATS.guessDistribution,
          ...(parsed.guessDistribution || {}),
        },
      };
    }
  } catch (err) {
    console.warn('Failed to load stats from localStorage', err);
  }
  return INITIAL_STATS;
}

export function saveLocalStats(stats: GameStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch (err) {
    console.warn('Failed to save stats to localStorage', err);
  }
}

export function updateStatsAfterGame(
  currentStats: GameStats,
  won: boolean,
  guessesCount: number
): GameStats {
  const newGamesPlayed = currentStats.gamesPlayed + 1;
  const newGamesWon = won ? currentStats.gamesWon + 1 : currentStats.gamesWon;
  const newCurrentStreak = won ? currentStats.currentStreak + 1 : 0;
  const newMaxStreak = Math.max(currentStats.maxStreak, newCurrentStreak);

  const newDist = { ...currentStats.guessDistribution };
  if (won && guessesCount >= 1 && guessesCount <= 6) {
    const key = guessesCount as 1 | 2 | 3 | 4 | 5 | 6;
    newDist[key] = (newDist[key] || 0) + 1;
  }

  const updated: GameStats = {
    gamesPlayed: newGamesPlayed,
    gamesWon: newGamesWon,
    currentStreak: newCurrentStreak,
    maxStreak: newMaxStreak,
    lastPlayedDate: new Date().toISOString(),
    guessDistribution: newDist,
  };

  saveLocalStats(updated);
  return updated;
}
