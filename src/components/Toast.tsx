'use client';

import React from 'react';

interface ToastProps {
  message: string | null;
  type?: 'info' | 'error' | 'success';
}

export function Toast({ message, type = 'info' }: ToastProps) {
  if (!message) return null;

  const bgStyles = {
    info: 'bg-slate-800/95 border-slate-700 text-slate-100',
    error: 'bg-rose-900/90 border-rose-700 text-white',
    success: 'bg-emerald-900/90 border-emerald-700 text-white',
  }[type];

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-200">
      <div
        className={`px-5 py-2.5 rounded-xl border text-sm font-medium shadow-xl backdrop-blur-md flex items-center gap-2 animate-pop ${bgStyles}`}
      >
        <span>{message}</span>
      </div>
    </div>
  );
}
