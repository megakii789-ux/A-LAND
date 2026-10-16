/**
 * A-LAND V2 sprite animation controller — browser-native WAAPI.
 * Deliberately no imports from AppContext, speech.ts, business modules, or privacy gates.
 * Applies movement only to a decorative Image/element; do NOT use this
 * to synthesize lip sync or imply playback has begun.
 */
export type AlandMotion = 'idle' | 'greeting' | 'listening' | 'celebrate' | 'calm';

export const MOTION_SETTINGS: Record<
  AlandMotion,
  { frames: Keyframe[]; duration: number; iterations: number }
> = {
  idle: {
    frames: [{ transform: 'translateY(0)' }, { transform: 'translateY(-10px)' }, { transform: 'translateY(0)' }],
    duration: 3000,
    iterations: Infinity,
  },
  greeting: {
    frames: [
      { transform: 'translateY(0) rotate(0)' },
      { transform: 'translateY(-20px) rotate(-8deg)' },
      { transform: 'translateY(0) rotate(0)' },
    ],
    duration: 700,
    iterations: 1,
  },
  listening: {
    frames: [{ transform: 'rotate(0)' }, { transform: 'rotate(7deg)' }, { transform: 'rotate(0)' }],
    duration: 1800,
    iterations: 1,
  },
  celebrate: {
    frames: [
      { transform: 'translateY(0) scale(1)' },
      { transform: 'translateY(-24px) scale(1.06)' },
      { transform: 'translateY(0) scale(1)' },
    ],
    duration: 700,
    iterations: 1,
  },
  calm: {
    frames: [{ transform: 'scale(1)' }, { transform: 'scale(1.04)' }, { transform: 'scale(1)' }],
    duration: 4200,
    iterations: Infinity,
  },
};

export function animateAlandSprite(el: HTMLElement | null, motion: AlandMotion): Animation | null {
  if (
    !el ||
    typeof el.animate !== 'function' ||
    typeof window === 'undefined' ||
    (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  ) {
    return null;
  }
  const m = MOTION_SETTINGS[motion];
  return el.animate(m.frames, {
    duration: m.duration,
    iterations: m.iterations,
    easing: 'ease-in-out',
  });
}
