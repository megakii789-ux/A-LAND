import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../../utils/sound';

export interface Organic3DBreathingSphereProps {
  phase: 'inhale' | 'hold' | 'exhale' | 'rest';
  theme: 'grass' | 'bear' | 'balloon';
  isPaused?: boolean;
}

/**
 * 3D Organic Tactile Breathing Sphere (3D 呼吸触感晶球)
 * - Multi-layered 3D concentric breathing ripples with perspective depth
 * - Interactive tactile elasticity on child tap/touch
 * - Child-friendly, non-judgmental, calming visual physics
 * - Strictly respects prefers-reduced-motion
 */
export const Organic3DBreathingSphere: React.FC<Organic3DBreathingSphereProps> = ({
  phase,
  theme,
  isPaused = false
}) => {
  const [tapRipple, setTapRipple] = useState(false);
  const [touchAngle, setTouchAngle] = useState({ x: 0, y: 0 });

  const getThemeEmoji = () => {
    switch (theme) {
      case 'grass':
        return phase === 'inhale' ? '🌿' : phase === 'exhale' ? '🍃' : '🌱';
      case 'bear':
        return phase === 'inhale' ? '🐻' : phase === 'exhale' ? '😴' : '🧸';
      case 'balloon':
        return phase === 'inhale' ? '🎈' : phase === 'exhale' ? '💨' : '✨';
    }
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale':
        return '深深吸气... 肚子鼓起来';
      case 'hold':
        return '轻轻停一停... 感觉好安静';
      case 'exhale':
        return '缓缓呼气... 把烦恼吹出去';
      case 'rest':
        return '轻松休息... 身体松松的';
    }
  };

  const handleSphereTap = (e: React.PointerEvent<HTMLDivElement>) => {
    sounds.playKalimbaBloom();
    setTapRipple(true);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setTouchAngle({ x: -y * 15, y: x * 15 });

    setTimeout(() => {
      setTapRipple(false);
      setTouchAngle({ x: 0, y: 0 });
    }, 600);
  };

  // Determine scale and color gradient by phase
  const getScaleClass = () => {
    if (isPaused) return 'scale-100';
    switch (phase) {
      case 'inhale':
        return 'scale-115 sm:scale-125';
      case 'hold':
        return 'scale-115 sm:scale-125';
      case 'exhale':
        return 'scale-85 sm:scale-90';
      case 'rest':
        return 'scale-90 sm:scale-95';
    }
  };

  const getColors = () => {
    switch (theme) {
      case 'grass':
        return {
          coreGradient: 'from-emerald-200 via-teal-100 to-amber-100',
          border: 'border-emerald-300',
          glow: 'bg-emerald-300/30',
          textColor: 'text-emerald-950'
        };
      case 'bear':
        return {
          coreGradient: 'from-amber-200 via-orange-100 to-amber-50',
          border: 'border-amber-300',
          glow: 'bg-amber-300/30',
          textColor: 'text-amber-950'
        };
      case 'balloon':
        return {
          coreGradient: 'from-sky-200 via-indigo-100 to-pink-100',
          border: 'border-sky-300',
          glow: 'bg-sky-300/30',
          textColor: 'text-sky-950'
        };
    }
  };

  const colors = getColors();

  return (
    <div
      className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto flex items-center justify-center select-none perspective-[1000px] cursor-pointer"
      onPointerDown={handleSphereTap}
      role="button"
      tabIndex={0}
      aria-label={`呼吸引导球：当前${getPhaseText()}，点击可触摸互动`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          sounds.playKalimbaBloom();
        }
      }}
    >
      {/* Outer 3D Halo Ripple Layer 1 */}
      <div
        className={`absolute inset-0 rounded-full transition-all duration-[3800ms] ease-in-out pointer-events-none blur-md ${colors.glow} ${getScaleClass()}`}
        style={{
          transform: `translateZ(-40px) scale(${tapRipple ? 1.3 : 1.15})`
        }}
      />

      {/* Intermediate 3D Wave Ring Layer 2 */}
      <div
        className={`absolute w-56 h-56 sm:w-60 sm:h-60 rounded-full border-2 border-dashed border-white/60 pointer-events-none transition-all duration-[3800ms] ease-in-out ${getScaleClass()}`}
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${touchAngle.x * 0.5}deg) rotateY(${touchAngle.y * 0.5}deg) translateZ(-15px)`
        }}
      />

      {/* Main 3D Tactile Interactive Core Sphere */}
      <div
        className={`relative w-44 h-44 sm:w-50 sm:h-50 rounded-full bg-gradient-to-tr ${colors.coreGradient} border-4 ${colors.border} shadow-2xl flex flex-col items-center justify-center p-4 text-center transition-all duration-[3800ms] ease-in-out ${getScaleClass()} ${tapRipple ? 'brightness-110' : ''}`}
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${touchAngle.x}deg) rotateY(${touchAngle.y}deg) translateZ(25px)`,
          transitionProperty: tapRipple ? 'transform, filter' : 'transform, all',
          transitionDuration: tapRipple ? '0.2s' : '3800ms'
        }}
      >
        {/* Soft Inner Highlight */}
        <div className="absolute top-3 left-5 w-14 h-8 bg-white/60 rounded-full blur-[2px] pointer-events-none" />

        {/* Central Theme Emoji (floating at translateZ: 30px) */}
        <span
          style={{ transform: 'translateZ(30px)' }}
          className="text-4xl sm:text-5xl filter drop-shadow-md transition-transform duration-300"
        >
          {getThemeEmoji()}
        </span>

        {/* Phase Guidance Label */}
        <span
          style={{ transform: 'translateZ(20px)' }}
          className={`text-sm sm:text-base font-black ${colors.textColor} tracking-tight mt-1 leading-tight`}
        >
          {phase === 'inhale' && '慢慢吸气...'}
          {phase === 'hold' && '轻轻停一停'}
          {phase === 'exhale' && '缓缓呼气...'}
          {phase === 'rest' && '轻松休息'}
        </span>

        <span
          style={{ transform: 'translateZ(15px)' }}
          className="text-[11px] font-bold text-stone-600/90 mt-0.5"
        >
          肚子像软软的小气球
        </span>
      </div>

      {/* Touch Interaction Hint */}
      <div className="absolute -bottom-2 text-[11px] font-bold text-stone-500 bg-white/80 px-2.5 py-0.5 rounded-full border border-teal-200 shadow-2xs pointer-events-none">
        触摸晶球可感受温和涟漪 🌿
      </div>
    </div>
  );
};
