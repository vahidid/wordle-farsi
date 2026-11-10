'use client';

import React, { useEffect, useCallback } from 'react';
import { Delete, CornerDownLeft } from 'lucide-react';
import { TileStatus } from '@/lib/types';
import { sounds } from '@/lib/sound';

interface KeyboardProps {
  onChar: (char: string) => void;
  onDelete: () => void;
  onEnter: () => void;
  keyStatuses: Record<string, TileStatus>;
  disabled?: boolean;
}

const KEYBOARD_ROWS = [
  ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'چ'],
  ['ش', 'س', 'ی', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ک', 'گ'],
  ['ENTER', 'ظ', 'ط', 'ز', 'ر', 'ذ', 'د', 'پ', 'و', 'ژ', 'آ', 'BACKSPACE'],
];

// QWERTY to Persian key mapping for physical keyboards
const EN_TO_FA_MAP: Record<string, string> = {
  q: 'ض',
  w: 'ص',
  e: 'ث',
  r: 'ق',
  t: 'ف',
  y: 'غ',
  u: 'ع',
  i: 'ه',
  o: 'خ',
  p: 'ح',
  '[': 'ج',
  ']': 'چ',
  '{': 'ج',
  '}': 'چ',
  a: 'ش',
  s: 'س',
  d: 'ی',
  f: 'ب',
  g: 'ل',
  h: 'ا',
  H: 'آ',
  j: 'ت',
  k: 'ن',
  l: 'م',
  ';': 'ک',
  ':': 'ک',
  "'": 'گ',
  '"': 'گ',
  z: 'ظ',
  x: 'ط',
  c: 'ز',
  v: 'ر',
  b: 'ذ',
  n: 'د',
  m: 'پ',
  ',': 'و',
  '<': 'و',
  C: 'ژ',
  '\\': 'پ',
  '|': 'ژ',
};

export function Keyboard({
  onChar,
  onDelete,
  onEnter,
  keyStatuses,
  disabled = false,
}: KeyboardProps) {
  const handleKeyClick = useCallback(
    (key: string) => {
      if (disabled) return;

      // Haptic feedback for touch devices (TWA / mobile browsers)
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        try {
          navigator.vibrate(10);
        } catch {
          // ignore vibration errors
        }
      }

      if (key === 'ENTER') {
        onEnter();
      } else if (key === 'BACKSPACE') {
        sounds.playKeyPop();
        onDelete();
      } else {
        sounds.playKeyPop();
        onChar(key);
      }
    },
    [disabled, onEnter, onDelete, onChar]
  );

  // Listen to physical keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      // Ignore if user is inside an input/textarea (like auth email input)
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        onEnter();
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        sounds.playKeyPop();
        onDelete();
      } else {
        // Direct Persian letter or mapped QWERTY
        let char = e.key;
        if (EN_TO_FA_MAP[char]) {
          char = EN_TO_FA_MAP[char];
        } else if (EN_TO_FA_MAP[char.toLowerCase()]) {
          char = EN_TO_FA_MAP[char.toLowerCase()];
        }

        // Persian Unicode range check
        if (/^[\u0600-\u06FF]$/.test(char)) {
          e.preventDefault();
          sounds.playKeyPop();
          onChar(char);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, onEnter, onDelete, onChar]);

  return (
    <div className="w-full max-w-2xl mx-auto px-1 sm:px-3 pb-3 sm:pb-4 select-none" dir="ltr">
      <div className="flex flex-col gap-1.5 sm:gap-2">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1 sm:gap-1.5 w-full">
            {row.map((key) => {
              if (key === 'ENTER') {
                return (
                  <button
                    key="enter"
                    type="button"
                    onClick={() => handleKeyClick('ENTER')}
                    disabled={disabled}
                    className="flex-[1.35] sm:flex-[1.5] max-w-[76px] h-[50px] sm:h-[56px] rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1 shadow-md shadow-emerald-950/40 active:scale-95 transition-all cursor-pointer touch-manipulation select-none"
                    aria-label="ثبت کلمه"
                  >
                    <span className="leading-none pt-0.5 font-sans">ثبت</span>
                    <CornerDownLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  </button>
                );
              }

              if (key === 'BACKSPACE') {
                return (
                  <button
                    key="backspace"
                    type="button"
                    onClick={() => handleKeyClick('BACKSPACE')}
                    disabled={disabled}
                    className="flex-[1.2] sm:flex-[1.3] max-w-[62px] h-[50px] sm:h-[56px] rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 border border-slate-700/80 flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer touch-manipulation select-none"
                    aria-label="پاک کردن"
                  >
                    <Delete className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                  </button>
                );
              }

              const status = keyStatuses[key];
              let keyStyle =
                'bg-slate-800 hover:bg-slate-700/90 text-slate-100 border border-slate-700/80 active:bg-slate-600';

              if (status === 'correct') {
                keyStyle = 'bg-emerald-600 border-emerald-500 text-white font-bold shadow-sm shadow-emerald-900/50';
              } else if (status === 'present') {
                keyStyle = 'bg-amber-500 border-amber-400 text-slate-950 font-bold shadow-sm shadow-amber-950/40';
              } else if (status === 'absent') {
                keyStyle = 'bg-slate-900/80 border-slate-800/80 text-slate-500 opacity-60';
              }

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleKeyClick(key)}
                  disabled={disabled}
                  className={`flex-1 h-[50px] sm:h-[56px] rounded-lg text-lg sm:text-xl font-bold font-sans flex items-center justify-center transition-all duration-75 active:scale-95 cursor-pointer touch-manipulation select-none ${keyStyle}`}
                >
                  <span className="leading-none pt-0.5">{key}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
