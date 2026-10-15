import React from 'react';
import { Wind, Volume2 } from 'lucide-react';
import { sounds } from '../../utils/sound';
import { speechNarrator } from '../../utils/speech';
import { IslandUiIconSvg } from './CompanionIcons';
import { tokens } from '../../design-system/tokens';

interface Props {
  onOpenCalm: () => void;
  onOpenBreaker?: () => void;
}

/**
 * 永远可达的平静角与困难拆解卡片/入口 (Always Reachable Calm Corner & Breaker)
 * - 位于首页上部高优先级区域
 * - 手机端 (360px/390px/430px) 始终可见“去呼吸”与“去拆解”核心操作，绝不使用 hidden 隐藏
 * - 所有主操作按钮符合 >= 56px 触控区域标准
 */
export const AlwaysReachableCalmCard: React.FC<Props> = ({ onOpenCalm, onOpenBreaker }) => {
  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playClick();
    speechNarrator.speak('绿草呼吸平静角。跟着圆圈慢慢吸气和呼气，放松身体；如果遇到大困难，也可以去拆解台把它拆成三小步。');
  };

  return (
    <div
      className="bg-linear-to-r from-teal-100/95 via-emerald-50/95 to-teal-100/95 p-2 sm:p-5 rounded-2xl sm:rounded-3xl border-2 border-teal-300/90 shadow-sm sm:shadow-md transition-all duration-200 motion-reduce:transition-none flex flex-col md:flex-row md:items-center justify-between gap-2 sm:gap-3.5"
      role="region"
      aria-label="绿草呼吸平静角与大困难拆解常驻入口"
    >
      <div className="flex items-center gap-2 sm:gap-3.5 min-w-0 flex-1">
        <div
          onClick={() => {
            sounds.playClick();
            onOpenCalm();
          }}
          className="w-12 h-12 sm:w-16 sm:h-16 min-w-[48px] sm:min-w-[56px] min-h-[48px] sm:min-h-[56px] rounded-xl sm:rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-inner shrink-0 cursor-pointer"
          aria-hidden="true"
        >
          <Wind className="w-6 h-6 sm:w-9 sm:h-9" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <h3 className="text-base sm:text-2xl font-black text-teal-950 whitespace-nowrap">
              绿草呼吸平静角
            </h3>
            <span className="text-[11px] sm:text-xs font-bold text-teal-900 bg-teal-200/90 px-2 sm:px-2.5 py-0.5 rounded-full shrink-0">
              呼吸引导 · 随时可达
            </span>
          </div>
          <p className="hidden sm:block text-xs sm:text-base text-teal-900 mt-0.5 sm:mt-1 leading-snug font-medium">
            跟随圆圈慢慢吸气与呼气，或把大困难拆成容易迈出的小步子
          </p>
        </div>

        <button
          type="button"
          onClick={handleSpeak}
          className="w-12 h-12 sm:w-14 sm:h-14 min-w-[48px] sm:min-w-[56px] min-h-[48px] sm:min-h-[56px] rounded-xl sm:rounded-2xl bg-white/90 hover:bg-white text-teal-900 flex items-center justify-center transition-colors cursor-pointer shadow-2xs border border-teal-200 shrink-0 focus-visible:ring-4 focus-visible:ring-amber-500 focus-visible:outline-none"
          title="听一听平静角介绍"
          aria-label="听一听平静角介绍"
        >
          <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 text-teal-900" />
        </button>
      </div>

      {/* 手机端与全视口始终可见的核心操作按钮组 (>=56px) */}
      <div className="grid grid-cols-2 sm:flex items-center gap-2 sm:gap-2.5 w-full md:w-auto shrink-0">
        {onOpenBreaker && (
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onOpenBreaker();
            }}
            className="min-h-[56px] px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm sm:text-base font-black rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap focus-visible:ring-4 focus-visible:ring-amber-500 focus-visible:outline-none"
            aria-label="打开大困难拆解台：把大问题拆成三小步"
          >
            <IslandUiIconSvg name="detective_hammer" className="w-5 h-5 shrink-0" />
            <span>去拆解</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            onOpenCalm();
          }}
          className="min-h-[56px] px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm sm:text-base font-black rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap focus-visible:ring-4 focus-visible:ring-teal-500 focus-visible:outline-none"
          aria-label="进入绿草平静角呼吸练习：跟随圆圈节律呼吸，调节情绪与放松身体"
        >
          <IslandUiIconSvg name="calm_leaf" className="w-5 h-5 shrink-0" />
          <span>去呼吸</span>
        </button>
      </div>
    </div>
  );
};
