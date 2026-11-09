'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Header } from '@/components/Header';
import { Board } from '@/components/Board';
import { Keyboard } from '@/components/Keyboard';
import { Toast } from '@/components/Toast';
import { HowToPlayModal } from '@/components/HowToPlayModal';
import { StatsModal } from '@/components/StatsModal';
import { LeaderboardModal } from '@/components/LeaderboardModal';
import { ShareModal } from '@/components/ShareModal';
import { getRandomWord, isValidWord, normalizePersian } from '@/lib/words';
import {
  evaluateGuess,
  calculateKeyStatuses,
  loadLocalStats,
  updateStatsAfterGame,
  INITIAL_STATS,
} from '@/lib/gameLogic';
import { sounds } from '@/lib/sound';
import { getCurrentUser } from '@/lib/supabase';
import { GameStatus, TileStatus, GameStats } from '@/lib/types';

export default function WordleFarsiPage() {
  // Game State
  const [targetWord, setTargetWord] = useState<string>('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [evaluations, setEvaluations] = useState<TileStatus[][]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [gameStatus, setGameStatus] = useState<GameStatus>('IN_PROGRESS');
  const [isShaking, setIsShaking] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'error' | 'success' } | null>(null);

  // Sound & Stats
  const [isMuted, setIsMuted] = useState(false);
  const [stats, setStats] = useState<GameStats>(INITIAL_STATS);

  // Modals
  const [showHelp, setShowHelp] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showShare, setShowShare] = useState(false);

  // Timing
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);

  // Auth user state for sharing
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);

  // Initialize Game on Mount
  useEffect(() => {
    initNewGame();
    setStats(loadLocalStats());
    setIsMuted(sounds.muted);

    // Check if first-time user: show Help modal
    const hasSeenHelp = localStorage.getItem('wordle_farsi_has_seen_help');
    if (!hasSeenHelp) {
      setShowHelp(true);
      localStorage.setItem('wordle_farsi_has_seen_help', 'true');
    }

    getCurrentUser().then(setUser);
  }, []);

  const showToast = useCallback((message: string, type: 'info' | 'error' | 'success' = 'info', duration = 2200) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, duration);
  }, []);

  // Start new round
  const initNewGame = useCallback(() => {
    const word = getRandomWord();
    setTargetWord(word);
    setGuesses([]);
    setEvaluations([]);
    setCurrentGuess('');
    setGameStatus('IN_PROGRESS');
    setIsShaking(false);
    setStartTime(null);
    setEndTime(null);
  }, []);

  // Keyboard status
  const keyStatuses = useMemo(() => {
    if (!targetWord) return {};
    return calculateKeyStatuses(guesses, targetWord);
  }, [guesses, targetWord]);

  // Handle typing letter
  const handleChar = useCallback(
    (char: string) => {
      if (gameStatus !== 'IN_PROGRESS') return;
      if (currentGuess.length >= 5) return;

      if (!startTime) {
        setStartTime(Date.now());
      }
      setCurrentGuess((prev) => prev + char);
    },
    [gameStatus, currentGuess.length, startTime]
  );

  // Handle delete / backspace
  const handleDelete = useCallback(() => {
    if (gameStatus !== 'IN_PROGRESS') return;
    setCurrentGuess((prev) => prev.slice(0, -1));
  }, [gameStatus]);

  // Trigger shake animation
  const triggerShake = useCallback(() => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  }, []);

  // Handle Enter / Guess Submission
  const handleEnter = useCallback(() => {
    if (gameStatus !== 'IN_PROGRESS') return;

    // Check length
    if (currentGuess.length < 5) {
      sounds.playInvalidWord();
      triggerShake();
      showToast('واژه باید ۵ حرفی باشد!', 'error');
      return;
    }

    // Check validity in Persian dictionary
    const normalized = normalizePersian(currentGuess);
    if (!isValidWord(normalized) && normalized !== targetWord) {
      sounds.playInvalidWord();
      triggerShake();
      showToast('واژه در فرهنگ لغات پیدا نشد!', 'error');
      return;
    }

    // Evaluate guess
    const newEvaluation = evaluateGuess(normalized, targetWord);
    const newGuesses = [...guesses, normalized];
    const newEvaluations = [...evaluations, newEvaluation];

    setGuesses(newGuesses);
    setEvaluations(newEvaluations);
    setCurrentGuess('');

    // Play reveal sound
    for (let i = 0; i < 5; i++) {
      setTimeout(() => sounds.playRevealTile(i), i * 140);
    }

    const isWin = normalized === targetWord;
    const isLoss = !isWin && newGuesses.length >= 6;

    if (isWin) {
      const now = Date.now();
      setEndTime(now);
      setGameStatus('WON');

      // Win sound & Confetti!
      setTimeout(() => {
        sounds.playWin();
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#f59e0b', '#38bdf8', '#a855f7'],
        });
      }, 750);

      // Update statistics
      const updated = updateStatsAfterGame(stats, true, newGuesses.length);
      setStats(updated);

      showToast('آفرین! واژه رو حدس زدی 👏', 'success', 3000);

      // Open stats modal after animations finish
      setTimeout(() => {
        setShowStats(true);
      }, 1600);
    } else if (isLoss) {
      const now = Date.now();
      setEndTime(now);
      setGameStatus('LOST');

      const updated = updateStatsAfterGame(stats, false, 6);
      setStats(updated);

      showToast(`حیف شد! واژه صحیح: «${targetWord}»`, 'error', 4000);

      setTimeout(() => {
        setShowStats(true);
      }, 1600);
    }
  }, [
    gameStatus,
    currentGuess,
    targetWord,
    guesses,
    evaluations,
    stats,
    showToast,
    triggerShake,
  ]);

  // Toggle sound
  const handleToggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  // Time spent in seconds
  const timeSpentSeconds = useMemo(() => {
    if (!startTime) return 30;
    const end = endTime || Date.now();
    return Math.max(1, Math.round((end - startTime) / 1000));
  }, [startTime, endTime]);

  return (
    <main className="min-h-screen flex flex-col justify-between max-w-2xl mx-auto w-full relative">
      {/* Toast Notification */}
      <Toast message={toast?.message || null} type={toast?.type} />

      {/* Header */}
      <Header
        onOpenHelp={() => setShowHelp(true)}
        onOpenStats={() => setShowStats(true)}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
        onRestartGame={initNewGame}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        gameWon={gameStatus === 'WON'}
      />

      {/* Game Board */}
      <div className="flex-1 flex flex-col items-center justify-center py-2 sm:py-6">
        <Board
          guesses={guesses}
          currentGuess={currentGuess}
          evaluations={evaluations}
          maxAttempts={6}
          wordLength={5}
          isShaking={isShaking}
          gameWon={gameStatus === 'WON'}
        />
      </div>

      {/* Virtual Keyboard */}
      <Keyboard
        onChar={handleChar}
        onDelete={handleDelete}
        onEnter={handleEnter}
        keyStatuses={keyStatuses}
        disabled={gameStatus !== 'IN_PROGRESS'}
      />

      {/* Modals */}
      <HowToPlayModal isOpen={showHelp} onClose={() => setShowHelp(false)} />

      <StatsModal
        isOpen={showStats}
        onClose={() => setShowStats(false)}
        stats={stats}
        gameStatus={gameStatus}
        targetWord={targetWord}
        guessesCount={guesses.length}
        onPlayAgain={initNewGame}
        onOpenShare={() => {
          setShowStats(false);
          setShowShare(true);
        }}
        onOpenLeaderboard={() => {
          setShowStats(false);
          setShowLeaderboard(true);
        }}
      />

      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        lastGameResult={
          gameStatus === 'WON'
            ? {
                won: true,
                guessesCount: guesses.length,
                word: targetWord,
                timeSpentSeconds,
              }
            : null
        }
        onScoreRecorded={() => {
          getCurrentUser().then(setUser);
        }}
      />

      <ShareModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        guesses={guesses}
        evaluations={evaluations}
        won={gameStatus === 'WON'}
        targetWord={targetWord}
        onOpenLeaderboard={() => {
          setShowShare(false);
          setShowLeaderboard(true);
        }}
        isLoggedIn={Boolean(user)}
        userEmail={user?.email}
      />
    </main>
  );
}
