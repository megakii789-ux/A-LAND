import React from 'react';
import { Volume2, SlidersHorizontal } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ANIMAL_COMPANIONS, INTEREST_ACTIVITIES } from '../../domain/personalization';
import { speechNarrator } from '../../utils/speech';
import { sounds } from '../../utils/sound';
import { CompanionAvatarSvg, InterestBadgeSvg } from './CompanionIcons';
import { tokens } from '../../design-system/tokens';

interface Props {
  onSpeakGreeting?: () => void;
  onOpenSettings?: () => void;
}

/**
 * 伴伴问候与个性化伙伴横幅 (AG-04B / Phase 1A Task A & Decision 3):
 * - 展示儿童自选的中性动物伙伴原创 SVG 形象 (果果/贝贝/天天/奇奇)
 * - 360px/390px/430px 下标题不竖排，关键问候文本完整可读不截断为几个字
 * - 核心操作按钮符合 >= 56x56px 触控标准
 */
export const CompanionBanner: React.FC<Props> = ({ onOpenSettings }) => {
  const { personalization } = useApp();
  const companion = ANIMAL_COMPANIONS[personalization.companionId] || ANIMAL_COMPANIONS.guoguo_squirrel;
  const interest = INTEREST_ACTIVITIES[personalization.primaryInterest] || INTEREST_ACTIVITIES.drawing;
  const greetingText = `你好呀！我是${companion.name}。${companion.greetingText}`;

  const handleSpeak = () => {
    sounds.playClick();
    speechNarrator.speak(greetingText);
  };

  return (
    <div
      className={`p-3.5 sm:p-5 rounded-3xl border-2 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/95 backdrop-blur-md ${companion.themeColorBorder}`}
    >
      <div className="flex items-start sm:items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
        <button
          type="button"
          onClick={handleSpeak}
          className={`relative w-16 h-16 sm:w-18 sm:h-18 min-w-[64px] min-h-[64px] rounded-2xl flex items-center justify-center shadow-xs border-2 cursor-pointer hover:scale-105 active:scale-95 motion-reduce:hover:scale-100 transition-transform shrink-0 p-1.5 ${companion.themeColorBg} ${companion.themeColorBorder}`}
          title={`点我听${companion.name}说话`}
          aria-label={`${companion.name}伙伴：点击朗读问候语`}
        >
          <CompanionAvatarSvg companionId={companion.id} className="w-12 h-12 sm:w-14 sm:h-14" />
          <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-sky-600 rounded-full flex items-center justify-center text-white text-xs shadow-xs border-2 border-white">
            <Volume2 className="w-3.5 h-3.5" />
          </span>
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-black text-stone-800 tracking-wide whitespace-nowrap">
              {companion.name}在身边
            </h2>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0 ${companion.themeColorBg} ${companion.themeColorText}`}>
              {companion.animal} · 一直陪你
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200 shrink-0">
              <InterestBadgeSvg interestId={interest.id} className="w-3.5 h-3.5" />
              <span>{interest.label}</span>
            </span>
          </div>
          <p className="text-sm sm:text-base text-stone-700 mt-1 leading-relaxed font-medium">
            {greetingText}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
        <button
          type="button"
          onClick={handleSpeak}
          className={`${tokens.touchTarget.childMin} px-3.5 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 flex items-center justify-center gap-1.5 font-black text-xs sm:text-sm transition-colors cursor-pointer`}
          title={`听${companion.name}问候`}
          aria-label={`听${companion.name}问候`}
        >
          <Volume2 className="w-5 h-5 text-sky-700 shrink-0" />
          <span className="whitespace-nowrap">听问候</span>
        </button>

        {onOpenSettings && (
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onOpenSettings();
            }}
            className={`${tokens.touchTarget.childMin} px-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 flex items-center justify-center gap-1.5 font-black text-xs sm:text-sm transition-colors cursor-pointer border border-amber-200`}
            title="小岛偏好设置"
            aria-label="打开小岛偏好设置"
          >
            <SlidersHorizontal className="w-5 h-5 text-amber-700 shrink-0" />
            <span className="whitespace-nowrap">换伙伴</span>
          </button>
        )}
      </div>
    </div>
  );
};
