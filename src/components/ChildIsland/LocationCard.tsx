import React from 'react';
import { Volume2 } from 'lucide-react';
import { speechNarrator } from '../../utils/speech';
import { sounds } from '../../utils/sound';
import { LocationBadgeIllustration } from './StoryGrove/StoryIllustrations';
import { Interactive3DCard } from '../common/Interactive3DCard';

export interface LocationCardProps {
  id: string;
  title: string;
  shortCopy: string;
  icon: string;
  locationType?: 'weather' | 'story' | 'detective' | 'courage' | 'bridge' | 'starlight' | 'calm';
  accentBg: string;
  accentColor: string;
  borderColor: string;
  hoverBorderColor: string;
  onOpen: () => void;
  badge?: string;
}

/**
 * 孩子端地点卡片规范 (Phase D + 3D 触感交互升级):
 * - title 为主 (大标题，清晰易读)
 * - 3D 物理倾角与高光反射 (Interactive3DCard)
 * - 徽章与图标立体浮层 (translateZ parallax depth)
 * - narrator/audio affordance (喇叭图标点击即朗读)
 * - 不依赖阅读才能理解 (大矢量插画徽章、明确视觉风格)
 * - 最小触控区域与无障碍支持 (role="button", >=56px targets)
 * - 严格遵循 prefers-reduced-motion
 */
export const LocationCard: React.FC<LocationCardProps> = ({
  id,
  title,
  shortCopy,
  icon,
  locationType,
  accentBg,
  accentColor,
  borderColor,
  hoverBorderColor,
  onOpen,
  badge
}) => {
  const handleAudioClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playClick();
    speechNarrator.speak(`${title}。${shortCopy}`);
  };

  return (
    <Interactive3DCard
      maxTilt={9}
      perspective={1000}
      glareOpacity={0.22}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      className={`group relative p-4 sm:p-5 rounded-3xl bg-white/95 hover:bg-white border-2 ${borderColor} ${hoverBorderColor} shadow-md hover:shadow-2xl transition-all duration-200 motion-reduce:transition-none cursor-pointer flex flex-col justify-between min-h-[170px] sm:min-h-[190px] select-none`}
      aria-label={`进入${title}：${shortCopy}`}
    >
      <div className="flex flex-col justify-between h-full">
        <div>
          {/* Top: Icon + Audio Narrator Button + Optional child-friendly badge */}
          <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
            {/* 3D Floating Badge (translateZ: 30px) */}
            <div
              style={{ transform: 'translateZ(30px)' }}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${accentBg} ${accentColor} flex items-center justify-center p-1.5 shadow-md group-hover:scale-105 motion-reduce:group-hover:scale-100 transition-transform shrink-0`}
            >
              {locationType ? (
                <LocationBadgeIllustration type={locationType} className="w-full h-full" />
              ) : (
                <span className="text-3xl sm:text-4xl">{icon}</span>
              )}
            </div>

            <div
              style={{ transform: 'translateZ(24px)' }}
              className="flex items-center gap-1.5 shrink-0"
            >
              {badge && (
                <span className="text-xs font-bold text-stone-600 bg-stone-100/90 px-2 py-0.5 rounded-full">
                  {badge}
                </span>
              )}
              <button
                type="button"
                onClick={handleAudioClick}
                className="w-12 h-12 min-w-[48px] rounded-2xl bg-stone-100/90 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                title={`听一听${title}`}
                aria-label={`听一听${title}的介绍`}
              >
                <Volume2 className="w-5 h-5 text-stone-700" />
              </button>
            </div>
          </div>

          {/* Title为主 (translateZ: 18px) */}
          <h3
            style={{ transform: 'translateZ(18px)' }}
            className="text-xl sm:text-2xl font-black text-stone-800 tracking-tight group-hover:text-amber-900 transition-colors"
          >
            {title}
          </h3>

          {/* 一句非常短的儿童文案 (translateZ: 12px) */}
          <p
            style={{ transform: 'translateZ(12px)' }}
            className="text-base sm:text-lg text-stone-600 mt-1 leading-snug font-medium"
          >
            {shortCopy}
          </p>
        </div>

        {/* Visual bottom indicator for open (translateZ: 15px) */}
        <div
          style={{ transform: 'translateZ(15px)' }}
          className="mt-3 pt-2.5 border-t border-stone-100/80 flex items-center justify-between text-base font-bold text-stone-700"
        >
          <span className="text-sm sm:text-base font-extrabold text-stone-700">进去玩</span>
          <span className="text-lg group-hover:translate-x-1.5 motion-reduce:group-hover:translate-x-0 transition-transform">
            👉
          </span>
        </div>
      </div>
    </Interactive3DCard>
  );
};
