'use client';

import React from 'react';
import { X, HelpCircle, CheckCircle, AlertCircle, HelpCircle as QuestionIcon } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HowToPlayModal({ isOpen, onClose }: HowToPlayModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold">راهنمای بازی واژه‌چین</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4 text-sm leading-relaxed text-slate-300">
          <p>
            کلمه ۵ حرفی مخفی را در <strong className="text-white">۶ حدس</strong> پیدا کنید!
          </p>
          <p>
            بعد از هر حدس، رنگ خانه‌ها تغییر می‌کند تا نشان دهد چقدر به کلمه هدف نزدیک شده‌اید:
          </p>

          {/* Example 1: Green */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 justify-center">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-lg border border-emerald-500">
                ب
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-lg border border-slate-700">
                ا
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-lg border border-slate-700">
                ر
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-lg border border-slate-700">
                ا
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-lg border border-slate-700">
                ن
              </div>
            </div>
            <p className="text-xs text-slate-400 text-center">
              حرف <strong className="text-emerald-400">«ب»</strong> در کلمه وجود دارد و در جای کاملاً درستی قرار گرفته است.
            </p>
          </div>

          {/* Example 2: Yellow */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 justify-center">
              <div className="w-10 h-10 rounded-lg bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-lg border border-slate-700">
                س
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-lg border border-amber-400">
                ت
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-lg border border-slate-700">
                ا
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-lg border border-slate-700">
                ر
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-lg border border-slate-700">
                ه
              </div>
            </div>
            <p className="text-xs text-slate-400 text-center">
              حرف <strong className="text-amber-400">«ت»</strong> در کلمه هست، اما در جایگاه دیگری قرار دارد.
            </p>
          </div>

          {/* Example 3: Gray */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 justify-center">
              <div className="w-10 h-10 rounded-lg bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-lg border border-slate-700">
                د
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-lg border border-slate-700">
                ی
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-700 text-slate-400 font-bold flex items-center justify-center text-lg border border-slate-600 opacity-60">
                و
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-lg border border-slate-700">
                ا
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-lg border border-slate-700">
                ر
              </div>
            </div>
            <p className="text-xs text-slate-400 text-center">
              حرف <strong className="text-slate-400">«و»</strong> اصلاً در هیچ کجای کلمه وجود ندارد.
            </p>
          </div>

          {/* Tips */}
          <div className="text-xs text-slate-400 bg-slate-800/40 p-3 rounded-xl border border-slate-700/50 flex flex-col gap-1.5">
            <span className="font-semibold text-slate-200">💡 نکته‌های مفید:</span>
            <span>• می‌توانید با کیبورد فیزیکی (فارسی یا انگلیسی) مستقیم تایپ کنید.</span>
            <span>• کلمات باید با معنی و ۵ حرفی باشند.</span>
            <span>• با ثبت ایمیل و کد OTP می‌توانید رکوردتان را در رده‌بندی ثبت کنید!</span>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-sm transition active:scale-98 shadow-lg shadow-emerald-950/40 cursor-pointer"
        >
          متوجه شدم، بزن بریم!
        </button>
      </div>
    </div>
  );
}
