'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Trophy,
  Mail,
  KeyRound,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  LogOut,
  Send,
  Sparkles,
  Database,
} from 'lucide-react';
import {
  getLeaderboard,
  sendEmailOtp,
  verifyEmailOtp,
  recordGameScore,
  getCurrentUser,
  signOutUser,
  isSupabaseConfigured,
} from '@/lib/supabase';
import { LeaderboardEntry } from '@/lib/types';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  lastGameResult?: {
    won: boolean;
    guessesCount: number;
    word: string;
    timeSpentSeconds: number;
  } | null;
  onScoreRecorded?: () => void;
}

export function LeaderboardModal({
  isOpen,
  onClose,
  lastGameResult,
  onScoreRecorded,
}: LeaderboardModalProps) {
  const [activeTab, setActiveTab] = useState<'board' | 'auth'>('board');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingBoard, setLoadingBoard] = useState(false);

  // Auth State
  const [user, setUser] = useState<{ id: string; email: string; displayName?: string } | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Score recording state
  const [recordingScore, setRecordingScore] = useState(false);
  const [scoreRecorded, setScoreRecorded] = useState(false);

  // Load User and Leaderboard on open
  useEffect(() => {
    if (isOpen) {
      loadBoard();
      checkAuth();
    }
  }, [isOpen]);

  const loadBoard = async () => {
    setLoadingBoard(true);
    try {
      const data = await getLeaderboard();
      setLeaderboard(data);
    } finally {
      setLoadingBoard(false);
    }
  };

  const checkAuth = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    if (!currentUser && lastGameResult?.won) {
      // Auto recommend auth tab if user just won a game
      setActiveTab('auth');
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      setAuthMessage({ text: 'لطفاً یک آدرس ایمیل معتبر وارد کنید', type: 'error' });
      return;
    }

    setAuthLoading(true);
    setAuthMessage(null);
    try {
      const res = await sendEmailOtp(emailInput);
      if (res.success) {
        setOtpSent(true);
        setAuthMessage({
          text: isSupabaseConfigured
            ? 'کد تایید ۶ رقمی به ایمیل شما ارسال شد'
            : 'حالت دمو: هر کد ۴ یا ۶ رقمی (مثلاً 123456) را برای ورود آزمایشی وارد کنید',
          type: 'success',
        });
      } else {
        setAuthMessage({ text: res.error || 'خطا در ارسال کد تایید', type: 'error' });
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput || otpInput.trim().length < 4) {
      setAuthMessage({ text: 'کد تایید را وارد کنید', type: 'error' });
      return;
    }

    setAuthLoading(true);
    setAuthMessage(null);
    try {
      const res = await verifyEmailOtp(emailInput, otpInput.trim());
      if (res.success && res.user) {
        const loggedUser = {
          id: res.user.id,
          email: res.user.email || emailInput,
        };
        setUser(loggedUser);
        setAuthMessage({ text: 'با موفقیت وارد شدید!', type: 'success' });
        setOtpSent(false);

        // If there was a pending game result, record it now!
        if (lastGameResult && lastGameResult.won) {
          await submitCurrentScore(loggedUser);
        } else {
          setActiveTab('board');
          loadBoard();
        }
      } else {
        setAuthMessage({ text: res.error || 'کد تایید نامعتبر است', type: 'error' });
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const submitCurrentScore = async (currentUser = user) => {
    if (!currentUser || !lastGameResult) return;
    setRecordingScore(true);
    try {
      const res = await recordGameScore({
        userId: currentUser.id,
        email: currentUser.email,
        playerName: currentUser.displayName || currentUser.email.split('@')[0],
        guessesCount: lastGameResult.guessesCount,
        won: lastGameResult.won,
        word: lastGameResult.word,
        timeSpentSeconds: lastGameResult.timeSpentSeconds,
      });

      if (res.success) {
        setScoreRecorded(true);
        onScoreRecorded?.();
        loadBoard();
        setActiveTab('board');
      }
    } finally {
      setRecordingScore(false);
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    setUser(null);
    setOtpSent(false);
    setEmailInput('');
    setOtpInput('');
    setAuthMessage({ text: 'از حساب خارج شدید', type: 'success' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-bold">جدول رده‌بندی واژه‌چین</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Supabase status badge */}
        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span>پایگاه داده:</span>
          </div>
          {isSupabaseConfigured ? (
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Supabase ابری فعال است
            </span>
          ) : (
            <span className="text-amber-400 font-medium">
              حالت دمو محلی (Supabase در انتظار پیکربندی)
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('board')}
            className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === 'board'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            برترین حدس‌ها 🏆
          </button>
          <button
            onClick={() => setActiveTab('auth')}
            className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === 'auth'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {user ? 'پروفایل و ثبت رکورد 👤' : 'ثبت نام با ایمیل (OTP) ✉️'}
          </button>
        </div>

        {/* Tab 1: Leaderboard */}
        {activeTab === 'board' && (
          <div className="flex flex-col gap-3">
            {/* If user won and hasn't recorded yet */}
            {lastGameResult && lastGameResult.won && !scoreRecorded && (
              <div className="p-3 bg-amber-950/40 border border-amber-800/80 rounded-xl flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    برد اخیر شما با <strong>{lastGameResult.guessesCount} حدس</strong> هنوز در رده‌بندی ثبت نشده!
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (user) {
                      submitCurrentScore();
                    } else {
                      setActiveTab('auth');
                    }
                  }}
                  disabled={recordingScore}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shrink-0 transition cursor-pointer"
                >
                  {recordingScore ? 'در حال ثبت...' : 'ثبت رکورد'}
                </button>
              </div>
            )}

            {scoreRecorded && (
              <div className="p-2.5 bg-emerald-950/40 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>رکورد شما با موفقیت در جدول ذخیره شد! 🎉</span>
              </div>
            )}

            {/* List */}
            {loadingBoard ? (
              <div className="py-12 text-center text-sm text-slate-400">
                در حال دریافت جدول رده‌بندی...
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-400">
                هنوز رکوردی ثبت نشده است. اولین نفر باشید!
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {leaderboard.map((item, index) => {
                  const medal =
                    index === 0
                      ? '🥇'
                      : index === 1
                      ? '🥈'
                      : index === 2
                      ? '🥉'
                      : `${index + 1}`;

                  return (
                    <div
                      key={item.id}
                      className="p-3 bg-slate-950/60 hover:bg-slate-800/50 border border-slate-800 rounded-xl flex items-center justify-between text-xs sm:text-sm transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-center font-extrabold text-base">
                          {medal}
                        </span>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-100">
                            {item.playerName}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {item.emailMasked}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-950/50 px-2 py-1 rounded border border-emerald-900/60">
                          <span>{item.guessesCount} حدس</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-400 text-xs">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{item.timeSpentSeconds} ثانیه</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Auth / OTP */}
        {activeTab === 'auth' && (
          <div className="flex flex-col gap-4 text-sm">
            {user ? (
              // User is already logged in
              <div className="flex flex-col gap-4 p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="text-xs text-slate-400">وارد شده با حساب:</div>
                      <div className="font-bold text-slate-100">{user.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="p-2 text-rose-400 hover:bg-rose-950/30 rounded-lg transition"
                    title="خروج از حساب"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

                {lastGameResult && lastGameResult.won && (
                  <button
                    onClick={() => submitCurrentScore()}
                    disabled={recordingScore || scoreRecorded}
                    className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                  >
                    <Trophy className="w-4 h-4" />
                    <span>
                      {scoreRecorded
                        ? 'این رکورد ثبت شده است'
                        : recordingScore
                        ? 'در حال ثبت...'
                        : `ثبت رکورد آخرین برد (${lastGameResult.guessesCount} حدس)`}
                    </span>
                  </button>
                )}
              </div>
            ) : (
              // User needs to sign in via OTP
              <div className="flex flex-col gap-4">
                <div className="p-3 bg-slate-800/40 border border-slate-700/60 rounded-xl text-xs text-slate-300 leading-relaxed">
                  🔐 برای ثبت رکورد در جدول رده‌بندی ملی و اشتراک معتبر، کافی است ایمیل خود را وارد کرده تا کد یکبار مصرف (OTP) بدون رمز عبور برای شما ارسال شود.
                </div>

                {authMessage && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                      authMessage.type === 'success'
                        ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
                        : 'bg-rose-950/50 border-rose-800 text-rose-300'
                    }`}
                  >
                    {authMessage.type === 'success' ? (
                      <CheckCircle className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{authMessage.text}</span>
                  </div>
                )}

                {!otpSent ? (
                  // Step 1: Enter email
                  <form onSubmit={handleSendOtp} className="flex flex-col gap-3">
                    <label className="text-xs text-slate-300 font-semibold">
                      ایمیل شما:
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="you@example.com"
                        required
                        dir="ltr"
                        className="w-full px-4 py-3 pl-10 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition text-sm"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    </div>
                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition active:scale-98 shadow-md shadow-emerald-950/50 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>{authLoading ? 'در حال ارسال کد...' : 'ارسال کد یکبار مصرف (OTP)'}</span>
                    </button>
                  </form>
                ) : (
                  // Step 2: Enter OTP code
                  <form onSubmit={handleVerifyOtp} className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-slate-300 font-semibold">
                        کد تایید ۶ رقمی ارسال شده به {emailInput}:
                      </label>
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="text-xs text-emerald-400 hover:underline"
                      >
                        تغییر ایمیل
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                        placeholder="123456"
                        maxLength={6}
                        required
                        dir="ltr"
                        autoFocus
                        className="w-full px-4 py-3 pl-10 rounded-xl bg-slate-950 border border-slate-700 text-white text-center font-mono tracking-widest text-lg placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                      />
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-4 pointer-events-none" />
                    </div>

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition active:scale-98 shadow-md shadow-emerald-950/50 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{authLoading ? 'در حال تایید...' : 'تایید کد و ورود'}</span>
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
