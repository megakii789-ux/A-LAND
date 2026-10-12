import React from 'react';
import { Volume2 } from 'lucide-react';
import { speechNarrator } from '../../utils/speech';
import { sounds } from '../../utils/sound';

import { OwlCompanionIllustration } from './StoryGrove/StoryIllustrations';

interface Props {
  onSpeakGreeting?: () => void;
}

/**
 * 伴伴问候与平静角置顶横幅 (Phase D):
 * - 简单温暖的当前问候
 * - 伴伴大头像，点击发声朗读
 * - 不暴露设计者内部术语
 */
export const CompanionBanner: React.FC<Props> = () => {
  const greetingText = '你好呀！今天我们一起在小岛上探索新办法。';

  const handleSpeak = () => {
    sounds.playClick();
    speechNarrator.speak(greetingText);
  };

  return (
    <div className="bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-3xl border-2 border-amber-200/70 shadow-md flex items-center justify-between gap-3">
      <div className="flex items-center gap-3.5 min-w-0">
        <button
          type="button"
          onClick={handleSpeak}
          className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-amber-50 flex items-center justify-center shadow-xs border-2 border-amber-200 cursor-pointer hover:scale-105 active:scale-95 motion-reduce:hover:scale-100 transition-transform shrink-0 p-1"
          title="点我听伴伴说话"
          aria-label="伴伴猫头鹰伙伴：点击朗读问候语"
        >
          <OwlCompanionIllustration className="w-full h-full" />
          <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-sky-500 rounded-full flex items-center justify-center text-white text-xs shadow-xs border-2 border-white">
            <Volume2 className="w-3.5 h-3.5" />
          </span>
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-stone-800 tracking-wide">
              伴伴在身边
            </h2>
            <span className="text-xs text-amber-800 font-bold bg-amber-100/90 px-2.5 py-0.5 rounded-full shrink-0">
              一直陪你
            </span>
          </div>
          <p className="text-base sm:text-lg text-stone-600 mt-0.5 leading-snug truncate sm:whitespace-normal font-medium">
            {greetingText}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSpeak}
        className="w-12 h-12 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-700 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
        title="听伴伴问候"
        aria-label="听伴伴问候"
      >
        <Volume2 className="w-6 h-6" />
      </button>
    </div>
  );
};
