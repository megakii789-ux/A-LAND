import React from 'react';
import { Volume2, SlidersHorizontal } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ANIMAL_COMPANIONS } from '../../domain/personalization';
import { speechNarrator } from '../../utils/speech';
import { sounds } from '../../utils/sound';

interface Props {
  onSpeakGreeting?: () => void;
  onOpenSettings?: () => void;
}

/**
 * 伴伴问候与个性化伙伴横幅 (AG-04B):
 * - 展示儿童自选的中性动物伙伴 (果果/贝贝/天天/奇奇)
 * - 伴伴大头像与特色问候
 * - 快速进入受控偏好设置面板
 */
export const CompanionBanner: React.FC<Props> = ({ onOpenSettings }) => {
  const { personalization } = useApp();
  const companion = ANIMAL_COMPANIONS[personalization.companionId] || ANIMAL_COMPANIONS.guoguo_squirrel;
  const greetingText = `你好呀！我是${companion.name}。${companion.greetingText}`;

  const handleSpeak = () => {
    sounds.playClick();
    speechNarrator.speak(greetingText);
  };

  return (
    <div className={`p-4 sm:p-5 rounded-3xl border-2 shadow-md flex items-center justify-between gap-3 bg-white/95 backdrop-blur-md ${companion.themeColorBorder}`}>
      <div className="flex items-center gap-3.5 min-w-0">
        <button
          type="button"
          onClick={handleSpeak}
          className={`relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center shadow-xs border-2 cursor-pointer hover:scale-105 active:scale-95 motion-reduce:hover:scale-100 transition-transform shrink-0 p-1 ${companion.themeColorBg} ${companion.themeColorBorder}`}
          title={`点我听${companion.name}说话`}
          aria-label={`${companion.name}伙伴：点击朗读问候语`}
        >
          <span className="text-4xl sm:text-5xl select-none" aria-hidden="true">
            {companion.avatarEmoji}
          </span>
          <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-sky-500 rounded-full flex items-center justify-center text-white text-xs shadow-xs border-2 border-white">
            <Volume2 className="w-3.5 h-3.5" />
          </span>
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-stone-800 tracking-wide">
              {companion.name}在身边
            </h2>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0 ${companion.themeColorBg} ${companion.themeColorText}`}>
              {companion.animal} · 一直陪你
            </span>
          </div>
          <p className="text-base sm:text-lg text-stone-600 mt-0.5 leading-snug truncate sm:whitespace-normal font-medium">
            {greetingText}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={handleSpeak}
          className="w-12 h-12 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-700 flex items-center justify-center transition-colors cursor-pointer"
          title={`听${companion.name}问候`}
          aria-label={`听${companion.name}问候`}
        >
          <Volume2 className="w-6 h-6" />
        </button>

        {onOpenSettings && (
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onOpenSettings();
            }}
            className="w-12 h-12 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 flex items-center justify-center transition-colors cursor-pointer border border-amber-200"
            title="小岛偏好设置"
            aria-label="打开小岛偏好设置"
          >
            <SlidersHorizontal className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
};
