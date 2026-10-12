import React, { useRef, useState, useCallback, useEffect } from 'react';

export interface Interactive3DCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // max tilt angle in degrees, default 10
  perspective?: number; // perspective in px, default 1000
  glareOpacity?: number; // max glare reflection opacity, default 0.25
  disabled?: boolean;
  role?: string;
  tabIndex?: number;
  onClick?: (e: React.MouseEvent) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  'aria-label'?: string;
}

/**
 * Reusable 60fps Hardware-Accelerated 3D Interactive Perspective Card
 * - Uses CSS 3D transforms (`rotateX`, `rotateY`, `translateZ`)
 * - Smooth pointer-following tilt with physical damping
 * - Dynamic specular light sheen that moves with the tilt angle
 * - Child-friendly tactile feel (like physical wooden/clay tiles)
 * - Strictly respects prefers-reduced-motion
 */
export const Interactive3DCard: React.FC<Interactive3DCardProps> = ({
  children,
  className = '',
  maxTilt = 8,
  perspective = 900,
  glareOpacity = 0.2,
  disabled = false,
  role,
  tabIndex,
  onClick,
  onKeyDown,
  'aria-label': ariaLabel
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener?.('change', listener);
      return () => mediaQuery.removeEventListener?.('change', listener);
    }
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || prefersReducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normalizedX = (x / rect.width) * 2 - 1; // -1 to 1
    const normalizedY = (y / rect.height) * 2 - 1; // -1 to 1

    // Invert Y for correct intuitive tilt: cursor at top tilts card back (negative rotateX)
    const tiltX = -normalizedY * maxTilt;
    const tiltY = normalizedX * maxTilt;

    setTilt({ x: tiltX, y: tiltY });
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: glareOpacity
    });
  }, [disabled, maxTilt, glareOpacity, prefersReducedMotion]);

  const handlePointerEnter = useCallback(() => {
    if (disabled || prefersReducedMotion) return;
    setIsHovered(true);
  }, [disabled, prefersReducedMotion]);

  const handlePointerLeave = useCallback(() => {
    if (disabled || prefersReducedMotion) return;
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
    setGlare(prev => ({ ...prev, opacity: 0 }));
  }, [disabled, prefersReducedMotion]);

  const transformStyle = prefersReducedMotion || disabled
    ? undefined
    : {
        transform: `perspective(${perspective}px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${isHovered ? 'scale3d(1.02, 1.02, 1.02)' : 'scale3d(1, 1, 1)'}`,
        transition: isHovered ? 'transform 0.1s cubic-bezier(0.2, 0, 0, 1)' : 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
        transformStyle: 'preserve-3d' as const
      };

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={onClick}
      onKeyDown={onKeyDown}
      role={role}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      style={transformStyle}
      className={`relative overflow-hidden will-change-transform ${className}`}
    >
      {/* 3D Content Container with preserve-3d */}
      <div style={{ transformStyle: 'preserve-3d' }} className="w-full h-full">
        {children}
      </div>

      {/* Dynamic 3D Glare / Light Reflection Overlay */}
      {!prefersReducedMotion && !disabled && (
        <div
          className="absolute inset-0 pointer-events-none rounded-[inherit] transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 280px at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, ${glare.opacity}), transparent 70%)`,
            opacity: glare.opacity > 0 ? 1 : 0
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
};
