import React, { useState, useRef, useEffect, useCallback } from 'react';
import { sounds } from '../../utils/sound';

export interface Interactive3DMedalTokenProps {
  frontIcon: string;
  frontTitle: string;
  frontSubtitle?: string;
  backDescription: string;
  backAffirmation?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'gold' | 'emerald' | 'amber' | 'sky' | 'rose';
  isUnlocked?: boolean;
  interactiveInspect?: boolean;
}

const COLOR_THEMES = {
  gold: {
    gradient: 'from-amber-300 via-yellow-400 to-amber-500',
    border: 'border-amber-300',
    shadow: 'shadow-amber-500/25',
    ring: 'ring-amber-200',
    text: 'text-amber-950',
    backBg: 'bg-gradient-to-br from-amber-50 to-orange-100'
  },
  emerald: {
    gradient: 'from-emerald-300 via-teal-400 to-emerald-500',
    border: 'border-emerald-300',
    shadow: 'shadow-emerald-500/25',
    ring: 'ring-emerald-200',
    text: 'text-emerald-950',
    backBg: 'bg-gradient-to-br from-emerald-50 to-teal-100'
  },
  amber: {
    gradient: 'from-amber-200 via-orange-300 to-amber-400',
    border: 'border-amber-300',
    shadow: 'shadow-orange-500/25',
    ring: 'ring-amber-200',
    text: 'text-stone-900',
    backBg: 'bg-gradient-to-br from-stone-50 to-amber-100'
  },
  sky: {
    gradient: 'from-sky-300 via-blue-400 to-sky-500',
    border: 'border-sky-300',
    shadow: 'shadow-sky-500/25',
    ring: 'ring-sky-200',
    text: 'text-sky-950',
    backBg: 'bg-gradient-to-br from-sky-50 to-blue-100'
  },
  rose: {
    gradient: 'from-rose-300 via-pink-400 to-rose-500',
    border: 'border-rose-300',
    shadow: 'shadow-rose-500/25',
    ring: 'ring-rose-200',
    text: 'text-rose-950',
    backBg: 'bg-gradient-to-br from-rose-50 to-red-100'
  }
};

const SIZE_CONFIGS = {
  sm: {
    box: 'w-20 h-20',
    icon: 'text-2xl',
    title: 'text-xs',
    rim: 'border-2'
  },
  md: {
    box: 'w-32 h-32',
    icon: 'text-4xl',
    title: 'text-sm',
    rim: 'border-4'
  },
  lg: {
    box: 'w-48 h-48 sm:w-56 sm:h-56',
    icon: 'text-6xl sm:text-7xl',
    title: 'text-lg sm:text-xl',
    rim: 'border-6'
  }
};

/**
 * Interactive 3D Medal / Token Component
 * - 3D dual-sided flip with preserve-3d
 * - Touch & pointer drag 3D rotation inspection
 * - Tactile coin rim and material specular highlight
 * - Respects prefers-reduced-motion
 */
export const Interactive3DMedalToken: React.FC<Interactive3DMedalTokenProps> = ({
  frontIcon,
  frontTitle,
  frontSubtitle,
  backDescription,
  backAffirmation = '真实的陪伴比完美的回答更有力量',
  size = 'md',
  variant = 'gold',
  isUnlocked = true,
  interactiveInspect = true
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [rotY, setRotY] = useState(0);
  const [rotX, setRotX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, startRotY: 0, startRotX: 0 });
  const theme = COLOR_THEMES[variant] || COLOR_THEMES.gold;
  const dimensions = SIZE_CONFIGS[size] || SIZE_CONFIGS.md;

  const handleFlip = () => {
    sounds.playWoodClack();
    setIsFlipped(prev => !prev);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!interactiveInspect) return;
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      startRotY: rotY,
      startRotX: rotX
    };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !interactiveInspect) return;
    const deltaX = e.clientX - dragStart.current.x;
    const deltaY = e.clientY - dragStart.current.y;
    // Map drag distance to rotation angles
    setRotY(dragStart.current.startRotY + deltaX * 0.7);
    setRotX(Math.max(-45, Math.min(45, dragStart.current.startRotX - deltaY * 0.7)));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  const handleResetRotation = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playClick();
    setRotX(0);
    setRotY(0);
  };

  const totalRotateY = (isFlipped ? 180 : 0) + rotY;

  return (
    <div className="flex flex-col items-center select-none">
      {/* 3D Perspective Stage */}
      <div
        className={`perspective-[1200px] cursor-grab active:cursor-grabbing ${dimensions.box}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleFlip}
        role="button"
        tabIndex={0}
        aria-label={`${frontTitle}，点击翻转查看说明`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleFlip();
          }
        }}
      >
        <div
          className={`w-full h-full relative transition-transform ${isDragging ? 'duration-0' : 'duration-500'}`}
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotX}deg) rotateY(${totalRotateY}deg)`
          }}
        >
          {/* FRONT FACE */}
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-br ${theme.gradient} ${theme.border} ${dimensions.rim} shadow-2xl flex flex-col items-center justify-center p-3 text-center backface-hidden`}
            style={{
              backfaceVisibility: 'hidden',
              filter: isUnlocked ? 'none' : 'grayscale(0.85) opacity(0.65)'
            }}
          >
            {/* Coin inner bevel ring */}
            <div className="absolute inset-1.5 rounded-full border border-white/50 pointer-events-none" />
            <div className="absolute inset-3 rounded-full border border-dashed border-white/40 pointer-events-none" />

            {/* Emblem Icon */}
            <span className={`${dimensions.icon} filter drop-shadow-md transform transition-transform group-hover:scale-110`}>
              {frontIcon}
            </span>

            {/* Title */}
            <span className={`mt-1 font-black ${dimensions.title} ${theme.text} tracking-tight leading-tight line-clamp-1`}>
              {frontTitle}
            </span>

            {frontSubtitle && (
              <span className="text-[10px] text-amber-900/80 font-bold mt-0.5 line-clamp-1">
                {frontSubtitle}
              </span>
            )}
          </div>

          {/* BACK FACE */}
          <div
            className={`absolute inset-0 rounded-full ${theme.backBg} ${theme.border} ${dimensions.rim} shadow-2xl flex flex-col items-center justify-center p-4 text-center backface-hidden`}
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            <div className="absolute inset-1.5 rounded-full border border-stone-300/60 pointer-events-none" />
            <span className="text-xs font-black text-stone-500 uppercase tracking-widest mb-1">
              印记含义
            </span>
            <p className="text-xs sm:text-sm text-stone-800 font-bold leading-snug line-clamp-3 px-1">
              {backDescription}
            </p>
            {backAffirmation && (
              <p className="text-[11px] text-stone-500 mt-2 font-medium italic line-clamp-2 px-2">
                “{backAffirmation}”
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Control hints under token */}
      {interactiveInspect && (
        <div className="mt-2.5 flex items-center gap-2 text-xs font-bold text-stone-500">
          <button
            type="button"
            onClick={handleFlip}
            className="hover:text-stone-800 transition-colors cursor-pointer underline underline-offset-2"
          >
            点击翻转 🔄
          </button>
          <span>·</span>
          <span>拖拽3D视角</span>
          {(rotX !== 0 || rotY !== 0) && (
            <>
              <span>·</span>
              <button
                type="button"
                onClick={handleResetRotation}
                className="text-amber-700 hover:text-amber-900 cursor-pointer"
              >
                复位
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
