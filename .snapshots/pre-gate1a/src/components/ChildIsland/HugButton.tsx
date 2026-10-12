import React, { useState } from 'react';
import { Heart, Sparkles, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/sound';

export const HugButton: React.FC = () => {
  const { requestHug, tonightAt } = useApp();
  const [isPressed, setIsPressed] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleClick = () => {
    sounds.playWarmHug();
    setIsPressed(true);
    requestHug(tonightAt === '妈妈家' ? '妈妈' : '爸爸');
    setShowConfirmation(true);

    setTimeout(() => {
      setIsPressed(false);
    }, 400);

    setTimeout(() => {
      setShowConfirmation(false);
    }, 4500);
  };

  return (
    <div className="relative inline-block w-full sm:w-auto">
      <button
        onClick={handleClick}
        className={`group relative flex items-center justify-center sm:justify-start gap-3.5 px-6 py-4 min-h-[64px] w-full sm:w-auto rounded-3xl shadow-lg transition-all duration-200 motion-reduce:transition-none transform active:scale-95 motion-reduce:active:scale-100 cursor-pointer ${
          showConfirmation
            ? 'bg-rose-500 text-white shadow-rose-200/60'
            : 'bg-linear-to-r from-rose-400 via-pink-400 to-rose-400 text-white hover:shadow-rose-200/80 hover:brightness-105'
        }`}
        aria-label="抱抱键 - 点击告诉身边的家人现在需要一个温暖拥抱"
      >
        {/* Soft breathing pulse effect */}
        <span className="absolute -inset-1 rounded-3xl bg-rose-400/25 animate-pulse motion-reduce:animate-none opacity-75 group-hover:opacity-100 pointer-events-none" />

        <div className="relative flex items-center justify-center w-10 h-10 min-w-[40px] rounded-2xl bg-white/20 backdrop-blur-xs shrink-0">
          {showConfirmation ? (
            <Check className="w-6 h-6 text-white" />
          ) : (
            <Heart className="w-6 h-6 text-white fill-white/90 group-hover:scale-110 transition-transform" />
          )}
        </div>

        <div className="relative text-left">
          <div className="text-lg sm:text-xl font-black tracking-wide flex items-center gap-1.5">
            {showConfirmation ? '小提醒已送出' : '抱抱键'}
            <Sparkles className="w-4 h-4 text-amber-200" />
          </div>
          <div className="text-base text-rose-100 font-medium">
            {showConfirmation ? '已把需要抱抱的提醒放到大人端' : '点一下，叫身边的家人抱抱你'}
          </div>
        </div>
      </button>

      {/* Gentle confirmation bubble (constrained max-w to prevent mobile overflow) */}
      {showConfirmation && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-[calc(100vw-32px)] max-w-xs sm:max-w-sm bg-white/95 backdrop-blur-md p-4 rounded-3xl shadow-xl border-2 border-rose-200 text-stone-800 text-base text-center animate-in fade-in slide-in-from-bottom-2 duration-300 z-30 pointer-events-none">
          <p className="font-extrabold text-rose-600 mb-1 flex items-center justify-center gap-1.5">
            <Heart className="w-4 h-4 fill-rose-600" />
            <span>轻声提醒已送达</span>
          </p>
          <p className="text-stone-600 leading-relaxed font-medium">
            大人那边已收到你的抱抱心愿。无论什么时候，你都值得被好好拥抱！
          </p>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-r-2 border-b-2 border-rose-200" />
        </div>
      )}
    </div>
  );
};

