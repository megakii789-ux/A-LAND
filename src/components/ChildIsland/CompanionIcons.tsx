import React from 'react';
import { AnimalCompanionId, InterestActivityId } from '../../domain/personalization';

export type CompanionKey = AnimalCompanionId | 'squirrel' | 'otter' | 'raccoon' | 'deer';

export interface CompanionAvatarSvgProps {
  companionId: CompanionKey;
  className?: string;
}

/**
 * 晴雨小岛 · 原创绘本级四位动物伙伴 SVG 形象系统 (Decision 3)
 * 100% 原创矢量绘制：果果（小松鼠）、贝贝（小海獭）、天天（小浣熊）、奇奇（小鹿）
 * 彻底消除跨平台 Unicode Emoji (🐿️ 🦦 🦝 🦌) 缺字豆腐块 (▯) 问题。
 */
export const CompanionAvatarSvg: React.FC<CompanionAvatarSvgProps> = ({
  companionId,
  className = 'w-10 h-10',
}) => {
  switch (companionId) {
    case 'guoguo_squirrel':
    case 'squirrel':
      return (
        <svg
          viewBox="0 0 64 64"
          className={className}
          role="img"
          aria-label="小松鼠果果"
          fill="none"
        >
          <defs>
            <radialGradient id="guoguo-bg" cx="50%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#FEF3C7" />
              <stop offset="100%" stopColor="#FDE68A" />
            </radialGradient>
            <linearGradient id="guoguo-fur" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>
          <circle cx="32" cy="32" r="30" fill="url(#guoguo-bg)" stroke="#F59E0B" strokeWidth="2" />
          {/* 蓬松大尾巴 */}
          <path
            d="M44 46 C56 42 58 24 47 20 C41 18 39 25 42 30 C39 33 40 42 44 46 Z"
            fill="#D97706"
            stroke="#B45309"
            strokeWidth="1.5"
          />
          <path
            d="M46 41 C52 38 53 26 46 24"
            stroke="#FDE68A"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* 圆耳朵 */}
          <ellipse cx="20" cy="18" rx="5.5" ry="7" transform="rotate(-15 20 18)" fill="url(#guoguo-fur)" />
          <ellipse cx="20" cy="18.5" rx="3" ry="4" transform="rotate(-15 20 18.5)" fill="#FDE68A" />
          <ellipse cx="38" cy="18" rx="5.5" ry="7" transform="rotate(15 38 18)" fill="url(#guoguo-fur)" />
          <ellipse cx="38" cy="18.5" rx="3" ry="4" transform="rotate(15 38 18.5)" fill="#FDE68A" />
          {/* 脸颊与头部 */}
          <ellipse cx="29" cy="34" rx="16" ry="14.5" fill="url(#guoguo-fur)" />
          <ellipse cx="29" cy="37" rx="12" ry="10" fill="#FFFBEB" />
          {/* 橡果小帽饰 */}
          <path d="M23 18 Q29 13 35 18 Z" fill="#92400E" />
          <path d="M29 11 L29 14" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
          {/* 眼睛与腮红 */}
          <circle cx="23.5" cy="32" r="2.6" fill="#292524" />
          <circle cx="24.3" cy="31.2" r="0.9" fill="#FFFFFF" />
          <circle cx="34.5" cy="32" r="2.6" fill="#292524" />
          <circle cx="35.3" cy="31.2" r="0.9" fill="#FFFFFF" />
          <ellipse cx="19.5" cy="36" rx="3" ry="1.8" fill="#FB7185" opacity="0.55" />
          <ellipse cx="38.5" cy="36" rx="3" ry="1.8" fill="#FB7185" opacity="0.55" />
          {/* 小鼻子与微笑 */}
          <ellipse cx="29" cy="35" rx="2.2" ry="1.6" fill="#78350F" />
          <path d="M26 38.2 Q29 41 32 38.2" stroke="#78350F" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <rect x="27.6" y="39.2" width="2.8" height="2.4" rx="0.8" fill="#FFFFFF" stroke="#D97706" strokeWidth="0.6" />
        </svg>
      );

    case 'beibei_otter':
    case 'otter':
      return (
        <svg
          viewBox="0 0 64 64"
          className={className}
          role="img"
          aria-label="小海獭贝贝"
          fill="none"
        >
          <defs>
            <radialGradient id="beibei-bg" cx="50%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#E0F2FE" />
              <stop offset="100%" stopColor="#BAE6FD" />
            </radialGradient>
            <linearGradient id="beibei-fur" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A8A29E" />
              <stop offset="100%" stopColor="#78716C" />
            </linearGradient>
          </defs>
          <circle cx="32" cy="32" r="30" fill="url(#beibei-bg)" stroke="#38BDF8" strokeWidth="2" />
          {/* 小圆耳 */}
          <circle cx="17" cy="24" r="5" fill="#78716C" />
          <circle cx="17" cy="24" r="2.5" fill="#E7E5E4" />
          <circle cx="47" cy="24" r="5" fill="#78716C" />
          <circle cx="47" cy="24" r="2.5" fill="#E7E5E4" />
          {/* 水獭圆润头部 */}
          <ellipse cx="32" cy="33" rx="17" ry="15" fill="url(#beibei-fur)" />
          {/* 奶油色脸颊吻部 */}
          <ellipse cx="32" cy="37" rx="12.5" ry="9.5" fill="#F5F5F4" />
          {/* 眼睛与腮红 */}
          <circle cx="25.5" cy="30.5" r="2.6" fill="#1C1917" />
          <circle cx="26.3" cy="29.7" r="0.9" fill="#FFFFFF" />
          <circle cx="38.5" cy="30.5" r="2.6" fill="#1C1917" />
          <circle cx="39.3" cy="29.7" r="0.9" fill="#FFFFFF" />
          <ellipse cx="21" cy="35" rx="3" ry="1.8" fill="#FDA4AF" opacity="0.6" />
          <ellipse cx="43" cy="35" rx="3" ry="1.8" fill="#FDA4AF" opacity="0.6" />
          {/* 水獭菱形鼻与胡须 */}
          <polygon points="32,32.5 29.2,35.5 32,37 34.8,35.5" fill="#44403C" />
          <path d="M29 38.5 Q32 40.8 35 38.5" stroke="#44403C" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <path d="M18 35 L23 36 M18 38 L23 38" stroke="#A8A29E" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M46 35 L41 36 M46 38 L41 38" stroke="#A8A29E" strokeWidth="1.3" strokeLinecap="round" />
          {/* 胸前小贝壳领结 */}
          <path d="M27 48 C29 45 35 45 37 48 C36 52 28 52 27 48 Z" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.2" />
        </svg>
      );

    case 'tiantian_raccoon':
    case 'raccoon':
      return (
        <svg
          viewBox="0 0 64 64"
          className={className}
          role="img"
          aria-label="小浣熊天天"
          fill="none"
        >
          <defs>
            <radialGradient id="tiantian-bg" cx="50%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#E0E7FF" />
              <stop offset="100%" stopColor="#C7D2FE" />
            </radialGradient>
          </defs>
          <circle cx="32" cy="32" r="30" fill="url(#tiantian-bg)" stroke="#6366F1" strokeWidth="2" />
          {/* 尖耳朵 */}
          <polygon points="16,26 19,14 27,21" fill="#64748B" stroke="#475569" strokeWidth="1.5" strokeLinejoin="round" />
          <polygon points="18,24 20,17 25,21" fill="#E2E8F0" />
          <polygon points="48,26 45,14 37,21" fill="#64748B" stroke="#475569" strokeWidth="1.5" strokeLinejoin="round" />
          <polygon points="46,24 44,17 39,21" fill="#E2E8F0" />
          {/* 头部 */}
          <ellipse cx="32" cy="34" rx="17" ry="14.5" fill="#94A3B8" />
          {/* 白色眉心与脸颊 */}
          <path d="M16 34 Q24 26 32 33 Q40 26 48 34 Q45 45 32 46 Q19 45 16 34 Z" fill="#F8FAFC" />
          {/* 标志性深色眼罩 */}
          <ellipse cx="24.5" cy="32.5" rx="6" ry="4.5" transform="rotate(-8 24.5 32.5)" fill="#334155" />
          <ellipse cx="39.5" cy="32.5" rx="6" ry="4.5" transform="rotate(8 39.5 32.5)" fill="#334155" />
          {/* 亮晶晶的眼睛 */}
          <circle cx="25" cy="32.5" r="2.4" fill="#FFFFFF" />
          <circle cx="25.4" cy="32.5" r="1.4" fill="#0F172A" />
          <circle cx="39" cy="32.5" r="2.4" fill="#FFFFFF" />
          <circle cx="39.4" cy="32.5" r="1.4" fill="#0F172A" />
          {/* 鼻子与微笑 */}
          <ellipse cx="32" cy="36.5" rx="2.5" ry="1.8" fill="#1E293B" />
          <path d="M28.5 39.8 Q32 42.5 35.5 39.8" stroke="#334155" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          {/* 腮红 */}
          <ellipse cx="20" cy="38" rx="2.6" ry="1.5" fill="#FB7185" opacity="0.5" />
          <ellipse cx="44" cy="38" rx="2.6" ry="1.5" fill="#FB7185" opacity="0.5" />
        </svg>
      );

    case 'qiqi_deer':
    case 'deer':
    default:
      return (
        <svg
          viewBox="0 0 64 64"
          className={className}
          role="img"
          aria-label="小鹿奇奇"
          fill="none"
        >
          <defs>
            <radialGradient id="qiqi-bg" cx="50%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#D1FAE5" />
              <stop offset="100%" stopColor="#A7F3D0" />
            </radialGradient>
            <linearGradient id="qiqi-fur" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>
          <circle cx="32" cy="32" r="30" fill="url(#qiqi-bg)" stroke="#10B981" strokeWidth="2" />
          {/* 可爱小鹿角 */}
          <path
            d="M24 20 L21 12 M22.5 16 L18 14"
            stroke="#92400E"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <path
            d="M40 20 L43 12 M41.5 16 L46 14"
            stroke="#92400E"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          {/* 鹿耳 */}
          <ellipse cx="16.5" cy="24" rx="6" ry="3.2" transform="rotate(-25 16.5 24)" fill="url(#qiqi-fur)" />
          <ellipse cx="16.5" cy="24" rx="3.5" ry="1.6" transform="rotate(-25 16.5 24)" fill="#FDE68A" />
          <ellipse cx="47.5" cy="24" rx="6" ry="3.2" transform="rotate(25 47.5 24)" fill="url(#qiqi-fur)" />
          <ellipse cx="47.5" cy="24" rx="3.5" ry="1.6" transform="rotate(25 47.5 24)" fill="#FDE68A" />
          {/* 头部 */}
          <ellipse cx="32" cy="35" rx="15" ry="14" fill="url(#qiqi-fur)" />
          <ellipse cx="32" cy="39" rx="10.5" ry="8.5" fill="#FFFBEB" />
          {/* 额头梅花斑点 */}
          <circle cx="29" cy="25" r="1.4" fill="#FFFBEB" opacity="0.9" />
          <circle cx="35" cy="25" r="1.4" fill="#FFFBEB" opacity="0.9" />
          <circle cx="32" cy="22.5" r="1.4" fill="#FFFBEB" opacity="0.9" />
          {/* 眼睛与腮红 */}
          <circle cx="25.5" cy="33" r="2.6" fill="#292524" />
          <circle cx="26.3" cy="32.2" r="0.9" fill="#FFFFFF" />
          <circle cx="38.5" cy="33" r="2.6" fill="#292524" />
          <circle cx="39.3" cy="32.2" r="0.9" fill="#FFFFFF" />
          <ellipse cx="21" cy="37" rx="2.8" ry="1.6" fill="#FB7185" opacity="0.55" />
          <ellipse cx="43" cy="37" rx="2.8" ry="1.6" fill="#FB7185" opacity="0.55" />
          {/* 鼻子与微笑 */}
          <ellipse cx="32" cy="36.5" rx="2.2" ry="1.5" fill="#78350F" />
          <path d="M29 39.8 Q32 42.2 35 39.8" stroke="#78350F" strokeWidth="1.7" strokeLinecap="round" fill="none" />
        </svg>
      );
  }
};

export interface InterestBadgeSvgProps {
  interestId: InterestActivityId;
  className?: string;
}

/**
 * 晴雨小岛 · 儿童兴趣徽章原创 SVG 图标
 */
export const InterestBadgeSvg: React.FC<InterestBadgeSvgProps> = ({
  interestId,
  className = 'w-6 h-6',
}) => {
  switch (interestId) {
    case 'drawing':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none">
          <path
            d="M12 3C7.03 3 3 6.58 3 11C3 15.42 7.03 19 12 19C13.38 19 14.5 17.88 14.5 16.5C14.5 15.86 14.26 15.27 13.86 14.83C13.48 14.41 13.25 13.86 13.25 13.25C13.25 11.87 14.37 10.75 15.75 10.75H17.5C19.99 10.75 22 8.74 22 6.25C22 4.45 17.52 3 12 3Z"
            fill="#FDE68A"
            stroke="#D97706"
            strokeWidth="1.5"
          />
          <circle cx="7.5" cy="10.5" r="1.5" fill="#EF4444" />
          <circle cx="11" cy="7.5" r="1.5" fill="#3B82F6" />
          <circle cx="15.5" cy="7.5" r="1.5" fill="#10B981" />
        </svg>
      );
    case 'sports':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none">
          <circle cx="12" cy="12" r="9" fill="#F8FAFC" stroke="#0F172A" strokeWidth="1.8" />
          <polygon points="12,8 15.5,10.5 14.2,14.5 9.8,14.5 8.5,10.5" fill="#1E293B" />
          <path d="M12 3V8M15.5 10.5L20.5 9M14.2 14.5L17.5 19M9.8 14.5L6.5 19M8.5 10.5L3.5 9" stroke="#334155" strokeWidth="1.5" />
        </svg>
      );
    case 'nature':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none">
          <polygon points="12,3 5,13 9,13 6,18 18,18 15,13 19,13" fill="#34D399" stroke="#059669" strokeWidth="1.6" strokeLinejoin="round" />
          <rect x="10.5" y="18" width="3" height="3.5" rx="0.8" fill="#78350F" />
        </svg>
      );
    case 'puzzle':
    default:
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none">
          <rect x="4" y="12" width="7.5" height="7.5" rx="2" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
          <rect x="12.5" y="12" width="7.5" height="7.5" rx="2" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />
          <polygon points="12,3.5 6.5,10.5 17.5,10.5" fill="#FB7185" stroke="#E11D48" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );
  }
};

export type IslandUiIconName =
  | 'island_brand'
  | 'map_compass'
  | 'card_grid'
  | 'interactive_games'
  | 'medals_star'
  | 'calm_leaf'
  | 'hug_heart'
  | 'detective_hammer'
  | 'waiting_lantern'
  | 'mom_home'
  | 'dad_home';

export interface IslandUiIconSvgProps {
  name: IslandUiIconName;
  className?: string;
}

/**
 * 晴雨小岛 · 关键导航与操作原创 SVG 图标
 */
export const IslandUiIconSvg: React.FC<IslandUiIconSvgProps> = ({
  name,
  className = 'w-5 h-5',
}) => {
  switch (name) {
    case 'island_brand':
      return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
          <circle cx="11" cy="11" r="6" fill="#FDE047" stroke="#F59E0B" strokeWidth="1.5" />
          <path
            d="M11 21H23C25.5 21 27.5 19 27.5 16.5C27.5 14.1 25.7 12.2 23.4 12C22.5 8.8 19.6 6.5 16 6.5C11.9 6.5 8.5 9.8 8.5 14C8.5 14.3 8.5 14.6 8.6 14.9C6.6 15.4 5.2 17.2 5.2 19.3C5.2 20.3 6 21 7 21H11Z"
            fill="#FFFFFF"
            stroke="#0284C7"
            strokeWidth="1.8"
          />
          <path d="M5 26.5C9.5 22.5 22.5 22.5 27 26.5Z" fill="#34D399" stroke="#059669" strokeWidth="1.6" />
        </svg>
      );
    case 'map_compass':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none">
          <polygon points="3,6 9,3 15,6 21,3 21,18 15,21 9,18 3,21" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.8" strokeLinejoin="round" />
          <line x1="9" y1="3" x2="9" y2="18" stroke="#D97706" strokeWidth="1.5" />
          <line x1="15" y1="6" x2="15" y2="21" stroke="#D97706" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="2.2" fill="#10B981" />
        </svg>
      );
    case 'card_grid':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none">
          <rect x="3" y="3" width="8" height="8" rx="2" fill="#BAE6FD" stroke="#0284C7" strokeWidth="1.8" />
          <rect x="13" y="3" width="8" height="8" rx="2" fill="#FDE68A" stroke="#D97706" strokeWidth="1.8" />
          <rect x="3" y="13" width="8" height="8" rx="2" fill="#A7F3D0" stroke="#059669" strokeWidth="1.8" />
          <rect x="13" y="13" width="8" height="8" rx="2" fill="#FECDD3" stroke="#E11D48" strokeWidth="1.8" />
        </svg>
      );
    case 'interactive_games':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none">
          <rect x="2.5" y="6" width="19" height="12" rx="6" fill="#FEF3C7" stroke="#B45309" strokeWidth="1.8" />
          <path d="M8.5 10V14M6.5 12H10.5" stroke="#92400E" strokeWidth="2" strokeLinecap="round" />
          <circle cx="15.5" cy="10.8" r="1.4" fill="#E11D48" />
          <circle cx="17.8" cy="13.2" r="1.4" fill="#0284C7" />
        </svg>
      );
    case 'medals_star':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none">
          <path d="M8 14L6 21L12 18L18 21L16 14" fill="#F59E0B" stroke="#B45309" strokeWidth="1.6" strokeLinejoin="round" />
          <circle cx="12" cy="9.5" r="6.5" fill="#FDE047" stroke="#CA8A04" strokeWidth="1.8" />
          <polygon points="12,5.5 13.2,8.1 16,8.4 13.9,10.3 14.5,13 12,11.6 9.5,13 10.1,10.3 8,8.4 10.8,8.1" fill="#D97706" />
        </svg>
      );
    case 'calm_leaf':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none">
          <path d="M17 4C10.5 4 5 8.5 5 15.5C5 17.5 5.8 19 6.8 20C13.5 20 19 15 19 7.5C19 5.5 18.2 4 17 4Z" fill="#6EE7B7" stroke="#059669" strokeWidth="1.8" />
          <path d="M5.5 19.5C8.5 15.5 11.5 12.5 15.5 8.5" stroke="#047857" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'hug_heart':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none">
          <path
            d="M12 20.5C12 20.5 4 15.2 4 9.2C4 6.4 6.2 4.2 9 4.2C10.6 4.2 12 5 12 5C12 5 13.4 4.2 15 4.2C17.8 4.2 20 6.4 20 9.2C20 15.2 12 20.5 12 20.5Z"
            fill="#FFE4E6"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'detective_hammer':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none">
          <rect x="4" y="4" width="11" height="6" rx="2" transform="rotate(-15 4 4)" fill="#FEF3C7" stroke="#92400E" strokeWidth="1.8" />
          <path d="M11 10L18 19" stroke="#78350F" strokeWidth="2.8" strokeLinecap="round" />
        </svg>
      );
    case 'waiting_lantern':
      return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
          <circle cx="16" cy="17" r="10" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" />
          <circle cx="16" cy="17" r="5" fill="#FBBF24" />
          <path d="M12 7H20M16 4V7" stroke="#B45309" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'mom_home':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none">
          <polygon points="3,11 12,3 21,11" fill="#FDA4AF" stroke="#E11D48" strokeWidth="1.6" strokeLinejoin="round" />
          <rect x="5.5" y="11" width="13" height="9.5" rx="1.5" fill="#FFF1F2" stroke="#E11D48" strokeWidth="1.6" />
          <path d="M12 17.5C12 17.5 9.5 15.6 9.5 13.8C9.5 12.8 10.3 12 11.2 12C11.7 12 12 12.3 12 12.3C12 12.3 12.3 12 12.8 12C13.7 12 14.5 12.8 14.5 13.8C14.5 15.6 12 17.5 12 17.5Z" fill="#F43F5E" />
        </svg>
      );
    case 'dad_home':
    default:
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none">
          <polygon points="3,11 12,3 21,11" fill="#7DD3FC" stroke="#0284C7" strokeWidth="1.6" strokeLinejoin="round" />
          <rect x="5.5" y="11" width="13" height="9.5" rx="1.5" fill="#F0F9FF" stroke="#0284C7" strokeWidth="1.6" />
          <polygon points="12,12 13,14.2 15.4,14.5 13.6,16.1 14.1,18.4 12,17.2 9.9,18.4 10.4,16.1 8.6,14.5 11,14.2" fill="#0284C7" />
        </svg>
      );
  }
};
