'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Share2, Download, Trophy } from 'lucide-react';
import { TileStatus } from '@/lib/types';

function XLogo({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramLogo({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  guesses: string[];
  evaluations: TileStatus[][];
  won: boolean;
  targetWord: string;
  onOpenLeaderboard: () => void;
  isLoggedIn: boolean;
  userEmail?: string;
}

export function ShareModal({
  isOpen,
  onClose,
  guesses,
  evaluations,
  won,
  onOpenLeaderboard,
  isLoggedIn,
  userEmail,
}: ShareModalProps) {
  const [copiedText, setCopiedText] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);

  if (!isOpen) return null;

  // Generate classic Wordle emojis
  const emojiRows = evaluations.map((row) =>
    row
      .map((status) => {
        if (status === 'correct') return '🟩';
        if (status === 'present') return '🟨';
        return '⬛';
      })
      .join('')
  );

  const attemptsText = won ? `${guesses.length}/6` : 'X/6';
  const shareText = `واژه‌چین (Wordle فارسی) ${attemptsText} 🎯\n\n${emojiRows.join(
    '\n'
  )}\n\nهمین حالا حدس بزن 👇\n${typeof window !== 'undefined' ? window.location.origin : 'https://wordle-farsi.vercel.app'}`;

  // 1. Copy text to clipboard
  const handleCopyText = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        setCopiedText(true);
        setTimeout(() => setCopiedText(false), 2500);
      }
    } catch (err) {
      console.warn('Clipboard copy error', err);
    }
  };

  // 2. Share to X (Twitter)
  const handleShareTwitter = () => {
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}`;
    window.open(tweetUrl, '_blank', 'noopener,noreferrer');
  };

  // 3. Web Share API (native share on mobile: Instagram, Telegram, etc.)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'واژه‌چین | Wordle فارسی',
          text: shareText,
        });
      } catch {
        // Share dismissed
      }
    } else {
      handleCopyText();
    }
  };

  // 4. Generate Instagram Story Image on Canvas
  const handleGenerateStoryImage = () => {
    setGeneratingImage(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 1920);
      bgGrad.addColorStop(0, '#090d16');
      bgGrad.addColorStop(0.5, '#0f172a');
      bgGrad.addColorStop(1, '#090d16');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1920);

      // Card Container
      ctx.fillStyle = '#1e293b';
      ctx.roundRect(140, 260, 800, 1380, 48);
      ctx.fill();

      // Card Border
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Brand Logo & Title
      ctx.fillStyle = '#10b981';
      ctx.roundRect(470, 360, 140, 140, 32);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 84px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('و', 540, 465);

      ctx.font = 'bold 72px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('واژه‌چین | Wordle فارسی', 540, 580);

      ctx.font = '40px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`نتیجه بازی: ${attemptsText}`, 540, 650);

      // Draw Grid
      const startY = 740;
      const tileSize = 110;
      const tileGap = 20;
      const gridWidth = 5 * tileSize + 4 * tileGap;
      const startX = (1080 - gridWidth) / 2;

      evaluations.forEach((row, rIdx) => {
        row.forEach((status, cIdx) => {
          const x = startX + cIdx * (tileSize + tileGap);
          const y = startY + rIdx * (tileSize + tileGap);

          // Tile background
          if (status === 'correct') {
            ctx.fillStyle = '#16a34a';
          } else if (status === 'present') {
            ctx.fillStyle = '#eab308';
          } else {
            ctx.fillStyle = '#334155';
          }

          ctx.roundRect(x, y, tileSize, tileSize, 20);
          ctx.fill();
        });
      });

      // Footer badge
      ctx.font = 'bold 38px sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('wordle-farsi.vercel.app', 540, 1540);

      // Download
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `vajehchin-wordle-result-${Date.now()}.png`;
      a.click();
    } catch (err) {
      console.warn('Canvas story generation error', err);
    } finally {
      setGeneratingImage(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold">اشتراک‌گذاری حدس</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Board Emoji Preview */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 select-all font-mono text-xl tracking-widest text-center shadow-inner">
          <div className="text-xs text-slate-400 mb-1 font-sans">
            واژه‌چین (Wordle فارسی) {attemptsText}
          </div>
          {emojiRows.map((row, i) => (
            <div key={i}>{row}</div>
          ))}
        </div>

        {/* Leaderboard CTA if not saved */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-900/50 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="flex flex-col">
              <span className="font-bold text-amber-200">
                {isLoggedIn ? 'ثبت شده با ایمیل شما' : 'می‌خواهی در جدول رده‌بندی ثبت بشه؟'}
              </span>
              <span className="text-slate-400">
                {isLoggedIn
                  ? `وارد شده با: ${userEmail}`
                  : 'کافیه ایمیلت رو با کد OTP تایید کنی.'}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              onOpenLeaderboard();
            }}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shrink-0 transition"
          >
            {isLoggedIn ? 'جدول امتیازات' : 'تایید ایمیل'}
          </button>
        </div>

        {/* Share Buttons */}
        <div className="flex flex-col gap-2.5">
          {/* Copy Text */}
          <button
            onClick={handleCopyText}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center gap-2 border border-slate-700 transition active:scale-98 cursor-pointer"
          >
            {copiedText ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">متن نتیجه کپی شد!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-300" />
                <span>کپی متن و اموجی‌ها برای استوری یا چت</span>
              </>
            )}
          </button>

          {/* Share to X (Twitter) */}
          <button
            onClick={handleShareTwitter}
            className="w-full py-3 px-4 rounded-xl bg-slate-950 hover:bg-black text-white font-bold text-sm flex items-center justify-center gap-2.5 border border-slate-800 transition active:scale-98 cursor-pointer shadow-md"
          >
            <XLogo className="w-4 h-4 text-white" />
            <span>اشتراک در شبکه اجتماعی X</span>
          </button>

          {/* Instagram Story Image Download */}
          <button
            onClick={handleGenerateStoryImage}
            disabled={generatingImage}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 hover:opacity-95 text-white font-bold text-sm flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer shadow-lg shadow-pink-950/30"
          >
            <InstagramLogo className="w-4 h-4" />
            <span>
              {generatingImage
                ? 'در حال ساخت تصویر استوری...'
                : 'دانلود کارت عکس برای استوری اینستاگرام'}
            </span>
            <Download className="w-3.5 h-3.5 opacity-80" />
          </button>

          {/* Native Web Share */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleNativeShare}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 font-medium text-xs flex items-center justify-center gap-2 border border-slate-700/60 transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>اشتراک از طریق تلگرام، واتساپ یا سایر برنامه‌ها</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
