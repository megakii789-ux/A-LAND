import React from 'react';

/**
 * 晴雨小岛 · 矢量插画艺术集 (Storybook Vector Illustration Kit)
 * 纯本地 SVG + 丰富渐变与童书水彩质感，零外部网络依赖，永不破碎。
 */

export const IslandPanoramaIllustration: React.FC<{ className?: string }> = ({ className = 'w-full h-auto' }) => (
  <svg viewBox="0 0 800 280" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="skyGrad" x1="0" y1="0" x2="800" y2="280" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#BAE6FD" />
        <stop offset="45%" stopColor="#E0F2FE" />
        <stop offset="75%" stopColor="#FEF3C7" />
        <stop offset="100%" stopColor="#FED7AA" />
      </linearGradient>
      <linearGradient id="sunGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
      <linearGradient id="hillLeft" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#86EFAC" />
        <stop offset="100%" stopColor="#22C55E" />
      </linearGradient>
      <linearGradient id="hillRight" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#A7F3D0" />
        <stop offset="100%" stopColor="#10B981" />
      </linearGradient>
      <linearGradient id="seaGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#0284C7" />
      </linearGradient>
      <linearGradient id="rainbowGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#FDA4AF" stopOpacity="0.7" />
        <stop offset="25%" stopColor="#FDE047" stopOpacity="0.7" />
        <stop offset="50%" stopColor="#86EFAC" stopOpacity="0.7" />
        <stop offset="75%" stopColor="#93C5FD" stopOpacity="0.7" />
        <stop offset="100%" stopColor="#C4B5FD" stopOpacity="0.7" />
      </linearGradient>
      <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    {/* Sky Backdrop */}
    <rect width="800" height="280" rx="28" fill="url(#skyGrad)" />

    {/* Soft Rainbow Arcs */}
    <path
      d="M 120 220 A 180 180 0 0 1 480 220"
      stroke="url(#rainbowGrad)"
      strokeWidth="14"
      strokeLinecap="round"
      opacity="0.6"
    />

    {/* Distant Warm Sun */}
    <circle cx="680" cy="80" r="46" fill="url(#sunGrad)" filter="url(#softGlow)" opacity="0.9" />
    <circle cx="680" cy="80" r="32" fill="#FEF08A" />

    {/* Gentle Drifting Clouds */}
    <g fill="#FFFFFF" opacity="0.85">
      <ellipse cx="220" cy="65" rx="42" ry="18" />
      <ellipse cx="245" cy="55" rx="30" ry="22" />
      <ellipse cx="200" cy="68" rx="24" ry="14" />

      <ellipse cx="460" cy="90" rx="36" ry="16" />
      <ellipse cx="480" cy="80" rx="26" ry="18" />

      {/* Gentle rain dots under left cloud */}
      <line x1="200" y1="90" x2="194" y2="105" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      <line x1="220" y1="92" x2="214" y2="108" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      <line x1="240" y1="88" x2="234" y2="104" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
    </g>

    {/* Sea / Lagoon */}
    <path d="M 0 210 Q 200 200 400 215 T 800 210 L 800 280 L 0 280 Z" fill="url(#seaGrad)" />

    {/* Rolling Green Hills */}
    {/* Left Island Shore (Home 1) */}
    <path d="M -20 240 Q 140 130 320 240 Z" fill="url(#hillLeft)" />
    {/* Right Island Shore (Home 2) */}
    <path d="M 440 250 Q 640 140 820 250 Z" fill="url(#hillRight)" />

    {/* Central Island Knoll */}
    <path d="M 240 260 Q 400 160 560 260 Z" fill="#6EE7B7" opacity="0.8" />

    {/* Wooden Connecting Bridge (两个家的木桥) */}
    <path d="M 300 225 Q 390 195 480 225" stroke="#92400E" strokeWidth="8" strokeLinecap="round" />
    <path d="M 300 229 Q 390 199 480 229" stroke="#B45309" strokeWidth="4" strokeLinecap="round" />
    {/* Bridge posts */}
    <line x1="330" y1="218" x2="330" y2="238" stroke="#78350F" strokeWidth="3" />
    <line x1="370" y1="208" x2="370" y2="232" stroke="#78350F" strokeWidth="3" />
    <line x1="410" y1="208" x2="410" y2="232" stroke="#78350F" strokeWidth="3" />
    <line x1="450" y1="218" x2="450" y2="238" stroke="#78350F" strokeWidth="3" />

    {/* Cozy Houses */}
    {/* House on Left Shore */}
    <g transform="translate(140, 160)">
      <rect x="0" y="20" width="36" height="28" rx="4" fill="#FEF3C7" stroke="#D97706" strokeWidth="2" />
      <polygon points="18,0 -4,22 40,22" fill="#F87171" stroke="#DC2626" strokeWidth="2" />
      <rect x="12" y="32" width="12" height="16" rx="2" fill="#B45309" />
      <rect x="5" y="24" width="8" height="8" rx="1" fill="#FEF08A" stroke="#D97706" strokeWidth="1" />
    </g>

    {/* House on Right Shore */}
    <g transform="translate(620, 165)">
      <rect x="0" y="20" width="38" height="28" rx="4" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2" />
      <polygon points="19,0 -4,22 42,22" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />
      <rect x="13" y="32" width="12" height="16" rx="2" fill="#0369A1" />
      <circle cx="28" cy="28" r="4" fill="#FEF08A" stroke="#0284C7" strokeWidth="1" />
    </g>

    {/* Whimsical Story Grove Trees */}
    <g transform="translate(360, 155)">
      <rect x="16" y="28" width="8" height="24" fill="#78350F" rx="2" />
      <circle cx="20" cy="22" r="22" fill="#059669" />
      <circle cx="10" cy="18" r="16" fill="#10B981" />
      <circle cx="28" cy="18" r="15" fill="#34D399" />
    </g>

    {/* Floating Friendly Sailboat */}
    <g transform="translate(370, 235)">
      <path d="M 0 10 L 28 10 L 22 18 L 4 18 Z" fill="#92400E" />
      <line x1="14" y1="10" x2="14" y2="0" stroke="#78350F" strokeWidth="2" />
      <polygon points="14,2 26,9 14,9" fill="#FDE047" />
      <polygon points="12,3 2,9 12,9" fill="#FFFFFF" />
    </g>
  </svg>
);

export const OwlCompanionIllustration: React.FC<{ className?: string }> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="owlBody" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
      <linearGradient id="owlBelly" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FEF3C7" />
        <stop offset="100%" stopColor="#FDE68A" />
      </linearGradient>
    </defs>
    {/* Soft backdrop halo */}
    <circle cx="50" cy="50" r="46" fill="#FEF3C7" />
    <circle cx="50" cy="50" r="44" stroke="#FBBF24" strokeWidth="2" />

    {/* Feather tuft ears */}
    <polygon points="26,22 36,40 22,34" fill="#B45309" />
    <polygon points="74,22 64,40 78,34" fill="#B45309" />

    {/* Main body */}
    <ellipse cx="50" cy="55" rx="34" ry="32" fill="url(#owlBody)" />

    {/* Belly */}
    <ellipse cx="50" cy="62" rx="22" ry="20" fill="url(#owlBelly)" />
    {/* Soft feather ripples */}
    <path d="M 44 56 Q 50 60 56 56" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
    <path d="M 40 64 Q 50 68 60 64" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
    <path d="M 45 72 Q 50 75 55 72" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />

    {/* Big friendly eye rings */}
    <circle cx="36" cy="45" r="14" fill="#FFFFFF" stroke="#FBBF24" strokeWidth="2" />
    <circle cx="64" cy="45" r="14" fill="#FFFFFF" stroke="#FBBF24" strokeWidth="2" />

    {/* Pupils with bright catchlights */}
    <circle cx="38" cy="45" r="7" fill="#1C1917" />
    <circle cx="62" cy="45" r="7" fill="#1C1917" />
    <circle cx="36" cy="43" r="2.5" fill="#FFFFFF" />
    <circle cx="60" cy="43" r="2.5" fill="#FFFFFF" />

    {/* Cute orange beak */}
    <polygon points="50,49 44,56 56,56" fill="#EA580C" />

    {/* Gentle wings */}
    <path d="M 18 50 Q 14 65 24 75 Q 26 65 24 55 Z" fill="#B45309" />
    <path d="M 82 50 Q 86 65 76 75 Q 74 65 76 55 Z" fill="#B45309" />

    {/* Cute feet */}
    <ellipse cx="42" cy="86" rx="6" ry="3" fill="#EA580C" />
    <ellipse cx="58" cy="86" rx="6" ry="3" fill="#EA580C" />
  </svg>
);

export const CupScaleInteractiveIllustration: React.FC<{
  perspective: 'neutral' | 'squirrel' | 'elephant';
  className?: string;
}> = ({ perspective, className = 'w-full h-auto' }) => (
  <svg viewBox="0 0 460 220" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="tableWood" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FDE68A" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
      <linearGradient id="cupBlue" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#38BDF8" />
        <stop offset="50%" stopColor="#0284C7" />
        <stop offset="100%" stopColor="#0369A1" />
      </linearGradient>
    </defs>

    {/* Room Background */}
    <rect width="460" height="220" rx="20" fill="#F8FAFC" />

    {/* Wooden Tabletop */}
    <rect x="20" y="150" width="420" height="50" rx="10" fill="url(#tableWood)" stroke="#D97706" strokeWidth="2" />

    {/* 1. Left: Small Block + Squirrel Perspective */}
    <g
      transform="translate(40, 50)"
      className={`transition-all duration-300 ${perspective === 'squirrel' ? 'scale-110 opacity-100' : 'opacity-85'}`}
    >
      {/* Tiny Wooden Block */}
      <rect x="35" y="80" width="22" height="22" rx="4" fill="#F87171" stroke="#DC2626" strokeWidth="2" />
      <text x="46" y="96" fontSize="12" fill="#FFFFFF" textAnchor="middle" fontWeight="bold">积木</text>

      {/* Cute Squirrel */}
      <circle cx="20" cy="75" r="14" fill="#D97706" />
      <circle cx="16" cy="72" r="2" fill="#000" />
      <polygon points="12,64 16,70 10,70" fill="#B45309" />
      <path d="M 8 82 Q -4 70 2 56 Q 14 62 14 74 Z" fill="#B45309" />
      <text x="24" y="112" fontSize="11" fill="#78350F" fontWeight="bold">小积木看它</text>
      <text x="24" y="125" fontSize="10" fill="#0284C7">像座大高山！⛰️</text>
    </g>

    {/* 2. Middle: The Cup (Central Fact) */}
    <g transform="translate(195, 45)">
      {/* Cup Shadow */}
      <ellipse cx="35" cy="110" rx="32" ry="7" fill="#CBD5E1" opacity="0.6" />

      {/* Cup Body */}
      <path
        d="M 12 25 L 18 105 Q 35 110 52 105 L 58 25 Z"
        fill="url(#cupBlue)"
        stroke="#0284C7"
        strokeWidth="3"
      />
      {/* Cup Handle */}
      <path
        d="M 54 40 Q 75 42 75 65 Q 75 88 51 86"
        fill="none"
        stroke="#0284C7"
        strokeWidth="5"
        strokeLinecap="round"
      />
      {/* Cup Rim */}
      <ellipse cx="35" cy="25" rx="23" ry="7" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2" />
      {/* Water line */}
      <ellipse cx="35" cy="40" rx="19" ry="5" fill="#BAE6FD" opacity="0.8" />

      {/* Label: Fact */}
      <rect x="0" y="116" width="70" height="20" rx="6" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="1" />
      <text x="35" y="130" fontSize="11" fill="#0369A1" textAnchor="middle" fontWeight="bold">
        杯子：高10厘米
      </text>
    </g>

    {/* 3. Right: Huge Bucket + Elephant Perspective */}
    <g
      transform="translate(300, 30)"
      className={`transition-all duration-300 ${perspective === 'elephant' ? 'scale-110 opacity-100' : 'opacity-85'}`}
    >
      {/* Big Water Bucket */}
      <path d="M 30 40 L 40 120 L 105 120 L 115 40 Z" fill="#94A3B8" stroke="#475569" strokeWidth="2" />
      <ellipse cx="72" cy="40" rx="42" ry="9" fill="#CBD5E1" stroke="#475569" strokeWidth="2" />
      <path d="M 30 40 Q 72 -5 115 40" fill="none" stroke="#334155" strokeWidth="3" />

      {/* Baby Elephant outline */}
      <circle cx="125" cy="50" r="16" fill="#94A3B8" />
      <path d="M 135 56 Q 148 65 142 80" stroke="#94A3B8" strokeWidth="5" strokeLinecap="round" fill="none" />
      <circle cx="122" cy="48" r="2" fill="#000" />

      <text x="75" y="138" fontSize="11" fill="#334155" fontWeight="bold" textAnchor="middle">大水桶看它</text>
      <text x="75" y="151" fontSize="10" fill="#64748B" textAnchor="middle">好小一滴水！💧</text>
    </g>
  </svg>
);

export const RainWeatherIllustration: React.FC<{
  focusSide: 'both' | 'frog' | 'rabbit';
  className?: string;
}> = ({ focusSide, className = 'w-full h-auto' }) => (
  <svg viewBox="0 0 460 220" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="rainSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#94A3B8" />
        <stop offset="40%" stopColor="#CBD5E1" />
        <stop offset="100%" stopColor="#F1F5F9" />
      </linearGradient>
    </defs>

    {/* Rainy Atmosphere */}
    <rect width="460" height="220" rx="20" fill="url(#rainSky)" />

    {/* Gentle falling rain streaks */}
    <g stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" opacity="0.65">
      <line x1="40" y1="20" x2="30" y2="45" />
      <line x1="90" y1="35" x2="80" y2="60" />
      <line x1="150" y1="15" x2="140" y2="40" />
      <line x1="220" y1="30" x2="210" y2="55" />
      <line x1="310" y1="25" x2="300" y2="50" />
      <line x1="390" y1="15" x2="380" y2="40" />
      <line x1="430" y1="40" x2="420" y2="65" />
    </g>

    {/* Ground Meadow */}
    <path d="M 0 170 Q 230 155 460 170 L 460 220 L 0 220 Z" fill="#86EFAC" />

    {/* Center Divider: Dual Sided Coin Metaphor */}
    <line x1="230" y1="20" x2="230" y2="200" stroke="#94A3B8" strokeWidth="2" strokeDasharray="4 4" opacity="0.5" />

    {/* Side A: Cheerful Frog in Pond */}
    <g
      transform="translate(40, 70)"
      className={`transition-all duration-300 ${focusSide === 'frog' ? 'scale-105' : ''}`}
    >
      {/* Pond */}
      <ellipse cx="65" cy="95" rx="50" ry="18" fill="#38BDF8" opacity="0.8" />
      {/* Lilypad */}
      <ellipse cx="55" cy="92" rx="22" ry="8" fill="#22C55E" />

      {/* Cheerful Frog */}
      <ellipse cx="55" cy="75" rx="18" ry="14" fill="#4ADE80" stroke="#16A34A" strokeWidth="2" />
      <circle cx="48" cy="64" r="6" fill="#4ADE80" stroke="#16A34A" strokeWidth="1.5" />
      <circle cx="62" cy="64" r="6" fill="#4ADE80" stroke="#16A34A" strokeWidth="1.5" />
      <circle cx="48" cy="64" r="2.5" fill="#000" />
      <circle cx="62" cy="64" r="2.5" fill="#000" />
      <path d="M 48 78 Q 55 84 62 78" stroke="#15803D" strokeWidth="2" strokeLinecap="round" />

      {/* Tiny leaf umbrella */}
      <path d="M 70 70 Q 80 50 92 65 Z" fill="#15803D" />
      <line x1="80" y1="58" x2="80" y2="78" stroke="#166534" strokeWidth="2" />

      {/* Label */}
      <rect x="15" y="105" width="100" height="26" rx="8" fill="#DCFCE7" stroke="#86EFAC" strokeWidth="1" />
      <text x="65" y="122" fontSize="11" fill="#15803D" textAnchor="middle" fontWeight="black">
        🐸 小青蛙：太好玩啦！
      </text>
    </g>

    {/* Side B: Rabbit Disappointed with Wet Kite */}
    <g
      transform="translate(270, 70)"
      className={`transition-all duration-300 ${focusSide === 'rabbit' ? 'scale-105' : ''}`}
    >
      {/* Giant friendly sheltering mushroom */}
      <path d="M 30 75 Q 70 20 110 75 Z" fill="#F87171" stroke="#DC2626" strokeWidth="2" />
      <circle cx="50" cy="55" r="4" fill="#FFFFFF" />
      <circle cx="75" cy="45" r="5" fill="#FFFFFF" />
      <circle cx="95" cy="60" r="3" fill="#FFFFFF" />
      <rect x="62" y="75" width="16" height="35" rx="3" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />

      {/* Fluffy Rabbit underneath */}
      <ellipse cx="65" cy="98" rx="12" ry="12" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
      {/* Ears dropping slightly */}
      <ellipse cx="58" cy="80" rx="3" ry="10" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" transform="rotate(-15 58 80)" />
      <ellipse cx="72" cy="80" rx="3" ry="10" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" transform="rotate(15 72 80)" />
      <circle cx="61" cy="95" r="1.5" fill="#000" />
      <circle cx="69" cy="95" r="1.5" fill="#000" />

      {/* Wet colorful kite lying on ground */}
      <polygon points="120,95 132,85 144,95 132,105" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
      <line x1="120" y1="95" x2="144" y2="95" stroke="#B45309" strokeWidth="1" />
      <line x1="132" y1="85" x2="132" y2="105" stroke="#B45309" strokeWidth="1" />

      {/* Label */}
      <rect x="15" y="105" width="125" height="26" rx="8" fill="#FEE2E2" stroke="#FCA5A5" strokeWidth="1" />
      <text x="77" y="122" fontSize="11" fill="#B91C1C" textAnchor="middle" fontWeight="black">
        🐰 小兔：风筝飞不起来了
      </text>
    </g>
  </svg>
);

export const LocationBadgeIllustration: React.FC<{
  type: 'weather' | 'story' | 'detective' | 'courage' | 'bridge' | 'starlight' | 'calm';
  className?: string;
}> = ({ type, className = 'w-12 h-12' }) => {
  switch (type) {
    case 'weather':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <circle cx="26" cy="26" r="14" fill="#FBBF24" />
          <path d="M 22 46 L 46 46 A 12 12 0 0 0 46 22 A 14 14 0 0 0 24 28 A 10 10 0 0 0 22 46 Z" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="2.5" />
          <path d="M 26 50 L 23 56 M 34 50 L 31 56 M 42 50 L 39 56" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'story':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <rect x="10" y="14" width="44" height="38" rx="6" fill="#FDE68A" stroke="#D97706" strokeWidth="2" />
          <path d="M 32 16 L 32 50" stroke="#B45309" strokeWidth="2" strokeDasharray="2 2" />
          <circle cx="22" cy="28" r="4" fill="#10B981" />
          <circle cx="42" cy="28" r="4" fill="#F43F5E" />
          <path d="M 16 38 Q 22 42 28 38" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
          <path d="M 36 38 Q 42 42 48 38" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'detective':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <circle cx="28" cy="28" r="16" fill="#FEF3C7" stroke="#D97706" strokeWidth="3.5" />
          <circle cx="28" cy="28" r="10" fill="#E0F2FE" opacity="0.8" />
          <line x1="40" y1="40" x2="54" y2="54" stroke="#92400E" strokeWidth="5" strokeLinecap="round" />
          <circle cx="28" cy="28" r="3" fill="#D97706" />
        </svg>
      );
    case 'courage':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <path d="M 12 16 Q 12 10 18 10 L 46 10 Q 52 10 52 16 L 52 38 Q 52 44 46 44 L 28 44 L 16 54 L 18 44 L 18 44 Q 12 44 12 38 Z" fill="#FFE4E6" stroke="#E11D48" strokeWidth="2.5" />
          <path d="M 32 20 C 32 18 29 16 26 18 C 22 20 22 26 32 32 C 42 26 42 20 38 18 C 35 16 32 18 32 20 Z" fill="#F43F5E" />
        </svg>
      );
    case 'bridge':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <path d="M 8 46 Q 32 24 56 46" stroke="#92400E" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          <path d="M 8 50 Q 32 28 56 50" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <line x1="20" y1="36" x2="20" y2="52" stroke="#78350F" strokeWidth="2" />
          <line x1="32" y1="30" x2="32" y2="50" stroke="#78350F" strokeWidth="2" />
          <line x1="44" y1="36" x2="44" y2="52" stroke="#78350F" strokeWidth="2" />
        </svg>
      );
    case 'starlight':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <polygon points="32,8 39,24 56,26 43,38 47,55 32,46 17,55 21,38 8,26 25,24" fill="#FDE047" stroke="#F59E0B" strokeWidth="2.5" />
          <circle cx="32" cy="30" r="4" fill="#FFFFFF" />
        </svg>
      );
    case 'calm':
    default:
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <circle cx="32" cy="32" r="22" fill="#CCFBF1" stroke="#0D9488" strokeWidth="2.5" />
          <path d="M 22 34 Q 32 20 42 34 Q 32 44 22 34 Z" fill="#14B8A6" />
          <line x1="22" y1="34" x2="42" y2="34" stroke="#0F766E" strokeWidth="1.5" />
        </svg>
      );
  }
};

/**
 * 勇气说话屋 · 温暖盾牌与勇敢之心插画 (Courage Shield Illustration)
 */
export const CourageShieldIllustration: React.FC<{ className?: string }> = ({ className = 'w-full h-auto' }) => (
  <svg viewBox="0 0 460 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="courageBg" x1="0" y1="0" x2="460" y2="180" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFF1F2" />
        <stop offset="100%" stopColor="#FFE4E6" />
      </linearGradient>
      <linearGradient id="shieldGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FDA4AF" />
        <stop offset="100%" stopColor="#F43F5E" />
      </linearGradient>
      <linearGradient id="lionGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FDE68A" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
    </defs>
    {/* Soft rounded card backdrop */}
    <rect width="460" height="180" rx="20" fill="url(#courageBg)" />

    {/* Gentle background hearts / sparkle bubbles */}
    <circle cx="70" cy="45" r="8" fill="#FECDD3" opacity="0.6" />
    <circle cx="390" cy="40" r="12" fill="#FECDD3" opacity="0.6" />
    <circle cx="410" cy="120" r="7" fill="#FECDD3" opacity="0.5" />
    <circle cx="50" cy="130" r="10" fill="#FECDD3" opacity="0.5" />

    {/* Center Character: Brave Gentle Bear with Shield */}
    <g transform="translate(160, 20)">
      {/* Bear Ears */}
      <circle cx="45" cy="42" r="14" fill="#D97706" />
      <circle cx="45" cy="42" r="8" fill="#FEF3C7" />
      <circle cx="95" cy="42" r="14" fill="#D97706" />
      <circle cx="95" cy="42" r="8" fill="#FEF3C7" />

      {/* Bear Head */}
      <circle cx="70" cy="62" r="32" fill="url(#lionGrad)" stroke="#D97706" strokeWidth="2" />
      {/* Snout */}
      <ellipse cx="70" cy="72" rx="14" ry="10" fill="#FEF3C7" />
      <ellipse cx="70" cy="68" rx="5" ry="3.5" fill="#78350F" />
      <path d="M 67 73 Q 70 76 73 73" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" />

      {/* Eyes */}
      <circle cx="58" cy="58" r="3.5" fill="#1C1917" />
      <circle cx="82" cy="58" r="3.5" fill="#1C1917" />
      <circle cx="57" cy="57" r="1.2" fill="#FFFFFF" />
      <circle cx="81" cy="57" r="1.2" fill="#FFFFFF" />

      {/* Rosy Cheeks */}
      <circle cx="50" cy="68" r="4.5" fill="#FDA4AF" opacity="0.8" />
      <circle cx="90" cy="68" r="4.5" fill="#FDA4AF" opacity="0.8" />

      {/* Bear Body */}
      <ellipse cx="70" cy="115" rx="36" ry="28" fill="#D97706" />

      {/* Soft Protective Shield in front */}
      <g transform="translate(32, 70)">
        <path
          d="M 38 0 C 60 0 76 10 76 30 C 76 65 38 85 38 85 C 38 85 0 65 0 30 C 0 10 16 0 38 0 Z"
          fill="url(#shieldGrad)"
          stroke="#E11D48"
          strokeWidth="3"
        />
        {/* Heart Emblem on Shield */}
        <path
          d="M 38 24 C 38 20 33 16 28 18 C 22 21 23 28 38 42 C 53 28 54 21 48 18 C 43 16 38 20 38 24 Z"
          fill="#FFFFFF"
        />
      </g>
    </g>

    {/* Left speech bubble: Saying No is Allowed */}
    <g transform="translate(25, 45)">
      <rect width="125" height="52" rx="14" fill="#FFFFFF" stroke="#FECDD3" strokeWidth="2" />
      <polygon points="125,72 135,76 125,80" fill="#FFFFFF" stroke="#FECDD3" strokeWidth="2" />
      <rect x="123" y="70" width="4" height="12" fill="#FFFFFF" />
      <text x="62" y="24" fontSize="13" fill="#BE123C" textAnchor="middle" fontWeight="bold">我有权说“不”</text>
      <text x="62" y="42" fontSize="11" fill="#881337" textAnchor="middle">保护自己的身体与心</text>
    </g>

    {/* Right speech bubble: Speak Up with Courage */}
    <g transform="translate(305, 45)">
      <rect width="130" height="52" rx="14" fill="#FFFFFF" stroke="#FECDD3" strokeWidth="2" />
      <polygon points="5,76 -5,72 5,80" fill="#FFFFFF" stroke="#FECDD3" strokeWidth="2" />
      <rect x="3" y="70" width="4" height="12" fill="#FFFFFF" />
      <text x="65" y="24" fontSize="13" fill="#BE123C" textAnchor="middle" fontWeight="bold">我有话可以讲</text>
      <text x="65" y="42" fontSize="11" fill="#881337" textAnchor="middle">告诉身边可信的大人</text>
    </g>
  </svg>
);

/**
 * 星光小屋 · 我是谁拼图艺术插画 (Starlight Puzzle Illustration)
 */
export const StarlightPuzzleIllustration: React.FC<{ className?: string }> = ({ className = 'w-full h-auto' }) => (
  <svg viewBox="0 0 460 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="nightSky" x1="0" y1="0" x2="460" y2="180" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#1E1B4B" />
        <stop offset="50%" stopColor="#312E81" />
        <stop offset="100%" stopColor="#4338CA" />
      </linearGradient>
      <linearGradient id="starGlow" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
    </defs>
    {/* Midnight sky card backdrop */}
    <rect width="460" height="180" rx="20" fill="url(#nightSky)" />

    {/* Gentle background stars and constellations */}
    <g fill="#FDE047" opacity="0.8">
      <circle cx="50" cy="35" r="2.5" />
      <circle cx="110" cy="25" r="1.5" />
      <circle cx="80" cy="65" r="2" />
      <circle cx="380" cy="30" r="2.5" />
      <circle cx="420" cy="55" r="1.5" />
      <circle cx="360" cy="75" r="2" />
      <circle cx="400" cy="120" r="2" />
    </g>

    {/* Glowing Crescent Moon */}
    <path
      d="M 40 40 A 18 18 0 0 0 54 68 A 22 22 0 1 1 40 40 Z"
      fill="#FEF08A"
      opacity="0.9"
    />

    {/* Center 4 Interlocking Puzzle Pieces */}
    <g transform="translate(130, 25)">
      {/* Piece 1 (Top Left: Art & Hobbies) */}
      <rect x="0" y="0" width="95" height="60" rx="10" fill="#EC4899" stroke="#F472B6" strokeWidth="2" />
      <text x="47" y="28" fontSize="18" textAnchor="middle">🎨</text>
      <text x="47" y="48" fontSize="11" fill="#FFFFFF" textAnchor="middle" fontWeight="bold">我的爱好</text>

      {/* Piece 2 (Top Right: Strengths & Kind Heart) */}
      <rect x="105" y="0" width="95" height="60" rx="10" fill="#F59E0B" stroke="#FCD34D" strokeWidth="2" />
      <text x="152" y="28" fontSize="18" textAnchor="middle">⭐</text>
      <text x="152" y="48" fontSize="11" fill="#FFFFFF" textAnchor="middle" fontWeight="bold">我的强项</text>

      {/* Piece 3 (Bottom Left: Two Warm Homes - Just 1 piece!) */}
      <rect x="0" y="68" width="95" height="60" rx="10" fill="#3B82F6" stroke="#93C5FD" strokeWidth="2" />
      <text x="47" y="96" fontSize="18" textAnchor="middle">🏡</text>
      <text x="47" y="116" fontSize="11" fill="#FFFFFF" textAnchor="middle" fontWeight="bold">两个家之一</text>

      {/* Piece 4 (Bottom Right: Growing & Learning) */}
      <rect x="105" y="68" width="95" height="60" rx="10" fill="#10B981" stroke="#6EE7B7" strokeWidth="2" />
      <text x="152" y="96" fontSize="18" textAnchor="middle">🌱</text>
      <text x="152" y="116" fontSize="11" fill="#FFFFFF" textAnchor="middle" fontWeight="bold">正在长大</text>

      {/* Glowing Star in the center intersection */}
      <circle cx="100" cy="64" r="16" fill="url(#starGlow)" />
      <text x="100" y="69" fontSize="14" textAnchor="middle">✨</text>
    </g>

    {/* Bottom Caption Pill */}
    <g transform="translate(90, 142)">
      <rect width="280" height="26" rx="13" fill="#312E81" stroke="#6366F1" strokeWidth="1" />
      <text x="140" y="17" fontSize="11" fill="#E0E7FF" textAnchor="middle" fontWeight="medium">
        家庭只是拼图中的一块 · 完整的你无比丰富灿烂
      </text>
    </g>
  </svg>
);

/**
 * 两个家的桥 · 亲子近景插画 (Two Homes Bridge Card Illustration)
 */
export const TwoHomesBridgeCardIllustration: React.FC<{ className?: string }> = ({ className = 'w-full h-auto' }) => (
  <svg viewBox="0 0 460 170" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="bridgeSky" x1="0" y1="0" x2="460" y2="170" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FEF3C7" />
        <stop offset="50%" stopColor="#E0F2FE" />
        <stop offset="100%" stopColor="#BAE6FD" />
      </linearGradient>
      <linearGradient id="streamGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#38BDF8" />
        <stop offset="100%" stopColor="#0284C7" />
      </linearGradient>
    </defs>
    <rect width="460" height="170" rx="20" fill="url(#bridgeSky)" />

    {/* Distant Hills */}
    <path d="M 0 110 Q 120 70 240 110 Q 360 80 460 110 L 460 170 L 0 170 Z" fill="#BBF7D0" />

    {/* Sparkling Stream under bridge */}
    <path d="M 160 170 L 210 110 L 250 110 L 300 170 Z" fill="url(#streamGrad)" opacity="0.8" />
    <line x1="215" y1="130" x2="235" y2="130" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
    <line x1="230" y1="145" x2="255" y2="145" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.7" />

    {/* Left Shore: Mom's Cozy House */}
    <g transform="translate(45, 60)">
      <rect x="0" y="25" width="60" height="40" rx="6" fill="#FEF08A" stroke="#EAB308" strokeWidth="2" />
      <polygon points="30,-5 -8,27 68,27" fill="#F87171" stroke="#DC2626" strokeWidth="2.5" />
      <rect x="22" y="38" width="16" height="27" rx="3" fill="#B45309" />
      <circle cx="14" cy="40" r="6" fill="#FFFFFF" stroke="#EAB308" strokeWidth="1.5" />
      <text x="30" y="80" fontSize="12" fill="#78350F" textAnchor="middle" fontWeight="bold">妈妈家 🌸</text>
    </g>

    {/* Right Shore: Dad's Cozy House */}
    <g transform="translate(355, 60)">
      <rect x="0" y="25" width="60" height="40" rx="6" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2" />
      <polygon points="30,-5 -8,27 68,27" fill="#38BDF8" stroke="#0284C7" strokeWidth="2.5" />
      <rect x="22" y="38" width="16" height="27" rx="3" fill="#0369A1" />
      <rect x="10" y="35" width="12" height="12" rx="2" fill="#FEF08A" stroke="#0284C7" strokeWidth="1.5" />
      <text x="30" y="80" fontSize="12" fill="#0369A1" textAnchor="middle" fontWeight="bold">爸爸家 🚀</text>
    </g>

    {/* Wooden Arched Bridge Connecting the Two */}
    <g transform="translate(145, 75)">
      {/* Arch Plank */}
      <path d="M 0 45 Q 85 10 170 45" stroke="#92400E" strokeWidth="10" strokeLinecap="round" fill="none" />
      <path d="M 0 50 Q 85 15 170 50" stroke="#B45309" strokeWidth="5" strokeLinecap="round" fill="none" />

      {/* Railing Posts */}
      <line x1="30" y1="36" x2="30" y2="58" stroke="#78350F" strokeWidth="3" />
      <line x1="65" y1="24" x2="65" y2="50" stroke="#78350F" strokeWidth="3" />
      <line x1="105" y1="24" x2="105" y2="50" stroke="#78350F" strokeWidth="3" />
      <line x1="140" y1="36" x2="140" y2="58" stroke="#78350F" strokeWidth="3" />

      {/* Fairy Lights on Railing */}
      <circle cx="30" cy="34" r="3" fill="#FDE047" />
      <circle cx="65" cy="22" r="3.5" fill="#FDE047" />
      <circle cx="85" cy="18" r="4" fill="#FDE047" />
      <circle cx="105" cy="22" r="3.5" fill="#FDE047" />
      <circle cx="140" cy="34" r="3" fill="#FDE047" />

      {/* Friendly little heart floating above bridge */}
      <path
        d="M 85 4 C 85 0 81 -4 77 -2 C 72 0 73 6 85 14 C 97 6 98 0 93 -2 C 89 -4 85 0 85 4 Z"
        fill="#F43F5E"
      />
    </g>

    {/* Bottom banner note */}
    <g transform="translate(110, 140)">
      <rect width="240" height="22" rx="11" fill="#FFFFFF" stroke="#FDE68A" strokeWidth="1" />
      <text x="120" y="15" fontSize="11" fill="#92400E" textAnchor="middle" fontWeight="bold">
        桥的两头都有爱 · 随时都能安心往来
      </text>
    </g>
  </svg>
);

/**
 * 情绪天气站 · 晴雨云彩矢量插画 (Weather Sun Cloud Illustration)
 */
export const WeatherSunCloudIllustration: React.FC<{ className?: string }> = ({ className = 'w-full h-auto' }) => (
  <svg viewBox="0 0 460 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="weatherCardBg" x1="0" y1="0" x2="460" y2="160" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#E0F2FE" />
        <stop offset="100%" stopColor="#FEF3C7" />
      </linearGradient>
      <linearGradient id="warmSun" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
    </defs>
    <rect width="460" height="160" rx="20" fill="url(#weatherCardBg)" />

    {/* Warm Smiling Sun */}
    <g transform="translate(80, 20)">
      <circle cx="50" cy="50" r="36" fill="url(#warmSun)" />
      {/* Sun Rays */}
      <line x1="50" y1="6" x2="50" y2="0" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
      <line x1="50" y1="94" x2="50" y2="100" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
      <line x1="6" y1="50" x2="0" y2="50" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
      <line x1="94" y1="50" x2="100" y2="50" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
      <line x1="19" y1="19" x2="14" y2="14" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
      <line x1="81" y1="81" x2="86" y2="86" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
      <line x1="19" y1="81" x2="14" y2="86" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
      <line x1="81" y1="19" x2="86" y2="14" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />

      {/* Sun Eyes and Smile */}
      <circle cx="40" cy="45" r="3.5" fill="#78350F" />
      <circle cx="60" cy="45" r="3.5" fill="#78350F" />
      <circle cx="39" cy="44" r="1.2" fill="#FFFFFF" />
      <circle cx="59" cy="44" r="1.2" fill="#FFFFFF" />
      <path d="M 40 56 Q 50 65 60 56" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <circle cx="32" cy="54" r="4" fill="#FDA4AF" opacity="0.8" />
      <circle cx="68" cy="54" r="4" fill="#FDA4AF" opacity="0.8" />
    </g>

    {/* Soft Friendly Cloud */}
    <g transform="translate(230, 30)">
      <path
        d="M 30 60 A 24 24 0 0 1 68 32 A 32 32 0 0 1 125 36 A 26 26 0 0 1 155 60 A 22 22 0 0 1 145 85 L 35 85 A 25 25 0 0 1 30 60 Z"
        fill="#FFFFFF"
        stroke="#93C5FD"
        strokeWidth="2"
      />
      {/* Cloud Eyes and Smile */}
      <circle cx="80" cy="58" r="3" fill="#1E293B" />
      <circle cx="105" cy="58" r="3" fill="#1E293B" />
      <path d="M 88 66 Q 92.5 72 97 66" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="72" cy="64" r="3.5" fill="#BAE6FD" />
      <circle cx="113" cy="64" r="3.5" fill="#BAE6FD" />

      {/* Gentle raindrops underneath */}
      <line x1="55" y1="95" x2="50" y2="110" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="85" y1="98" x2="80" y2="113" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="115" y1="95" x2="110" y2="110" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
    </g>

    {/* Bottom reassuring pill */}
    <g transform="translate(75, 128)">
      <rect width="310" height="24" rx="12" fill="#FFFFFF" stroke="#BAE6FD" strokeWidth="1" />
      <text x="155" y="16" fontSize="11" fill="#0369A1" textAnchor="middle" fontWeight="bold">
        无论晴天还是雨天，每种天气都有自己的道理
      </text>
    </g>
  </svg>
);

/**
 * 想法侦探社 · 放大镜与好奇小侦探插画 (Detective Magnifier Illustration)
 */
export const DetectiveMagnifierIllustration: React.FC<{ className?: string }> = ({ className = 'w-full h-auto' }) => (
  <svg viewBox="0 0 460 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="detCardBg" x1="0" y1="0" x2="460" y2="160" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FEF3C7" />
        <stop offset="100%" stopColor="#FFEDD5" />
      </linearGradient>
    </defs>
    <rect width="460" height="160" rx="20" fill="url(#detCardBg)" />

    {/* Clue tracks in sand/grass */}
    <g opacity="0.4" fill="#92400E">
      <ellipse cx="60" cy="110" rx="5" ry="3" />
      <circle cx="56" cy="103" r="1.5" />
      <circle cx="60" cy="102" r="1.5" />
      <circle cx="64" cy="103" r="1.5" />

      <ellipse cx="100" cy="90" rx="5" ry="3" />
      <circle cx="96" cy="83" r="1.5" />
      <circle cx="100" cy="82" r="1.5" />
      <circle cx="104" cy="83" r="1.5" />

      <ellipse cx="150" cy="105" rx="5" ry="3" />
      <circle cx="146" cy="98" r="1.5" />
      <circle cx="150" cy="97" r="1.5" />
      <circle cx="154" cy="98" r="1.5" />
    </g>

    {/* Center: Friendly Detective Owl with Magnifying Glass */}
    <g transform="translate(180, 15)">
      {/* Body */}
      <ellipse cx="50" cy="55" rx="30" ry="36" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
      <ellipse cx="50" cy="62" rx="20" ry="24" fill="#FEF3C7" />

      {/* Detective Hat */}
      <ellipse cx="50" cy="22" rx="34" ry="7" fill="#78350F" />
      <path d="M 30 22 C 30 5 70 5 70 22 Z" fill="#92400E" />
      <rect x="30" y="18" width="40" height="4" fill="#B45309" />

      {/* Eyes */}
      <circle cx="38" cy="46" r="12" fill="#FFFFFF" stroke="#B45309" strokeWidth="2" />
      <circle cx="62" cy="46" r="12" fill="#FFFFFF" stroke="#B45309" strokeWidth="2" />
      <circle cx="40" cy="46" r="6" fill="#1C1917" />
      <circle cx="60" cy="46" r="6" fill="#1C1917" />
      <circle cx="38" cy="44" r="2" fill="#FFFFFF" />
      <circle cx="58" cy="44" r="2" fill="#FFFFFF" />

      {/* Beak */}
      <polygon points="50,52 44,58 56,58" fill="#EA580C" />

      {/* Big Wooden Magnifying Glass */}
      <g transform="translate(65, 30)">
        <line x1="28" y1="28" x2="48" y2="48" stroke="#78350F" strokeWidth="6" strokeLinecap="round" />
        <circle cx="18" cy="18" r="22" fill="#E0F2FE" fillOpacity="0.85" stroke="#92400E" strokeWidth="4" />
        <path d="M 6 12 A 16 16 0 0 1 24 6" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <text x="18" y="24" fontSize="18" textAnchor="middle">💡</text>
      </g>
    </g>

    {/* Left Pill: Fact vs Guess */}
    <g transform="translate(30, 45)">
      <rect width="115" height="48" rx="14" fill="#FFFFFF" stroke="#FDE68A" strokeWidth="2" />
      <text x="57" y="22" fontSize="12" fill="#92400E" textAnchor="middle" fontWeight="bold">🔎 看事实</text>
      <text x="57" y="38" fontSize="10" fill="#B45309" textAnchor="middle">眼睛真正看到的</text>
    </g>

    {/* Right Pill: Try New Perspective */}
    <g transform="translate(315, 45)">
      <rect width="115" height="48" rx="14" fill="#FFFFFF" stroke="#FDE68A" strokeWidth="2" />
      <text x="57" y="22" fontSize="12" fill="#92400E" textAnchor="middle" fontWeight="bold">⚖️ 试新想法</text>
      <text x="57" y="38" fontSize="10" fill="#B45309" textAnchor="middle">把大难题拆碎碎</text>
    </g>

    {/* Bottom caption */}
    <g transform="translate(100, 128)">
      <rect width="260" height="22" rx="11" fill="#FFFFFF" stroke="#FED7AA" strokeWidth="1" />
      <text x="130" y="15" fontSize="11" fill="#9A3412" textAnchor="middle" fontWeight="bold">
        动动手找线索 · 脑子里的猜测不等于事实
      </text>
    </g>
  </svg>
);

