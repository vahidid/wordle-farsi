import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { LeaderboardEntry, UserProfile } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('your-project')
);

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return supabaseInstance;
}

// Local storage key for offline / demo leaderboard
const MOCK_LEADERBOARD_KEY = 'wordle_farsi_mock_leaderboard';
const MOCK_USER_KEY = 'wordle_farsi_mock_user';

const INITIAL_MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'mock-1',
    playerName: 'سهراب',
    emailMasked: 'so***@gmail.com',
    guessesCount: 2,
    won: true,
    word: 'آرامش',
    timeSpentSeconds: 42,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    rank: 1,
  },
  {
    id: 'mock-2',
    playerName: 'نیلوفر',
    emailMasked: 'ni***@yahoo.com',
    guessesCount: 3,
    won: true,
    word: 'باران',
    timeSpentSeconds: 58,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    rank: 2,
  },
  {
    id: 'mock-3',
    playerName: 'آرشام',
    emailMasked: 'ar***@outlook.com',
    guessesCount: 3,
    won: true,
    word: 'پرواز',
    timeSpentSeconds: 74,
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    rank: 3,
  },
  {
    id: 'mock-4',
    playerName: 'یاسمن',
    emailMasked: 'ya***@gmail.com',
    guessesCount: 4,
    won: true,
    word: 'مهتاب',
    timeSpentSeconds: 88,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    rank: 4,
  },
  {
    id: 'mock-5',
    playerName: 'پرهام',
    emailMasked: 'pa***@gmail.com',
    guessesCount: 4,
    won: true,
    word: 'الماس',
    timeSpentSeconds: 95,
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    rank: 5,
  },
];

// Helper to mask emails for privacy (e.g., va***@gmail.com)
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email || 'کاربر ناشناس';
  const [user, domain] = email.split('@');
  const visible = user.slice(0, Math.min(2, user.length));
  return `${visible}***@${domain}`;
}

// Send OTP to email via Supabase
export async function sendEmailOtp(email: string): Promise<{ success: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) {
    // Offline simulation mode
    if (typeof window !== 'undefined') {
      localStorage.setItem('wordle_farsi_pending_otp_email', email);
    }
    return { success: true };
  }

  try {
    const { error } = await client.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'خطای ناشناخته در ارسال کد';
    return { success: false, error: msg };
  }
}

// Verify 6-digit OTP code
export async function verifyEmailOtp(
  email: string,
  token: string
): Promise<{ success: boolean; user?: User | { email: string; id: string }; error?: string }> {
  const client = getSupabase();
  if (!client) {
    // Offline simulation mode (accept any 6-digit code or '123456')
    if (token.length >= 4) {
      const mockUser = {
        id: 'mock-user-' + Date.now(),
        email,
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem(MOCK_USER_KEY, JSON.stringify(mockUser));
      }
      return { success: true, user: mockUser };
    }
    return { success: false, error: 'کد تایید نامعتبر است' };
  }

  try {
    const { data, error } = await client.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error || !data.user) {
      return { success: false, error: error?.message || 'کد وارد شده معتبر نیست یا منقضی شده است' };
    }

    return { success: true, user: data.user };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'خطای غیرمنتظره در تایید کد';
    return { success: false, error: msg };
  }
}

// Get currently authenticated user
export async function getCurrentUser(): Promise<{ id: string; email: string; displayName?: string } | null> {
  const client = getSupabase();
  if (!client) {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(MOCK_USER_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return null;
  }

  try {
    const { data: { user } } = await client.auth.getUser();
    if (!user || !user.email) return null;
    return {
      id: user.id,
      email: user.email,
      displayName: user.user_metadata?.display_name || user.email.split('@')[0],
    };
  } catch {
    return null;
  }
}

// Sign out user
export async function signOutUser(): Promise<void> {
  const client = getSupabase();
  if (!client) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(MOCK_USER_KEY);
    }
    return;
  }
  await client.auth.signOut();
}

// Save score to leaderboard
export async function recordGameScore(params: {
  userId?: string;
  email: string;
  playerName?: string;
  guessesCount: number;
  won: boolean;
  word: string;
  timeSpentSeconds: number;
}): Promise<{ success: boolean; error?: string }> {
  const client = getSupabase();

  if (!client) {
    // Save to local mock leaderboard
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(MOCK_LEADERBOARD_KEY);
        const list: LeaderboardEntry[] = stored ? JSON.parse(stored) : [...INITIAL_MOCK_LEADERBOARD];

        const newEntry: LeaderboardEntry = {
          id: 'local-' + Date.now(),
          playerName: params.playerName || params.email.split('@')[0] || 'شما',
          emailMasked: maskEmail(params.email),
          guessesCount: params.guessesCount,
          won: params.won,
          word: params.word,
          timeSpentSeconds: params.timeSpentSeconds,
          createdAt: new Date().toISOString(),
        };

        list.unshift(newEntry);
        // Sort by won, then guessesCount asc, then timeSpentSeconds asc
        list.sort((a, b) => {
          if (a.won !== b.won) return a.won ? -1 : 1;
          if (a.guessesCount !== b.guessesCount) return a.guessesCount - b.guessesCount;
          return a.timeSpentSeconds - b.timeSpentSeconds;
        });

        localStorage.setItem(MOCK_LEADERBOARD_KEY, JSON.stringify(list.slice(0, 50)));
        return { success: true };
      } catch (err) {
        return { success: false, error: 'خطا در ذخیره محلی' };
      }
    }
    return { success: true };
  }

  try {
    const { error } = await client.from('leaderboard').insert([
      {
        user_id: params.userId || null,
        player_name: params.playerName || params.email.split('@')[0] || 'کاربر',
        email_masked: maskEmail(params.email),
        guesses_count: params.guessesCount,
        won: params.won,
        word: params.word,
        time_spent_seconds: params.timeSpentSeconds,
      },
    ]);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'خطا در ذخیره رتبه';
    return { success: false, error: msg };
  }
}

// Fetch top leaderboard entries
export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const client = getSupabase();
  if (!client) {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(MOCK_LEADERBOARD_KEY);
        const list: LeaderboardEntry[] = stored ? JSON.parse(stored) : [...INITIAL_MOCK_LEADERBOARD];
        return list.map((item, index) => ({ ...item, rank: index + 1 }));
      } catch {
        return INITIAL_MOCK_LEADERBOARD;
      }
    }
    return INITIAL_MOCK_LEADERBOARD;
  }

  try {
    const { data, error } = await client
      .from('leaderboard')
      .select('*')
      .eq('won', true)
      .order('guesses_count', { ascending: true })
      .order('time_spent_seconds', { ascending: true })
      .limit(30);

    if (error || !data) {
      console.warn('Leaderboard query error:', error);
      return INITIAL_MOCK_LEADERBOARD;
    }

    return data.map((row, index) => ({
      id: row.id,
      userId: row.user_id,
      playerName: row.player_name || 'کاربر واژه‌چین',
      emailMasked: row.email_masked || 'پنهان',
      guessesCount: row.guesses_count,
      won: row.won,
      word: row.word,
      timeSpentSeconds: row.time_spent_seconds,
      createdAt: row.created_at,
      rank: index + 1,
    }));
  } catch (err) {
    console.warn('Leaderboard fetch failure:', err);
    return INITIAL_MOCK_LEADERBOARD;
  }
}
