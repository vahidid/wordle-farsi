'use client';

import React from 'react';
import { TileStatus } from '@/lib/types';

interface BoardProps {
  guesses: string[];
  currentGuess: string;
  evaluations: TileStatus[][];
  maxAttempts?: number;
  wordLength?: number;
  isShaking: boolean;
  gameWon: boolean;
}

export function Board({
  guesses,
  currentGuess,
  evaluations,
  maxAttempts = 6,
  wordLength = 5,
  isShaking,
  gameWon,
}: BoardProps) {
  const currentAttempt = guesses.length;

  return (
    <div className="flex flex-col items-center justify-center gap-2 p-2 sm:p-4 my-auto select-none" dir="rtl">
      {Array.from({ length: maxAttempts }).map((_, rowIndex) => {
        const isCurrentRow = rowIndex === currentAttempt;
        const isPastRow = rowIndex < currentAttempt;
        const isWinningRow = gameWon && rowIndex === currentAttempt - 1;

        // Letters for this row
        let rowLetters: string[] = Array(wordLength).fill('');
        let rowStatuses: TileStatus[] = Array(wordLength).fill('empty');

        if (isPastRow) {
          rowLetters = [...guesses[rowIndex]];
          rowStatuses = evaluations[rowIndex] || Array(wordLength).fill('absent');
        } else if (isCurrentRow) {
          const currentChars = [...currentGuess];
          rowLetters = Array.from({ length: wordLength }, (_, i) => currentChars[i] || '');
          rowStatuses = rowLetters.map((char) => (char ? 'tbd' : 'empty'));
        }

        return (
          <div
            key={rowIndex}
            className={`flex items-center gap-1.5 sm:gap-2.5 ${
              isCurrentRow && isShaking ? 'animate-shake' : ''
            }`}
          >
            {Array.from({ length: wordLength }).map((_, colIndex) => {
              const letter = rowLetters[colIndex] || '';
              const status = rowStatuses[colIndex];

              // Styling according to status
              let tileStyle = 'border-2 border-slate-800 bg-slate-900/40 text-slate-100';
              let animClass = '';
              const delayStyle = isPastRow
                ? { animationDelay: `${colIndex * 140}ms` }
                : undefined;

              if (status === 'tbd') {
                tileStyle = 'border-2 border-slate-400 bg-slate-800/80 text-white font-bold scale-105 shadow-md shadow-slate-950/40';
                animClass = 'animate-pop';
              } else if (status === 'correct') {
                tileStyle = 'border-2 border-emerald-500 bg-emerald-600 text-white font-extrabold shadow-md shadow-emerald-900/40';
                animClass = isWinningRow ? 'animate-win-tile' : 'animate-flip';
              } else if (status === 'present') {
                tileStyle = 'border-2 border-amber-400 bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-950/40';
                animClass = 'animate-flip';
              } else if (status === 'absent') {
                tileStyle = 'border-2 border-slate-700 bg-slate-800 text-slate-400 font-bold';
                animClass = 'animate-flip';
              }

              return (
                <div
                  key={colIndex}
                  style={delayStyle}
                  className={`w-12 h-12 sm:w-15 sm:h-15 md:w-16 md:h-16 rounded-xl flex items-center justify-center text-xl sm:text-2xl md:text-3xl transition-all duration-150 ${tileStyle} ${animClass}`}
                >
                  <span className="leading-none pt-0.5">{letter}</span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
