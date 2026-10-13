import React from 'react';
import { Wind, Volume2 } from 'lucide-react';
import { sounds } from '../../utils/sound';
import { speechNarrator } from '../../utils/speech';

interface Props {
  onOpenCalm: () => void;
}

/**
 * 永远可达的平静角卡片/入口 (Always Reachable Calm Corner)
 * - 位于首页上部或高优先级区域
 * - 明显的深呼吸/放松意图
 * - 带朗读语音，不依赖识字
 */
export const AlwaysReachableCalmCard: React.FC<Props> = ({ onOpenCalm }) => {
  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playClick();
    speechNarrator.speak('绿草呼吸平静角。跟着圆圈慢慢吸气和呼气，放松身体，平复心情。');
  };

  return (
    <div
      onClick={() => {
        sounds.playClick();
        onOpenCalm();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenCalm();
        }
      }}
      className="group bg-linear-to-r from-teal-100/95 via-emerald-50/95 to-teal-100/95 hover:from-teal-100 hover:to-emerald-100 p-4 sm:p-5 rounded-3xl border-2 border-teal-300/90 shadow-md hover:shadow-xl transition-all duration-200 motion-reduce:transition-none cursor-pointer flex items-center justify-between gap-3"
      aria-label="进入绿草平静角呼吸练习：跟随圆圈节律呼吸，调节情绪与放松身体"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-teal-600 text-white flex items-center justify-center text-3xl shadow-inner group-hover:scale-105 motion-reduce:group-hover:scale-100 transition-transform shrink-0">
          <Wind className="w-8 h-8 sm:w-9 sm:h-9" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-xl sm:text-2xl font-black text-teal-950">
              绿草呼吸平静角
            </h3>
            <span className="text-xs font-bold text-teal-800 bg-teal-200/90 px-2.5 py-0.5 rounded-full shrink-0">
              呼吸引导
            </span>
          </div>
          <p className="text-base sm:text-lg text-teal-900 mt-0.5 leading-snug font-medium truncate sm:whitespace-normal">
            跟随圆圈慢慢吸气与呼气，给心情留一个安静的角落
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={handleSpeak}
          className="w-14 h-14 min-w-[56px] min-h-[56px] rounded-2xl bg-white/80 hover:bg-white text-teal-850 flex items-center justify-center transition-colors cursor-pointer shadow-2xs border border-teal-200 focus-visible:ring-4 focus-visible:ring-amber-500 focus-visible:outline-none"
          title="听一听平静角介绍"
          aria-label="听一听平静角介绍"
        >
          <Volume2 className="w-6 h-6 text-teal-900" />
        </button>

        <span className="px-4 py-2.5 min-h-[56px] bg-teal-600 group-hover:bg-teal-700 text-white text-base font-black rounded-2xl shadow-xs transition-colors hidden sm:flex items-center gap-1.5">
          <span>去呼吸</span>
          <span className="text-lg">🌬️</span>
        </span>
      </div>
    </div>
  );
};
