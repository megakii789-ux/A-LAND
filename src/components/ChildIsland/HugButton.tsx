import React, { useState } from 'react';
import { Heart, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/sound';
import { speechNarrator } from '../../utils/speech';

export const HugButton: React.FC = () => {
  const { requestHug } = useApp();
  const [showLocalPrompt, setShowLocalPrompt] = useState(false);

  const handleHugClick = () => {
    sounds.playWarmHug();
    requestHug('当前照顾者');
    setShowLocalPrompt(true);
    speechNarrator.speak(
      '这里不会向手机发送远程消息。请直接走到身边你信任的大人那里，或者把求助卡拿给身边的大人看。'
    );
    setTimeout(() => {
      setShowLocalPrompt(false);
    }, 3800);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleHugClick}
        className={`group relative flex items-center gap-3 px-6 py-4 rounded-3xl font-bold text-lg shadow-xl transition-all duration-300 cursor-pointer min-h-[64px] ${
          showLocalPrompt
            ? 'bg-emerald-600 text-white scale-105 ring-4 ring-emerald-200/80'
            : 'bg-linear-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white hover:scale-103 active:scale-95 ring-4 ring-rose-200/60'
        }`}
        aria-label="找身边的大人抱抱：这里不会发送远程通知，请直接找身边信任的大人"
      >
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-transform duration-300 ${
            showLocalPrompt
              ? 'bg-white/25 scale-110'
              : 'bg-white/20 group-hover:scale-110'
          }`}
        >
          {showLocalPrompt ? (
            <Users className="w-6 h-6 text-white" />
          ) : (
            <Heart className="w-6 h-6 fill-white text-white" />
          )}
        </div>
        <div className="text-left">
          <div className="text-base sm:text-lg font-extrabold leading-tight flex items-center gap-1.5">
            <span>{showLocalPrompt ? '请直接找身边的大人' : '找身边大人抱抱'}</span>
          </div>
          <div className="text-xs font-medium text-rose-50 opacity-95">
            {showLocalPrompt
              ? '本机不发远程通知 · 已打开当面求助卡'
              : '点一下，打开给身边大人看的求助卡'}
          </div>
        </div>
      </button>
    </div>
  );
};
