'use client';

import React from 'react';
import { X, Trophy, Share2, RotateCcw, Flame, CheckCircle, LogOut } from 'lucide-react';
import { GameStats, GameStatus } from '@/lib/types';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GameStats;
  gameStatus: GameStatus;
  targetWord: string;
  guessesCount: number;
  onPlayAgain: () => void;
  onOpenShare: () => void;
  onOpenLeaderboard: () => void;
}

export function StatsModal({
  isOpen,
  onClose,
  stats,
  gameStatus,
  targetWord,
  guessesCount,
  onPlayAgain,
  onOpenShare,
  onOpenLeaderboard,
}: StatsModalProps) {
  if (!isOpen) return null;

  const isGameOver = gameStatus === 'WON' || gameStatus === 'LOST';
  const winPercentage =
    stats.gamesPlayed > 0
      ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
      : 0;

  // Max count in distribution for proportional bars
  const maxDistCount = Math.max(1, ...Object.values(stats.guessDistribution));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span>آمار و عملکرد شما</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* End of game banner if applicable */}
        {isGameOver && (
          <div
            className={`p-4 rounded-xl border flex flex-col items-center text-center gap-2 ${
              gameStatus === 'WON'
                ? 'bg-emerald-950/50 border-emerald-800/80 text-emerald-200'
                : 'bg-rose-950/50 border-rose-800/80 text-rose-200'
            }`}
          >
            <div className="text-2xl font-black">
              {gameStatus === 'WON' ? '🎉 آفرین! برنده شدی!' : '😔 حیف شد! باختی!'}
            </div>
            <div className="text-sm">
              کلمه صحیح این دور:{' '}
              <span className="font-extrabold text-base text-white px-2 py-0.5 rounded bg-slate-800/80 mx-1">
                {targetWord}
              </span>
            </div>
            {gameStatus === 'WON' && (
              <div className="text-xs text-emerald-300">
                در {guessesCount} حدس واژه رو پیدا کردی 🎯
              </div>
            )}
          </div>
        )}

        {/* 4 Stat Boxes */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col">
            <span className="text-2xl font-black text-white">{stats.gamesPlayed}</span>
            <span className="text-[11px] text-slate-400 font-medium">بازی</span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col">
            <span className="text-2xl font-black text-emerald-400">{winPercentage}٪</span>
            <span className="text-[11px] text-slate-400 font-medium">برد</span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col">
            <span className="text-2xl font-black text-amber-400 flex items-center justify-center gap-0.5">
              <span>{stats.currentStreak}</span>
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            </span>
            <span className="text-[11px] text-slate-400 font-medium">زنجیره فعلی</span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col">
            <span className="text-2xl font-black text-purple-400">{stats.maxStreak}</span>
            <span className="text-[11px] text-slate-400 font-medium">بهترین زنجیره</span>
          </div>
        </div>

        {/* Guess Distribution Chart */}
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            نمودار توزیع حدس‌ها:
          </h3>
          <div className="flex flex-col gap-1.5 text-xs">
            {([1, 2, 3, 4, 5, 6] as const).map((guessNum) => {
              const count = stats.guessDistribution[guessNum] || 0;
              const widthPct = Math.max(8, Math.round((count / maxDistCount) * 100));
              const isCurrentWinningGuess =
                gameStatus === 'WON' && guessesCount === guessNum;

              return (
                <div key={guessNum} className="flex items-center gap-2">
                  <span className="w-3 text-slate-400 font-bold text-center">
                    {guessNum}
                  </span>
                  <div className="flex-1 bg-slate-800/60 h-6 rounded-md overflow-hidden p-0.5">
                    <div
                      style={{ width: `${widthPct}%` }}
                      className={`h-full rounded flex items-center justify-end px-2 font-bold text-[11px] transition-all duration-500 ${
                        isCurrentWinningGuess
                          ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/50'
                          : 'bg-slate-700 text-slate-200'
                      }`}
                    >
                      {count}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-800">
          {isGameOver && (
            <div className="flex gap-2">
              <button
                onClick={onOpenShare}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 active:scale-98 transition cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>اشتراک‌گذاری نتیجه</span>
              </button>

              <button
                onClick={onOpenLeaderboard}
                className="py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 font-bold text-sm text-slate-950 flex items-center justify-center gap-1.5 active:scale-98 transition cursor-pointer shadow-lg shadow-amber-950/40"
                title="ثبت در جدول رده‌بندی"
              >
                <Trophy className="w-4 h-4" />
                <span>رده‌بندی</span>
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => {
                onClose();
                onPlayAgain();
              }}
              className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-sm text-slate-100 flex items-center justify-center gap-2 border border-slate-700 active:scale-98 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-emerald-400" />
              <span>کلمه جدید (بازی دوباره)</span>
            </button>

            <button
              onClick={onClose}
              className="py-3 px-5 rounded-xl bg-slate-800/50 hover:bg-slate-800 font-medium text-sm text-slate-400 hover:text-slate-200 border border-slate-800 active:scale-98 transition cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>فعلاً بی‌خیال</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
