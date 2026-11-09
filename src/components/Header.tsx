'use client';

import React from 'react';
import { HelpCircle, Trophy, BarChart2, RotateCcw, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { sounds } from '@/lib/sound';

interface HeaderProps {
  onOpenHelp: () => void;
  onOpenStats: () => void;
  onOpenLeaderboard: () => void;
  onRestartGame: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
  gameWon: boolean;
}

export function Header({
  onOpenHelp,
  onOpenStats,
  onOpenLeaderboard,
  onRestartGame,
  isMuted,
  onToggleSound,
  gameWon,
}: HeaderProps) {
  return (
    <header className="w-full max-w-2xl mx-auto px-4 py-3 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md sticky top-0 z-30">
      {/* Right icons (in RTL: Start of header) */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={onOpenHelp}
          className="p-2 sm:p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition active:scale-95 cursor-pointer"
          title="راهنمای بازی"
          aria-label="راهنمای بازی"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        <button
          onClick={onToggleSound}
          className="p-2 sm:p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition active:scale-95 cursor-pointer"
          title={isMuted ? 'فعال کردن صدا' : 'قطع صدا'}
          aria-label={isMuted ? 'فعال کردن صدا' : 'قطع صدا'}
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
        </button>
      </div>

      {/* Center Brand / Logo */}
      <div className="flex flex-col items-center select-none">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-extrabold text-white text-lg shadow-lg shadow-emerald-900/30">
            و
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-l from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
            واژل
          </h1>
          {gameWon && <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />}
        </div>
        <span className="text-[10px] sm:text-xs text-slate-400 font-medium tracking-wide">
          Wordle Farsi • بازی حدس کلمات
        </span>
      </div>

      {/* Left icons (in RTL: End of header) */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={onOpenLeaderboard}
          className="p-2 sm:p-2.5 rounded-xl text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition active:scale-95 cursor-pointer relative"
          title="جدول رده‌بندی و امتیازات"
          aria-label="جدول رده‌بندی"
        >
          <Trophy className="w-5 h-5" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        </button>

        <button
          onClick={onOpenStats}
          className="p-2 sm:p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition active:scale-95 cursor-pointer"
          title="آمار عملکرد"
          aria-label="آمار عملکرد"
        >
          <BarChart2 className="w-5 h-5" />
        </button>

        <button
          onClick={onRestartGame}
          className="p-2 sm:p-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition active:scale-95 cursor-pointer"
          title="شروع بازی جدید"
          aria-label="شروع بازی جدید"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
