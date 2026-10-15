import React from 'react';

/**
 * 晴雨小岛 · 绘本级原创矢量故事情境插画集 (Storybook Vector Illustration Kit)
 * 100% 纯本地 SVG 矢量绘制，零外部网络依赖，永不破碎。
 * 遵循 6 岁儿童适龄认知与低文字密度设计，彻底杜绝 Unicode Emoji 跨平台豆腐块 (▯) 隐患。
 */

/* -------------------------------------------------------------------------- */
/* 1. 晴雨小岛全景全景图 (Island Panorama Illustration)                       */
/* -------------------------------------------------------------------------- */
export const IslandPanoramaIllustration: React.FC<{ className?: string }> = ({
  className = 'w-full h-auto',
}) => (
  <svg
    viewBox="0 0 800 280"
    preserveAspectRatio="xMidYMid slice"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label="晴雨小岛全景绘本插画"
  >
    <defs>
      <linearGradient id="si-skyGrad" x1="0" y1="0" x2="800" y2="280" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#BAE6FD" />
        <stop offset="45%" stopColor="#E0F2FE" />
        <stop offset="75%" stopColor="#FEF3C7" />
        <stop offset="100%" stopColor="#FED7AA" />
      </linearGradient>
      <linearGradient id="si-sunGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
      <linearGradient id="si-hillLeft" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#86EFAC" />
        <stop offset="100%" stopColor="#22C55E" />
      </linearGradient>
      <linearGradient id="si-hillRight" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#A7F3D0" />
        <stop offset="100%" stopColor="#10B981" />
      </linearGradient>
      <linearGradient id="si-seaGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#0284C7" />
      </linearGradient>
      <linearGradient id="si-rainbowGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#FDA4AF" stopOpacity="0.75" />
        <stop offset="25%" stopColor="#FDE047" stopOpacity="0.75" />
        <stop offset="50%" stopColor="#86EFAC" stopOpacity="0.75" />
        <stop offset="75%" stopColor="#93C5FD" stopOpacity="0.75" />
        <stop offset="100%" stopColor="#C4B5FD" stopOpacity="0.75" />
      </linearGradient>
      <filter id="si-softGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    {/* 渐变天空底色 */}
    <rect width="800" height="280" fill="url(#si-skyGrad)" />

    {/* 柔和七色彩虹弧线 */}
    <path
      d="M 160 195 A 160 120 0 0 1 500 195"
      stroke="url(#si-rainbowGrad)"
      strokeWidth="12"
      strokeLinecap="round"
      opacity="0.7"
    />

    {/* 温暖微笑的远方太阳 */}
    <circle cx="645" cy="96" r="34" fill="url(#si-sunGrad)" filter="url(#si-softGlow)" opacity="0.9" />
    <circle cx="645" cy="96" r="24" fill="#FEF08A" />
    {/* 太阳光芒 */}
    <g stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" opacity="0.8">
      <line x1="645" y1="58" x2="645" y2="50" />
      <line x1="645" y1="134" x2="645" y2="142" />
      <line x1="607" y1="96" x2="599" y2="96" />
      <line x1="683" y1="96" x2="691" y2="96" />
      <line x1="618" y1="69" x2="612" y2="63" />
      <line x1="672" y1="123" x2="678" y2="129" />
      <line x1="618" y1="123" x2="612" y2="129" />
      <line x1="672" y1="69" x2="678" y2="63" />
    </g>

    {/* 漂浮的白云与微风雨丝 */}
    <g fill="#FFFFFF" opacity="0.88">
      <ellipse cx="220" cy="86" rx="38" ry="15" />
      <ellipse cx="242" cy="78" rx="26" ry="18" />
      <ellipse cx="200" cy="88" rx="22" ry="12" />

      <ellipse cx="465" cy="100" rx="32" ry="14" />
      <ellipse cx="485" cy="92" rx="24" ry="16" />

      {/* 左侧云下的轻柔雨点 */}
      <line x1="202" y1="106" x2="197" y2="118" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" opacity="0.65" />
      <line x1="220" y1="108" x2="215" y2="120" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" opacity="0.65" />
      <line x1="238" y1="105" x2="233" y2="117" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" opacity="0.65" />
    </g>

    {/* 蔚蓝大海 */}
    <path d="M 0 182 Q 200 174 400 186 T 800 182 L 800 280 L 0 280 Z" fill="url(#si-seaGrad)" />

    {/* 碧绿群岛与山丘 */}
    <path d="M -20 215 Q 150 118 330 215 L 330 280 L -20 280 Z" fill="url(#si-hillLeft)" />
    <path d="M 430 220 Q 630 124 820 220 L 820 280 L 430 280 Z" fill="url(#si-hillRight)" />
    <path d="M 245 230 Q 400 142 555 230 Z" fill="#6EE7B7" opacity="0.85" />

    {/* 连结两个家的木质拱桥 */}
    <path d="M 300 196 Q 390 170 480 196" stroke="#92400E" strokeWidth="7" strokeLinecap="round" />
    <path d="M 300 200 Q 390 174 480 200" stroke="#B45309" strokeWidth="3.5" strokeLinecap="round" />
    <line x1="330" y1="190" x2="330" y2="208" stroke="#78350F" strokeWidth="3" />
    <line x1="370" y1="181" x2="370" y2="202" stroke="#78350F" strokeWidth="3" />
    <line x1="410" y1="181" x2="410" y2="202" stroke="#78350F" strokeWidth="3" />
    <line x1="450" y1="190" x2="450" y2="208" stroke="#78350F" strokeWidth="3" />

    {/* 左岸温馨小木屋 (妈妈家) */}
    <g transform="translate(150, 136)">
      <rect x="0" y="18" width="34" height="26" rx="4" fill="#FEF3C7" stroke="#D97706" strokeWidth="2" />
      <polygon points="17,0 -4,20 38,20" fill="#F87171" stroke="#DC2626" strokeWidth="2" />
      <rect x="11" y="29" width="11" height="15" rx="2" fill="#B45309" />
      <rect x="5" y="22" width="7" height="7" rx="1" fill="#FEF08A" stroke="#D97706" strokeWidth="1" />
      {/* 门前小花 */}
      <circle cx="-6" cy="40" r="2.5" fill="#F43F5E" />
      <circle cx="-2" cy="42" r="2" fill="#FEF08A" />
    </g>

    {/* 右岸温馨小木屋 (爸爸家) */}
    <g transform="translate(605, 140)">
      <rect x="0" y="18" width="36" height="26" rx="4" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2" />
      <polygon points="18,0 -4,20 40,20" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />
      <rect x="12" y="29" width="11" height="15" rx="2" fill="#0369A1" />
      <circle cx="26" cy="26" r="3.5" fill="#FEF08A" stroke="#0284C7" strokeWidth="1" />
      {/* 小望远镜标志 */}
      <line x1="38" y1="16" x2="46" y2="10" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" />
    </g>

    {/* 故事之树 */}
    <g transform="translate(362, 130)">
      <rect x="15" y="26" width="7" height="22" fill="#78350F" rx="2" />
      <circle cx="19" cy="20" r="20" fill="#059669" />
      <circle cx="10" cy="17" r="14" fill="#10B981" />
      <circle cx="27" cy="17" r="13" fill="#34D399" />
    </g>

    {/* 友谊小帆船 */}
    <g transform="translate(374, 196)">
      <path d="M 0 10 L 28 10 L 22 17 L 4 17 Z" fill="#92400E" />
      <line x1="14" y1="10" x2="14" y2="0" stroke="#78350F" strokeWidth="2" />
      <polygon points="14,2 26,9 14,9" fill="#FDE047" />
      <polygon points="12,3 2,9 12,9" fill="#FFFFFF" />
    </g>
  </svg>
);

/* -------------------------------------------------------------------------- */
/* 2. 猫头鹰伙伴单独插画 (Owl Companion Illustration)                         */
/* -------------------------------------------------------------------------- */
export const OwlCompanionIllustration: React.FC<{ className?: string }> = ({
  className = 'w-16 h-16',
}) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label="猫头鹰伙伴插画"
  >
    <defs>
      <linearGradient id="si-owlBody" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#6366F1" />
        <stop offset="100%" stopColor="#4338CA" />
      </linearGradient>
      <linearGradient id="si-owlBelly" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#EEF2FF" />
        <stop offset="100%" stopColor="#C7D2FE" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="46" fill="#EEF2FF" />
    <circle cx="50" cy="50" r="44" stroke="#818CF8" strokeWidth="2" />

    {/* 羽簇 */}
    <polygon points="26,22 36,40 22,34" fill="#312E81" />
    <polygon points="74,22 64,40 78,34" fill="#312E81" />

    {/* 身体 */}
    <ellipse cx="50" cy="55" rx="34" ry="32" fill="url(#si-owlBody)" />

    {/* 肚皮羽毛 */}
    <ellipse cx="50" cy="62" rx="22" ry="20" fill="url(#si-owlBelly)" />
    <path d="M 44 56 Q 50 60 56 56" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" />
    <path d="M 40 64 Q 50 68 60 64" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" />
    <path d="M 45 72 Q 50 75 55 72" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" />

    {/* 金黄圆大眼 */}
    <circle cx="36" cy="45" r="14" fill="#FFFFFF" stroke="#FBBF24" strokeWidth="2" />
    <circle cx="64" cy="45" r="14" fill="#FFFFFF" stroke="#FBBF24" strokeWidth="2" />
    <circle cx="38" cy="45" r="7" fill="#1C1917" />
    <circle cx="62" cy="45" r="7" fill="#1C1917" />
    <circle cx="36" cy="43" r="2.5" fill="#FFFFFF" />
    <circle cx="60" cy="43" r="2.5" fill="#FFFFFF" />

    {/* 橘黄喙 */}
    <polygon points="50,49 44,56 56,56" fill="#EA580C" />

    {/* 星光羽翼 */}
    <path d="M 18 50 Q 14 65 24 75 Q 26 65 24 55 Z" fill="#312E81" />
    <path d="M 82 50 Q 86 65 76 75 Q 74 65 76 55 Z" fill="#312E81" />
    <circle cx="20" cy="62" r="1.5" fill="#FDE047" />
    <circle cx="80" cy="62" r="1.5" fill="#FDE047" />

    {/* 爪子 */}
    <ellipse cx="42" cy="86" rx="6" ry="3" fill="#EA580C" />
    <ellipse cx="58" cy="86" rx="6" ry="3" fill="#EA580C" />
  </svg>
);

/* -------------------------------------------------------------------------- */
/* 3. 杯子尺度多视角认知插画 (Cup Scale Interactive Illustration)             */
/* -------------------------------------------------------------------------- */
export const CupScaleInteractiveIllustration: React.FC<{
  perspective: 'neutral' | 'squirrel' | 'elephant';
  className?: string;
}> = ({ perspective, className = 'w-full h-auto' }) => (
  <svg
    viewBox="0 0 460 220"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label="杯子大小的多视角思考插画"
  >
    <defs>
      <linearGradient id="si-tableWood" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FDE68A" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
      <linearGradient id="si-cupBlue" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#38BDF8" />
        <stop offset="50%" stopColor="#0284C7" />
        <stop offset="100%" stopColor="#0369A1" />
      </linearGradient>
    </defs>

    {/* 室内桌面柔和底板 */}
    <rect width="460" height="220" rx="20" fill="#F8FAFC" />
    <rect x="20" y="150" width="420" height="50" rx="10" fill="url(#si-tableWood)" stroke="#D97706" strokeWidth="2" />

    {/* 1. 左侧：小积木与松鼠视角（纯矢量，无 emoji 豆腐块） */}
    <g transform="translate(40, 50)">
      <g className={`transition-all duration-300 [transform-box:fill-box] origin-center ${perspective === 'squirrel' ? 'scale-105 opacity-100' : 'opacity-85'}`}>
        {/* 小积木 */}
        <rect x="35" y="80" width="22" height="22" rx="4" fill="#F87171" stroke="#DC2626" strokeWidth="2" />
        <text x="46" y="96" fontSize="12" fill="#FFFFFF" textAnchor="middle" fontWeight="bold">积木</text>

        {/* 可爱小松鼠 */}
        <circle cx="20" cy="75" r="14" fill="#D97706" />
        <circle cx="16" cy="72" r="2" fill="#000" />
        <polygon points="12,64 16,70 10,70" fill="#B45309" />
        <path d="M 8 82 Q -4 70 2 56 Q 14 62 14 74 Z" fill="#B45309" />

        {/* 矢量小高山图标 */}
        <g transform="translate(18, 120)">
          <polygon points="6,0 0,10 12,10" fill="#10B981" />
          <polygon points="11,2 7,10 15,10" fill="#059669" />
        </g>
        <text x="36" y="112" fontSize="11" fill="#78350F" fontWeight="bold">小积木看它</text>
        <text x="36" y="127" fontSize="10" fill="#0284C7">像座大高山！</text>
      </g>
    </g>

    {/* 2. 中间：客观事实杯子 (10cm) */}
    <g transform="translate(195, 45)">
      <ellipse cx="35" cy="110" rx="32" ry="7" fill="#CBD5E1" opacity="0.6" />
      <path
        d="M 12 25 L 18 105 Q 35 110 52 105 L 58 25 Z"
        fill="url(#si-cupBlue)"
        stroke="#0284C7"
        strokeWidth="3"
      />
      {/* 杯柄 */}
      <path
        d="M 54 40 Q 75 42 75 65 Q 75 88 51 86"
        fill="none"
        stroke="#0284C7"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <ellipse cx="35" cy="25" rx="23" ry="7" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2" />
      <ellipse cx="35" cy="40" rx="19" ry="5" fill="#BAE6FD" opacity="0.8" />

      {/* 事实铭牌 */}
      <rect x="0" y="116" width="70" height="20" rx="6" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="1" />
      <text x="35" y="130" fontSize="11" fill="#0369A1" textAnchor="middle" fontWeight="bold">
        杯子：高10厘米
      </text>
    </g>

    {/* 3. 右侧：大水桶与小象视角（纯矢量，无 emoji 豆腐块） */}
    <g transform="translate(300, 30)">
      <g className={`transition-all duration-300 [transform-box:fill-box] origin-center ${perspective === 'elephant' ? 'scale-105 opacity-100' : 'opacity-85'}`}>
        {/* 大水桶 */}
        <path d="M 30 40 L 40 120 L 105 120 L 115 40 Z" fill="#94A3B8" stroke="#475569" strokeWidth="2" />
        <ellipse cx="72" cy="40" rx="42" ry="9" fill="#CBD5E1" stroke="#475569" strokeWidth="2" />
        <path d="M 30 40 Q 72 -5 115 40" fill="none" stroke="#334155" strokeWidth="3" />

        {/* 矢量水滴与小象 */}
        <circle cx="125" cy="50" r="16" fill="#94A3B8" />
        <path d="M 135 56 Q 148 65 142 80" stroke="#94A3B8" strokeWidth="5" strokeLinecap="round" fill="none" />
        <circle cx="122" cy="48" r="2" fill="#000" />

        {/* 矢量小水滴图标 */}
        <path d="M 72 144 C 72 144 68 149 68 152 A 4 4 0 0 0 76 152 C 76 149 72 144 72 144 Z" fill="#38BDF8" />

        <text x="75" y="136" fontSize="11" fill="#334155" fontWeight="bold" textAnchor="middle">大水桶看它</text>
        <text x="75" y="150" fontSize="10" fill="#64748B" textAnchor="middle">好小一滴水！</text>
      </g>
    </g>
  </svg>
);

/* -------------------------------------------------------------------------- */
/* 4. 情绪双面晴雨插画 (Rain Weather Dual Perspective Illustration)           */
/* -------------------------------------------------------------------------- */
export const RainWeatherIllustration: React.FC<{
  focusSide: 'both' | 'frog' | 'rabbit';
  className?: string;
}> = ({ focusSide, className = 'w-full h-auto' }) => (
  <svg
    viewBox="0 0 460 220"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label="雨天的两种心情双视角插画"
  >
    <defs>
      <linearGradient id="si-rainSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#94A3B8" />
        <stop offset="40%" stopColor="#CBD5E1" />
        <stop offset="100%" stopColor="#F1F5F9" />
      </linearGradient>
    </defs>

    {/* 下雨氛围背景 */}
    <rect width="460" height="220" rx="20" fill="url(#si-rainSky)" />

    {/* 雨丝 */}
    <g stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" opacity="0.65">
      <line x1="40" y1="20" x2="30" y2="45" />
      <line x1="90" y1="35" x2="80" y2="60" />
      <line x1="150" y1="15" x2="140" y2="40" />
      <line x1="220" y1="30" x2="210" y2="55" />
      <line x1="310" y1="25" x2="300" y2="50" />
      <line x1="390" y1="15" x2="380" y2="40" />
      <line x1="430" y1="40" x2="420" y2="65" />
    </g>

    {/* 绿地草坪 */}
    <path d="M 0 170 Q 230 155 460 170 L 460 220 L 0 220 Z" fill="#86EFAC" />

    {/* 中间硬币两面虚线 */}
    <line x1="230" y1="20" x2="230" y2="200" stroke="#94A3B8" strokeWidth="2" strokeDasharray="4 4" opacity="0.5" />

    {/* 面 A：喜欢玩水欢呼的小青蛙（纯矢量，无 emoji 豆腐块） */}
    <g transform="translate(40, 70)">
      <g className={`transition-transform duration-300 [transform-box:fill-box] origin-center ${focusSide === 'frog' ? 'scale-105' : ''}`}>
        <ellipse cx="65" cy="95" rx="50" ry="18" fill="#38BDF8" opacity="0.8" />
        <ellipse cx="55" cy="92" rx="22" ry="8" fill="#22C55E" />

        {/* 青蛙身体 */}
        <ellipse cx="55" cy="75" rx="18" ry="14" fill="#4ADE80" stroke="#16A34A" strokeWidth="2" />
        <circle cx="48" cy="64" r="6" fill="#4ADE80" stroke="#16A34A" strokeWidth="1.5" />
        <circle cx="62" cy="64" r="6" fill="#4ADE80" stroke="#16A34A" strokeWidth="1.5" />
        <circle cx="48" cy="64" r="2.5" fill="#000" />
        <circle cx="62" cy="64" r="2.5" fill="#000" />
        <path d="M 48 78 Q 55 84 62 78" stroke="#15803D" strokeWidth="2" strokeLinecap="round" />

        {/* 荷叶雨伞 */}
        <path d="M 70 70 Q 80 50 92 65 Z" fill="#15803D" />
        <line x1="80" y1="58" x2="80" y2="78" stroke="#166534" strokeWidth="2" />

        {/* 纯矢量青蛙图标铭牌 */}
        <rect x="15" y="105" width="105" height="26" rx="8" fill="#DCFCE7" stroke="#86EFAC" strokeWidth="1" />
        <circle cx="28" cy="118" r="4.5" fill="#4ADE80" stroke="#15803D" strokeWidth="1" />
        <text x="70" y="122" fontSize="11" fill="#15803D" textAnchor="middle" fontWeight="black">
          小青蛙：太好玩啦！
        </text>
      </g>
    </g>

    {/* 面 B：因为风筝湿了有些沮丧的小兔子（纯矢量，无 emoji 豆腐块） */}
    <g transform="translate(270, 70)">
      <g className={`transition-transform duration-300 [transform-box:fill-box] origin-center ${focusSide === 'rabbit' ? 'scale-105' : ''}`}>
        {/* 遮雨蘑菇 */}
        <path d="M 30 75 Q 70 20 110 75 Z" fill="#F87171" stroke="#DC2626" strokeWidth="2" />
        <circle cx="50" cy="55" r="4" fill="#FFFFFF" />
        <circle cx="75" cy="45" r="5" fill="#FFFFFF" />
        <circle cx="95" cy="60" r="3" fill="#FFFFFF" />
        <rect x="62" y="75" width="16" height="35" rx="3" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />

        {/* 躲雨小兔 */}
        <ellipse cx="65" cy="98" rx="12" ry="12" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
        <ellipse cx="58" cy="80" rx="3" ry="10" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" transform="rotate(-15 58 80)" />
        <ellipse cx="72" cy="80" rx="3" ry="10" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" transform="rotate(15 72 80)" />
        <circle cx="61" cy="95" r="1.5" fill="#000" />
        <circle cx="69" cy="95" r="1.5" fill="#000" />

        {/* 湿漉漉的风筝 */}
        <polygon points="120,95 132,85 144,95 132,105" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
        <line x1="120" y1="95" x2="144" y2="95" stroke="#B45309" strokeWidth="1" />
        <line x1="132" y1="85" x2="132" y2="105" stroke="#B45309" strokeWidth="1" />

        {/* 纯矢量兔子图标铭牌 */}
        <rect x="15" y="105" width="130" height="26" rx="8" fill="#FEE2E2" stroke="#FCA5A5" strokeWidth="1" />
        <circle cx="28" cy="118" r="4.5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
        <text x="82" y="122" fontSize="11" fill="#B91C1C" textAnchor="middle" fontWeight="black">
          小兔：风筝飞不起来了
        </text>
      </g>
    </g>
  </svg>
);

/* -------------------------------------------------------------------------- */
/* 5. 小岛地点徽章插画 (Location Badge Illustration)                          */
/* -------------------------------------------------------------------------- */
export const LocationBadgeIllustration: React.FC<{
  type: 'weather' | 'story' | 'detective' | 'courage' | 'bridge' | 'starlight' | 'calm';
  className?: string;
}> = ({ type, className = 'w-12 h-12' }) => {
  switch (type) {
    case 'weather':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} role="img" aria-label="情绪天气站">
          <circle cx="26" cy="26" r="14" fill="#FBBF24" />
          <path d="M 22 46 L 46 46 A 12 12 0 0 0 46 22 A 14 14 0 0 0 24 28 A 10 10 0 0 0 22 46 Z" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="2.5" />
          <path d="M 26 50 L 23 56 M 34 50 L 31 56 M 42 50 L 39 56" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'story':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} role="img" aria-label="故事小树林">
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
        <svg viewBox="0 0 64 64" fill="none" className={className} role="img" aria-label="想法侦探社">
          <circle cx="28" cy="28" r="16" fill="#FEF3C7" stroke="#D97706" strokeWidth="3.5" />
          <circle cx="28" cy="28" r="10" fill="#E0F2FE" opacity="0.8" />
          <line x1="40" y1="40" x2="54" y2="54" stroke="#92400E" strokeWidth="5" strokeLinecap="round" />
          <circle cx="28" cy="28" r="3" fill="#D97706" />
        </svg>
      );
    case 'courage':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} role="img" aria-label="勇气说话屋">
          <path d="M 12 16 Q 12 10 18 10 L 46 10 Q 52 10 52 16 L 52 38 Q 52 44 46 44 L 28 44 L 16 54 L 18 44 L 18 44 Q 12 44 12 38 Z" fill="#FFE4E6" stroke="#E11D48" strokeWidth="2.5" />
          <path d="M 32 20 C 32 18 29 16 26 18 C 22 20 22 26 32 32 C 42 26 42 20 38 18 C 35 16 32 18 32 20 Z" fill="#F43F5E" />
        </svg>
      );
    case 'bridge':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} role="img" aria-label="两个家的桥">
          <path d="M 8 46 Q 32 24 56 46" stroke="#92400E" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          <path d="M 8 50 Q 32 28 56 50" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <line x1="20" y1="36" x2="20" y2="52" stroke="#78350F" strokeWidth="2" />
          <line x1="32" y1="30" x2="32" y2="50" stroke="#78350F" strokeWidth="2" />
          <line x1="44" y1="36" x2="44" y2="52" stroke="#78350F" strokeWidth="2" />
        </svg>
      );
    case 'starlight':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} role="img" aria-label="星光小屋">
          <polygon points="32,8 39,24 56,26 43,38 47,55 32,46 17,55 21,38 8,26 25,24" fill="#FDE047" stroke="#F59E0B" strokeWidth="2.5" />
          <circle cx="32" cy="30" r="4" fill="#FFFFFF" />
        </svg>
      );
    case 'calm':
    default:
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} role="img" aria-label="安心平静角">
          <circle cx="32" cy="32" r="22" fill="#CCFBF1" stroke="#0D9488" strokeWidth="2.5" />
          <path d="M 22 34 Q 32 20 42 34 Q 32 44 22 34 Z" fill="#14B8A6" />
          <line x1="22" y1="34" x2="42" y2="34" stroke="#0F766E" strokeWidth="1.5" />
        </svg>
      );
  }
};

/* -------------------------------------------------------------------------- */
/* 6. 勇气说话屋 · 温暖盾牌插画 (Courage Shield Illustration)                */
/* -------------------------------------------------------------------------- */
export const CourageShieldIllustration: React.FC<{ className?: string }> = ({
  className = 'w-full h-auto',
}) => (
  <svg
    viewBox="0 0 460 180"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label="勇气盾牌插画"
  >
    <defs>
      <linearGradient id="si-courageBg" x1="0" y1="0" x2="460" y2="180" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFF1F2" />
        <stop offset="100%" stopColor="#FFE4E6" />
      </linearGradient>
      <linearGradient id="si-shieldGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FDA4AF" />
        <stop offset="100%" stopColor="#F43F5E" />
      </linearGradient>
      <linearGradient id="si-lionGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FDE68A" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
    </defs>
    <rect width="460" height="180" rx="20" fill="url(#si-courageBg)" />

    <circle cx="70" cy="45" r="8" fill="#FECDD3" opacity="0.6" />
    <circle cx="390" cy="40" r="12" fill="#FECDD3" opacity="0.6" />
    <circle cx="410" cy="120" r="7" fill="#FECDD3" opacity="0.5" />
    <circle cx="50" cy="130" r="10" fill="#FECDD3" opacity="0.5" />

    {/* 中心守护小熊 */}
    <g transform="translate(160, 20)">
      <circle cx="45" cy="42" r="14" fill="#D97706" />
      <circle cx="45" cy="42" r="8" fill="#FEF3C7" />
      <circle cx="95" cy="42" r="14" fill="#D97706" />
      <circle cx="95" cy="42" r="8" fill="#FEF3C7" />

      <circle cx="70" cy="62" r="32" fill="url(#si-lionGrad)" stroke="#D97706" strokeWidth="2" />
      <ellipse cx="70" cy="72" rx="14" ry="10" fill="#FEF3C7" />
      <ellipse cx="70" cy="68" rx="5" ry="3.5" fill="#78350F" />
      <path d="M 67 73 Q 70 76 73 73" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" />

      <circle cx="58" cy="58" r="3.5" fill="#1C1917" />
      <circle cx="82" cy="58" r="3.5" fill="#1C1917" />
      <circle cx="57" cy="57" r="1.2" fill="#FFFFFF" />
      <circle cx="81" cy="57" r="1.2" fill="#FFFFFF" />
      <circle cx="50" cy="68" r="4.5" fill="#FDA4AF" opacity="0.8" />
      <circle cx="90" cy="68" r="4.5" fill="#FDA4AF" opacity="0.8" />

      <ellipse cx="70" cy="115" rx="36" ry="28" fill="#D97706" />

      {/* 守护爱心盾牌 */}
      <g transform="translate(32, 70)">
        <path
          d="M 38 0 C 60 0 76 10 76 30 C 76 65 38 85 38 85 C 38 85 0 65 0 30 C 0 10 16 0 38 0 Z"
          fill="url(#si-shieldGrad)"
          stroke="#E11D48"
          strokeWidth="3"
        />
        <path
          d="M 38 24 C 38 20 33 16 28 18 C 22 21 23 28 38 42 C 53 28 54 21 48 18 C 43 16 38 20 38 24 Z"
          fill="#FFFFFF"
        />
      </g>
    </g>

    {/* 左气泡：有权说“不” */}
    <g transform="translate(25, 45)">
      <rect width="125" height="52" rx="14" fill="#FFFFFF" stroke="#FECDD3" strokeWidth="2" />
      <polygon points="124,26 138,34 124,40" fill="#FFFFFF" stroke="#FECDD3" strokeWidth="2" />
      <rect x="122" y="25" width="4" height="16" fill="#FFFFFF" />
      <text x="62" y="24" fontSize="13" fill="#BE123C" textAnchor="middle" fontWeight="bold">我有权说“不”</text>
      <text x="62" y="42" fontSize="11" fill="#881337" textAnchor="middle">保护自己的身体与心</text>
    </g>

    {/* 右气泡：有话可以讲 */}
    <g transform="translate(305, 45)">
      <rect width="130" height="52" rx="14" fill="#FFFFFF" stroke="#FECDD3" strokeWidth="2" />
      <polygon points="6,26 -8,34 6,40" fill="#FFFFFF" stroke="#FECDD3" strokeWidth="2" />
      <rect x="4" y="25" width="4" height="16" fill="#FFFFFF" />
      <text x="65" y="24" fontSize="13" fill="#BE123C" textAnchor="middle" fontWeight="bold">我有话可以讲</text>
      <text x="65" y="42" fontSize="11" fill="#881337" textAnchor="middle">告诉身边可信的大人</text>
    </g>
  </svg>
);

/* -------------------------------------------------------------------------- */
/* 7. 星光小屋 · 完整拼图插画 (Starlight Puzzle Illustration)                 */
/* -------------------------------------------------------------------------- */
export const StarlightPuzzleIllustration: React.FC<{ className?: string }> = ({
  className = 'w-full h-auto',
}) => (
  <svg
    viewBox="0 0 460 180"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label="我是谁的丰富拼图插画"
  >
    <defs>
      <linearGradient id="si-nightSky" x1="0" y1="0" x2="460" y2="180" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#1E1B4B" />
        <stop offset="50%" stopColor="#312E81" />
        <stop offset="100%" stopColor="#4338CA" />
      </linearGradient>
      <linearGradient id="si-starGlow" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
    </defs>
    <rect width="460" height="180" rx="20" fill="url(#si-nightSky)" />

    <g fill="#FDE047" opacity="0.8">
      <circle cx="50" cy="35" r="2.5" />
      <circle cx="110" cy="25" r="1.5" />
      <circle cx="80" cy="65" r="2" />
      <circle cx="380" cy="30" r="2.5" />
      <circle cx="420" cy="55" r="1.5" />
      <circle cx="360" cy="75" r="2" />
      <circle cx="400" cy="120" r="2" />
    </g>

    <path
      d="M 40 40 A 18 18 0 0 0 54 68 A 22 22 0 1 1 40 40 Z"
      fill="#FEF08A"
      opacity="0.9"
    />

    {/* 4 块咬合拼图（纯矢量图标，彻底消除 emoji 豆腐块） */}
    <g transform="translate(130, 12)">
      {/* 拼图 1：爱好与艺术 */}
      <rect x="0" y="0" width="95" height="54" rx="10" fill="#EC4899" stroke="#F472B6" strokeWidth="2" />
      {/* 矢量画板 */}
      <circle cx="47" cy="20" r="7" fill="#FDE68A" />
      <circle cx="44" cy="18" r="1.5" fill="#EF4444" />
      <circle cx="50" cy="18" r="1.5" fill="#3B82F6" />
      <text x="47" y="44" fontSize="11" fill="#FFFFFF" textAnchor="middle" fontWeight="bold">我的爱好</text>

      {/* 拼图 2：强项与善心 */}
      <rect x="105" y="0" width="95" height="54" rx="10" fill="#F59E0B" stroke="#FCD34D" strokeWidth="2" />
      {/* 矢量星星 */}
      <polygon points="152,14 154,19 159,19 155,22 157,27 152,24 147,27 149,22 145,19 150,19" fill="#FFFFFF" />
      <text x="152" y="44" fontSize="11" fill="#FFFFFF" textAnchor="middle" fontWeight="bold">我的强项</text>

      {/* 拼图 3：两个家之一 */}
      <rect x="0" y="62" width="95" height="54" rx="10" fill="#3B82F6" stroke="#93C5FD" strokeWidth="2" />
      {/* 矢量温馨小家 */}
      <polygon points="47,74 38,82 56,82" fill="#FFFFFF" />
      <rect x="41" y="82" width="12" height="7" fill="#FFFFFF" />
      <text x="47" y="106" fontSize="11" fill="#FFFFFF" textAnchor="middle" fontWeight="bold">两个家之一</text>

      {/* 拼图 4：正在长大 */}
      <rect x="105" y="62" width="95" height="54" rx="10" fill="#10B981" stroke="#6EE7B7" strokeWidth="2" />
      {/* 矢量小树苗 */}
      <path d="M152 86 V78 M152 80 C149 80 146 78 146 75 C149 75 152 77 152 80 M152 79 C155 79 158 77 158 74 C155 74 152 76 152 79" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <text x="152" y="106" fontSize="11" fill="#FFFFFF" textAnchor="middle" fontWeight="bold">正在长大</text>

      {/* 交叉点中心星芒 */}
      <circle cx="100" cy="58" r="15" fill="url(#si-starGlow)" />
      <polygon points="100,48 102,55 109,58 102,61 100,68 98,61 91,58 98,55" fill="#FFFFFF" />
    </g>

    {/* 底部暖心胶囊说明 */}
    <g transform="translate(90, 142)">
      <rect width="280" height="26" rx="13" fill="#312E81" stroke="#6366F1" strokeWidth="1" />
      <text x="140" y="17" fontSize="11" fill="#E0E7FF" textAnchor="middle" fontWeight="medium">
        家庭只是拼图中的一块 · 完整的你无比丰富灿烂
      </text>
    </g>
  </svg>
);

/* -------------------------------------------------------------------------- */
/* 8. 两个家的木桥近景插画 (Two Homes Bridge Card Illustration)               */
/* -------------------------------------------------------------------------- */
export const TwoHomesBridgeCardIllustration: React.FC<{ className?: string }> = ({
  className = 'w-full h-auto',
}) => (
  <svg
    viewBox="0 0 460 170"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label="两个家的桥亲子近景插画"
  >
    <defs>
      <linearGradient id="si-bridgeSky" x1="0" y1="0" x2="460" y2="170" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FEF3C7" />
        <stop offset="50%" stopColor="#E0F2FE" />
        <stop offset="100%" stopColor="#BAE6FD" />
      </linearGradient>
      <linearGradient id="si-streamGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#38BDF8" />
        <stop offset="100%" stopColor="#0284C7" />
      </linearGradient>
    </defs>
    <rect width="460" height="170" rx="20" fill="url(#si-bridgeSky)" />

    <path d="M 0 110 Q 120 70 240 110 Q 360 80 460 110 L 460 170 L 0 170 Z" fill="#BBF7D0" />
    <path d="M 160 170 L 210 110 L 250 110 L 300 170 Z" fill="url(#si-streamGrad)" opacity="0.8" />
    <line x1="215" y1="130" x2="235" y2="130" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
    <line x1="230" y1="145" x2="255" y2="145" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.7" />

    {/* 妈妈家（纯矢量小花，无 emoji） */}
    <g transform="translate(45, 60)">
      <rect x="0" y="25" width="60" height="40" rx="6" fill="#FEF08A" stroke="#EAB308" strokeWidth="2" />
      <polygon points="30,-5 -8,27 68,27" fill="#F87171" stroke="#DC2626" strokeWidth="2.5" />
      <rect x="22" y="38" width="16" height="27" rx="3" fill="#B45309" />
      <circle cx="14" cy="40" r="6" fill="#FFFFFF" stroke="#EAB308" strokeWidth="1.5" />
      {/* 矢量樱花 */}
      <circle cx="58" cy="74" r="3" fill="#F43F5E" />
      <circle cx="58" cy="74" r="1" fill="#FEF08A" />
      <text x="30" y="80" fontSize="12" fill="#78350F" textAnchor="middle" fontWeight="bold">妈妈家</text>
    </g>

    {/* 爸爸家（纯矢量小火箭，无 emoji） */}
    <g transform="translate(355, 60)">
      <rect x="0" y="25" width="60" height="40" rx="6" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2" />
      <polygon points="30,-5 -8,27 68,27" fill="#38BDF8" stroke="#0284C7" strokeWidth="2.5" />
      <rect x="22" y="38" width="16" height="27" rx="3" fill="#0369A1" />
      <rect x="10" y="35" width="12" height="12" rx="2" fill="#FEF08A" stroke="#0284C7" strokeWidth="1.5" />
      {/* 矢量小星光 */}
      <polygon points="60,70 61,73 64,74 61,75 60,78 59,75 56,74 59,73" fill="#0284C7" />
      <text x="30" y="80" fontSize="12" fill="#0369A1" textAnchor="middle" fontWeight="bold">爸爸家</text>
    </g>

    {/* 连接两岸的温暖木拱桥 */}
    <g transform="translate(145, 75)">
      <path d="M 0 45 Q 85 10 170 45" stroke="#92400E" strokeWidth="10" strokeLinecap="round" fill="none" />
      <path d="M 0 50 Q 85 15 170 50" stroke="#B45309" strokeWidth="5" strokeLinecap="round" fill="none" />

      <line x1="30" y1="36" x2="30" y2="58" stroke="#78350F" strokeWidth="3" />
      <line x1="65" y1="24" x2="65" y2="50" stroke="#78350F" strokeWidth="3" />
      <line x1="105" y1="24" x2="105" y2="50" stroke="#78350F" strokeWidth="3" />
      <line x1="140" y1="36" x2="140" y2="58" stroke="#78350F" strokeWidth="3" />

      <circle cx="30" cy="34" r="3" fill="#FDE047" />
      <circle cx="65" cy="22" r="3.5" fill="#FDE047" />
      <circle cx="85" cy="18" r="4" fill="#FDE047" />
      <circle cx="105" cy="22" r="3.5" fill="#FDE047" />
      <circle cx="140" cy="34" r="3" fill="#FDE047" />

      <path
        d="M 85 4 C 85 0 81 -4 77 -2 C 72 0 73 6 85 14 C 97 6 98 0 93 -2 C 89 -4 85 0 85 4 Z"
        fill="#F43F5E"
      />
    </g>

    <g transform="translate(110, 140)">
      <rect width="240" height="22" rx="11" fill="#FFFFFF" stroke="#FDE68A" strokeWidth="1" />
      <text x="120" y="15" fontSize="11" fill="#92400E" textAnchor="middle" fontWeight="bold">
        桥的两头都有爱 · 随时都能安心往来
      </text>
    </g>
  </svg>
);

/* -------------------------------------------------------------------------- */
/* 9. 情绪天气站 · 晴雨云彩矢量插画 (Weather Sun Cloud Illustration)          */
/* -------------------------------------------------------------------------- */
export const WeatherSunCloudIllustration: React.FC<{ className?: string }> = ({
  className = 'w-full h-auto',
}) => (
  <svg
    viewBox="0 0 460 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label="情绪天气站太阳与云朵插画"
  >
    <defs>
      <linearGradient id="si-weatherCardBg" x1="0" y1="0" x2="460" y2="160" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#E0F2FE" />
        <stop offset="100%" stopColor="#FEF3C7" />
      </linearGradient>
      <linearGradient id="si-warmSun" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
    </defs>
    <rect width="460" height="160" rx="20" fill="url(#si-weatherCardBg)" />

    {/* 温暖微笑的太阳 */}
    <g transform="translate(80, 20)">
      <circle cx="50" cy="50" r="36" fill="url(#si-warmSun)" />
      <line x1="50" y1="6" x2="50" y2="0" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
      <line x1="50" y1="94" x2="50" y2="100" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
      <line x1="6" y1="50" x2="0" y2="50" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
      <line x1="94" y1="50" x2="100" y2="50" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
      <line x1="19" y1="19" x2="14" y2="14" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
      <line x1="81" y1="81" x2="86" y2="86" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
      <line x1="19" y1="81" x2="14" y2="86" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
      <line x1="81" y1="19" x2="86" y2="14" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />

      <circle cx="40" cy="45" r="3.5" fill="#78350F" />
      <circle cx="60" cy="45" r="3.5" fill="#78350F" />
      <circle cx="39" cy="44" r="1.2" fill="#FFFFFF" />
      <circle cx="59" cy="44" r="1.2" fill="#FFFFFF" />
      <path d="M 40 56 Q 50 65 60 56" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <circle cx="32" cy="54" r="4" fill="#FDA4AF" opacity="0.8" />
      <circle cx="68" cy="54" r="4" fill="#FDA4AF" opacity="0.8" />
    </g>

    {/* 柔和可爱的云朵 */}
    <g transform="translate(230, 30)">
      <path
        d="M 30 60 A 24 24 0 0 1 68 32 A 32 32 0 0 1 125 36 A 26 26 0 0 1 155 60 A 22 22 0 0 1 145 85 L 35 85 A 25 25 0 0 1 30 60 Z"
        fill="#FFFFFF"
        stroke="#93C5FD"
        strokeWidth="2"
      />
      <circle cx="80" cy="58" r="3" fill="#1E293B" />
      <circle cx="105" cy="58" r="3" fill="#1E293B" />
      <path d="M 88 66 Q 92.5 72 97 66" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="72" cy="64" r="3.5" fill="#BAE6FD" />
      <circle cx="113" cy="64" r="3.5" fill="#BAE6FD" />

      {/* 轻柔雨丝 */}
      <line x1="55" y1="95" x2="50" y2="110" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="85" y1="98" x2="80" y2="113" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="115" y1="95" x2="110" y2="110" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
    </g>

    <g transform="translate(75, 128)">
      <rect width="310" height="24" rx="12" fill="#FFFFFF" stroke="#BAE6FD" strokeWidth="1" />
      <text x="155" y="16" fontSize="11" fill="#0369A1" textAnchor="middle" fontWeight="bold">
        无论晴天还是雨天，每种天气都有自己的道理
      </text>
    </g>
  </svg>
);

/* -------------------------------------------------------------------------- */
/* 10. 想法侦探社 · 放大镜插画 (Detective Magnifier Illustration)             */
/* -------------------------------------------------------------------------- */
export const DetectiveMagnifierIllustration: React.FC<{ className?: string }> = ({
  className = 'w-full h-auto',
}) => (
  <svg
    viewBox="0 0 460 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label="想法侦探社找线索插画"
  >
    <defs>
      <linearGradient id="si-detCardBg" x1="0" y1="0" x2="460" y2="160" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FEF3C7" />
        <stop offset="100%" stopColor="#FFEDD5" />
      </linearGradient>
    </defs>
    <rect width="460" height="160" rx="20" fill="url(#si-detCardBg)" />

    {/* 探案小脚印痕迹 */}
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

    {/* 中心：戴侦探帽的小猫头鹰拿着放大镜 */}
    <g transform="translate(180, 15)">
      <ellipse cx="50" cy="55" rx="30" ry="36" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
      <ellipse cx="50" cy="62" rx="20" ry="24" fill="#FEF3C7" />

      {/* 侦探帽 */}
      <ellipse cx="50" cy="22" rx="34" ry="7" fill="#78350F" />
      <path d="M 30 22 C 30 5 70 5 70 22 Z" fill="#92400E" />
      <rect x="30" y="18" width="40" height="4" fill="#B45309" />

      <circle cx="38" cy="46" r="12" fill="#FFFFFF" stroke="#B45309" strokeWidth="2" />
      <circle cx="62" cy="46" r="12" fill="#FFFFFF" stroke="#B45309" strokeWidth="2" />
      <circle cx="40" cy="46" r="6" fill="#1C1917" />
      <circle cx="60" cy="46" r="6" fill="#1C1917" />
      <circle cx="38" cy="44" r="2" fill="#FFFFFF" />
      <circle cx="58" cy="44" r="2" fill="#FFFFFF" />

      <polygon points="50,52 44,58 56,58" fill="#EA580C" />

      {/* 木柄大放大镜（纯矢量，无 emoji 灯泡） */}
      <g transform="translate(65, 30)">
        <line x1="28" y1="28" x2="48" y2="48" stroke="#78350F" strokeWidth="6" strokeLinecap="round" />
        <circle cx="18" cy="18" r="22" fill="#E0F2FE" fillOpacity="0.85" stroke="#92400E" strokeWidth="4" />
        <path d="M 6 12 A 16 16 0 0 1 24 6" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* 矢量小灯泡 */}
        <circle cx="18" cy="16" r="4.5" fill="#FDE047" stroke="#F59E0B" strokeWidth="1" />
        <rect x="16.5" y="20.5" width="3" height="2" fill="#92400E" />
      </g>
    </g>

    {/* 左胶囊：看事实（纯矢量放大镜） */}
    <g transform="translate(30, 45)">
      <rect width="115" height="48" rx="14" fill="#FFFFFF" stroke="#FDE68A" strokeWidth="2" />
      <circle cx="24" cy="22" r="4" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.2" />
      <line x1="27" y1="25" x2="30" y2="28" stroke="#0284C7" strokeWidth="1.5" strokeLinecap="round" />
      <text x="66" y="22" fontSize="12" fill="#92400E" textAnchor="middle" fontWeight="bold">看事实</text>
      <text x="57" y="38" fontSize="10" fill="#B45309" textAnchor="middle">眼睛真正看到的</text>
    </g>

    {/* 右胶囊：试新想法（纯矢量天平） */}
    <g transform="translate(315, 45)">
      <rect width="115" height="48" rx="14" fill="#FFFFFF" stroke="#FDE68A" strokeWidth="2" />
      <line x1="20" y1="20" x2="28" y2="20" stroke="#78350F" strokeWidth="1.5" />
      <line x1="24" y1="17" x2="24" y2="25" stroke="#78350F" strokeWidth="1.5" />
      <text x="66" y="22" fontSize="12" fill="#92400E" textAnchor="middle" fontWeight="bold">试新想法</text>
      <text x="57" y="38" fontSize="10" fill="#B45309" textAnchor="middle">把大难题拆碎碎</text>
    </g>

    <g transform="translate(100, 128)">
      <rect width="260" height="22" rx="11" fill="#FFFFFF" stroke="#FED7AA" strokeWidth="1" />
      <text x="130" y="15" fontSize="11" fill="#9A3412" textAnchor="middle" fontWeight="bold">
        动动手找线索 · 脑子里的猜测不等于事实
      </text>
    </g>
  </svg>
);

/* -------------------------------------------------------------------------- */
/* 11. 故事之树绘本场景插画 (Story Tree Grove Scene Illustration)             */
/* -------------------------------------------------------------------------- */
export const StoryTreeGroveSceneIllustration: React.FC<{ className?: string }> = ({
  className = 'w-full h-auto',
}) => (
  <svg
    viewBox="0 0 460 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label="故事小树林童话大树插画"
  >
    <defs>
      <linearGradient id="si-treeBg" x1="0" y1="0" x2="460" y2="200" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#ECFDF5" />
        <stop offset="100%" stopColor="#D1FAE5" />
      </linearGradient>
      <linearGradient id="si-treeFoliage" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#34D399" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
    </defs>
    <rect width="460" height="200" rx="20" fill="url(#si-treeBg)" />

    {/* 远方柔和林木 */}
    <ellipse cx="60" cy="180" rx="90" ry="40" fill="#A7F3D0" opacity="0.6" />
    <ellipse cx="400" cy="180" rx="90" ry="40" fill="#A7F3D0" opacity="0.6" />
    <path d="M 0 160 Q 230 140 460 160 L 460 200 L 0 200 Z" fill="#6EE7B7" />

    {/* 中心巨大童话树干 */}
    <g transform="translate(180, 20)">
      {/* 树干 */}
      <path d="M 35 160 Q 40 100 20 80 Q 50 85 50 50 Q 50 85 80 80 Q 60 100 65 160 Z" fill="#78350F" />
      {/* 树洞里的书架 */}
      <ellipse cx="50" cy="120" rx="12" ry="16" fill="#451A03" />
      <rect x="42" y="112" width="16" height="3" fill="#D97706" rx="1" />
      <rect x="44" y="118" width="4" height="8" fill="#EF4444" rx="0.5" />
      <rect x="49" y="117" width="4" height="9" fill="#3B82F6" rx="0.5" />
      <rect x="54" y="119" width="3" height="7" fill="#10B981" rx="0.5" />

      {/* 蓬松如云的树冠 */}
      <circle cx="50" cy="40" r="42" fill="url(#si-treeFoliage)" />
      <circle cx="15" cy="48" r="28" fill="#10B981" />
      <circle cx="85" cy="48" r="28" fill="#10B981" />
      <circle cx="35" cy="18" r="24" fill="#34D399" />
      <circle cx="65" cy="18" r="24" fill="#34D399" />

      {/* 树上挂着的暖光小灯笼 */}
      <line x1="20" y1="70" x2="20" y2="84" stroke="#D97706" strokeWidth="1.5" />
      <circle cx="20" cy="88" r="6" fill="#FEF08A" stroke="#F59E0B" strokeWidth="1.5" />
      <line x1="80" y1="70" x2="80" y2="84" stroke="#D97706" strokeWidth="1.5" />
      <circle cx="80" cy="88" r="6" fill="#FEF08A" stroke="#F59E0B" strokeWidth="1.5" />
    </g>

    {/* 树下阅读长椅 */}
    <g transform="translate(80, 130)">
      <rect x="0" y="20" width="60" height="6" rx="3" fill="#B45309" />
      <line x1="10" y1="26" x2="8" y2="38" stroke="#78350F" strokeWidth="3" />
      <line x1="50" y1="26" x2="52" y2="38" stroke="#78350F" strokeWidth="3" />
      {/* 翻开的故事书 */}
      <polygon points="22,14 30,12 30,18 22,20" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1" />
      <polygon points="38,14 30,12 30,18 38,20" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1" />
    </g>
  </svg>
);

/* -------------------------------------------------------------------------- */
/* 12. 玩具小船轮流玩协商插画 (Toy Boat Negotiation Scene Illustration)       */
/* -------------------------------------------------------------------------- */
export const ToyBoatNegotiationSceneIllustration: React.FC<{
  currentTurn?: 'friend_a' | 'friend_b';
  className?: string;
}> = ({ currentTurn = 'friend_a', className = 'w-full h-auto' }) => (
  <svg
    viewBox="0 0 460 190"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label="玩具小船轮流玩社交协商插画"
  >
    <defs>
      <linearGradient id="si-pondWater" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#BAE6FD" />
        <stop offset="100%" stopColor="#38BDF8" />
      </linearGradient>
    </defs>
    <rect width="460" height="190" rx="20" fill="#F0FDF4" />

    {/* 两侧河岸 */}
    <path d="M 0 40 Q 60 70 80 190 L 0 190 Z" fill="#86EFAC" />
    <path d="M 460 40 Q 400 70 380 190 L 460 190 Z" fill="#86EFAC" />

    {/* 清澈河流 */}
    <path d="M 80 40 Q 230 20 380 40 L 380 190 L 80 190 Z" fill="url(#si-pondWater)" />
    {/* 水波涟漪 */}
    <ellipse cx="230" cy="115" rx="70" ry="18" stroke="#FFFFFF" strokeWidth="2" opacity="0.6" strokeDasharray="6 6" />

    {/* 左侧小朋友码头 */}
    <g transform="translate(45, 90)">
      <rect x="0" y="20" width="45" height="10" rx="2" fill="#B45309" stroke="#78350F" strokeWidth="1.5" />
      <line x1="10" y1="30" x2="10" y2="50" stroke="#78350F" strokeWidth="3" />
      <line x1="35" y1="30" x2="35" y2="50" stroke="#78350F" strokeWidth="3" />
      {/* 轮流状态光环 */}
      {currentTurn === 'friend_a' && (
        <circle cx="22" cy="0" r="14" fill="#FEF08A" stroke="#F59E0B" strokeWidth="2" />
      )}
      <text x="22" y="5" fontSize="11" fill="#78350F" textAnchor="middle" fontWeight="bold">我的回合</text>
    </g>

    {/* 漂浮在水中央的小木帆船 */}
    <g transform={currentTurn === 'friend_b' ? 'translate(260, 95)' : 'translate(170, 95)'} className="transition-all duration-500">
      <path d="M 0 18 L 48 18 L 38 30 L 10 30 Z" fill="#92400E" stroke="#78350F" strokeWidth="2" />
      <line x1="24" y1="18" x2="24" y2="2" stroke="#78350F" strokeWidth="2.5" />
      <polygon points="24,4 42,15 24,15" fill="#FDE047" stroke="#D97706" strokeWidth="1.5" />
      <polygon points="22,6 8,15 22,15" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.5" />
    </g>

    {/* 右侧同伴码头 */}
    <g transform="translate(370, 90)">
      <rect x="0" y="20" width="45" height="10" rx="2" fill="#B45309" stroke="#78350F" strokeWidth="1.5" />
      <line x1="10" y1="30" x2="10" y2="50" stroke="#78350F" strokeWidth="3" />
      <line x1="35" y1="30" x2="35" y2="50" stroke="#78350F" strokeWidth="3" />
      {currentTurn === 'friend_b' && (
        <circle cx="22" cy="0" r="14" fill="#FEF08A" stroke="#F59E0B" strokeWidth="2" />
      )}
      <text x="22" y="5" fontSize="11" fill="#78350F" textAnchor="middle" fontWeight="bold">你的回合</text>
    </g>

    {/* 底部暖心低字提示 */}
    <g transform="translate(130, 155)">
      <rect width="200" height="24" rx="12" fill="#FFFFFF" stroke="#BAE6FD" strokeWidth="1" />
      <text x="100" y="16" fontSize="11" fill="#0369A1" textAnchor="middle" fontWeight="bold">
        定好小闹钟 · 一人开一趟
      </text>
    </g>
  </svg>
);

/* -------------------------------------------------------------------------- */
/* 13. 好友问家境温和社交插画 (Friend Asks Home Scene Illustration)            */
/* -------------------------------------------------------------------------- */
export const FriendAsksHomeSceneIllustration: React.FC<{ className?: string }> = ({
  className = 'w-full h-auto',
}) => (
  <svg
    viewBox="0 0 460 180"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label="伙伴友好交谈插画"
  >
    <defs>
      <linearGradient id="si-benchBg" x1="0" y1="0" x2="460" y2="180" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FEF3C7" />
        <stop offset="100%" stopColor="#FFFBEB" />
      </linearGradient>
    </defs>
    <rect width="460" height="180" rx="20" fill="url(#si-benchBg)" />

    {/* 苹果树荫 */}
    <circle cx="90" cy="30" r="50" fill="#34D399" opacity="0.6" />
    <circle cx="105" cy="40" r="4" fill="#EF4444" />
    <circle cx="75" cy="25" r="4" fill="#EF4444" />

    {/* 公园木长椅 */}
    <g transform="translate(130, 80)">
      <rect x="0" y="30" width="200" height="12" rx="3" fill="#D97706" stroke="#92400E" strokeWidth="2" />
      <rect x="0" y="10" width="200" height="12" rx="3" fill="#B45309" stroke="#78350F" strokeWidth="2" />
      <line x1="25" y1="42" x2="20" y2="70" stroke="#78350F" strokeWidth="4" />
      <line x1="175" y1="42" x2="180" y2="70" stroke="#78350F" strokeWidth="4" />

      {/* 两个小动物朋友平心静气并排而坐 */}
      {/* 伙伴 A (小兔) */}
      <ellipse cx="60" cy="18" rx="14" ry="16" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
      <ellipse cx="54" cy="-2" rx="3" ry="12" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
      <ellipse cx="66" cy="-2" rx="3" ry="12" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
      <circle cx="56" cy="15" r="2" fill="#000" />
      <circle cx="64" cy="15" r="2" fill="#000" />

      {/* 伙伴 B (小熊) */}
      <circle cx="140" cy="18" r="16" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
      <circle cx="128" cy="6" r="5" fill="#D97706" />
      <circle cx="152" cy="6" r="5" fill="#D97706" />
      <circle cx="135" cy="16" r="2" fill="#000" />
      <circle cx="145" cy="16" r="2" fill="#000" />
    </g>

    {/* 底部暖心标语 */}
    <g transform="translate(100, 142)">
      <rect width="260" height="24" rx="12" fill="#FFFFFF" stroke="#FDE68A" strokeWidth="1" />
      <text x="130" y="16" fontSize="11" fill="#92400E" textAnchor="middle" fontWeight="bold">
        简单大方回答 · 身体和边界都由我做主
      </text>
    </g>
  </svg>
);

/* -------------------------------------------------------------------------- */
/* 14. 平静呼吸水池插画 (Calm Breath Pond Scene Illustration)                  */
/* -------------------------------------------------------------------------- */
export const CalmBreathPondSceneIllustration: React.FC<{
  phase?: 'inhale' | 'hold' | 'exhale';
  className?: string;
}> = ({ phase = 'inhale', className = 'w-full h-auto' }) => (
  <svg
    viewBox="0 0 460 180"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label="平静深呼吸水池插画"
  >
    <defs>
      <linearGradient id="si-calmPondBg" x1="0" y1="0" x2="460" y2="180" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#CCFBF1" />
        <stop offset="100%" stopColor="#99F6E4" />
      </linearGradient>
    </defs>
    <rect width="460" height="180" rx="20" fill="url(#si-calmPondBg)" />

    {/* 同心舒缓呼吸波纹 */}
    <g transform="translate(230, 90)">
      <circle cx="0" cy="0" r="70" fill="none" stroke="#0D9488" strokeWidth="1.5" opacity="0.3" strokeDasharray="4 4" />
      <circle cx="0" cy="0" r="50" fill="none" stroke="#0D9488" strokeWidth="2" opacity="0.5" />
      <circle cx="0" cy="0" r="30" fill="#14B8A6" fillOpacity="0.25" stroke="#0F766E" strokeWidth="2.5" />

      {/* 漂浮的睡莲 */}
      <circle cx="0" cy="0" r="14" fill="#FFFFFF" stroke="#0D9488" strokeWidth="1.5" />
      <circle cx="0" cy="0" r="5" fill="#FDE047" />

      <text x="0" y="5" fontSize="12" fill="#0F766E" textAnchor="middle" fontWeight="bold">
        {phase === 'inhale' ? '深吸气' : phase === 'hold' ? '屏住' : '慢吐气'}
      </text>
    </g>

    <g transform="translate(130, 146)">
      <rect width="200" height="22" rx="11" fill="#FFFFFF" stroke="#5EEAD4" strokeWidth="1" />
      <text x="100" y="15" fontSize="11" fill="#0F766E" textAnchor="middle" fontWeight="bold">
        像小水獭一样，慢慢浮起来
      </text>
    </g>
  </svg>
);

/* -------------------------------------------------------------------------- */
/* 15. 两个家的星光暖灯插画 (Two Homes Lantern Warmth Illustration)           */
/* -------------------------------------------------------------------------- */
export const TwoHomesLanternWarmthIllustration: React.FC<{ className?: string }> = ({
  className = 'w-full h-auto',
}) => (
  <svg
    viewBox="0 0 460 170"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label="两个家的星光暖灯插画"
  >
    <defs>
      <linearGradient id="si-lanternSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1E1B4B" />
        <stop offset="60%" stopColor="#312E81" />
        <stop offset="100%" stopColor="#1E293B" />
      </linearGradient>
    </defs>
    <rect width="460" height="170" rx="20" fill="url(#si-lanternSky)" />

    {/* 星星 */}
    <circle cx="60" cy="30" r="1.5" fill="#FDE047" />
    <circle cx="120" cy="20" r="2" fill="#FDE047" />
    <circle cx="340" cy="25" r="1.5" fill="#FDE047" />
    <circle cx="410" cy="35" r="2" fill="#FDE047" />

    {/* 静谧水面 */}
    <path d="M 0 110 Q 230 95 460 110 L 460 170 L 0 170 Z" fill="#0F172A" opacity="0.9" />

    {/* 暖暖的浮水纸灯笼相聚中间 */}
    <g transform="translate(230, 125)">
      <circle cx="-25" cy="0" r="10" fill="#FEF08A" stroke="#F59E0B" strokeWidth="1.5" />
      <circle cx="25" cy="0" r="10" fill="#FEF08A" stroke="#F59E0B" strokeWidth="1.5" />
      <ellipse cx="-25" cy="8" rx="8" ry="2" fill="#FDE047" opacity="0.5" />
      <ellipse cx="25" cy="8" rx="8" ry="2" fill="#FDE047" opacity="0.5" />
    </g>

    <g transform="translate(100, 140)">
      <rect width="260" height="22" rx="11" fill="#312E81" stroke="#6366F1" strokeWidth="1" />
      <text x="130" y="15" fontSize="11" fill="#E0E7FF" textAnchor="middle" fontWeight="bold">
        无论在哪个家，天上的星星和地上的爱都在
      </text>
    </g>
  </svg>
);
