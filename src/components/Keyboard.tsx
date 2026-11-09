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
  "'": 'گ',
  z: 'ظ',
  x: 'ط',
  c: 'ز',
  v: 'ر',
  b: 'ذ',
  n: 'د',
  m: 'پ',
  ',': 'و',
  C: 'ژ',
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
    <div className="w-full max-w-2xl mx-auto px-1.5 sm:px-4 pb-4 select-none" dir="rtl">
      <div className="flex flex-col gap-1.5 sm:gap-2">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1 sm:gap-1.5">
            {row.map((key) => {
              if (key === 'ENTER') {
                return (
                  <button
                    key="enter"
                    type="button"
                    onClick={() => handleKeyClick('ENTER')}
                    disabled={disabled}
                    className="flex-1 max-w-[68px] sm:max-w-[78px] h-12 sm:h-14 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1 shadow-md shadow-emerald-950/40 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>ثبت</span>
                    <CornerDownLeft className="w-3.5 h-3.5" />
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
                    className="flex-1 max-w-[54px] sm:max-w-[64px] h-12 sm:h-14 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer"
                    aria-label="پاک کردن"
                  >
                    <Delete className="w-4 h-4 sm:w-5 sm:h-5" />
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
                  className={`flex-1 min-w-[24px] sm:min-w-[34px] max-w-[44px] h-12 sm:h-14 rounded-lg text-base sm:text-lg font-semibold flex items-center justify-center transition-all duration-100 active:scale-95 cursor-pointer ${keyStyle}`}
                >
                  <span className="pt-0.5">{key}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
