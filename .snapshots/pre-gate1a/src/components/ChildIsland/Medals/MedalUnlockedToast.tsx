import React from 'react';
import { Sparkles, X, ArrowRight } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { sounds } from '../../../utils/sound';

interface Props {
  onOpenMedals: () => void;
}

export const MedalUnlockedToast: React.FC<Props> = ({ onOpenMedals }) => {
  const { recentUnlockedMedal, dismissUnlockedMedal } = useApp();

  if (!recentUnlockedMedal) return null;

  const isSun = recentUnlockedMedal.type === 'sun';

  return (
    <div className="fixed bottom-6 right-6 z-60 max-w-sm w-full animate-in slide-in-from-bottom-5 duration-300">
      <div className={`p-4 rounded-3xl shadow-2xl border-2 flex items-start gap-3 relative ${
        isSun
          ? 'bg-amber-50/95 border-amber-400 text-amber-950 shadow-amber-200/50'
          : 'bg-blue-50/95 border-blue-400 text-blue-950 shadow-blue-200/50'
      }`}>
        <button
          onClick={dismissUnlockedMedal}
          className="absolute top-3 right-3 text-stone-400 hover:text-stone-600 p-1 rounded-full transition-colors"
          aria-label="关闭提示"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-3xl shrink-0 animate-bounce">
          {recentUnlockedMedal.emoji}
        </div>

        <div className="flex-1 pr-4">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-white/80 border border-stone-200">
              {isSun ? '☀️ 点亮阳光勋章' : '💧 点亮雨滴勋章'}
            </span>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </div>

          <h4 className="text-sm font-black text-stone-900">
            {recentUnlockedMedal.title}
          </h4>

          <p className="text-xs text-stone-600 mt-1 leading-snug">
            {recentUnlockedMedal.description}
          </p>

          <button
            onClick={() => {
              sounds.playClick();
              dismissUnlockedMedal();
              onOpenMedals();
            }}
            className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-900 underline underline-offset-2"
          >
            <span>打开晴雨勋章馆查看</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
